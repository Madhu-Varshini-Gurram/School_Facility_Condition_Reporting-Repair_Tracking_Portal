const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET api/issues
// @desc    Get all issues for the user's school with optional filters
// @access  Private
router.get('/', auth, async (req, res) => {
  const { status, priority, category } = req.query;
  const filter = { schoolId: req.user.schoolId };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;

  try {
    // If not admin, do we filter issues to only the ones reported by this user?
    // The guidelines say:
    // Parents/Teachers: "Track issue status, receive updates, Dashboard Module: overview of reported issues"
    // Let's allow users to see all issues in their school to increase transparency (which is a core goal!),
    // but also allow them to filter to "My Reports".
    const { myReports } = req.query;
    if (myReports === 'true') {
      filter.reporter = req.user.id;
    }

    const issues = await db.issues.find(filter);
    res.json(issues);
  } catch (err) {
    console.error('Fetch issues error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/issues/stats
// @desc    Get stats for dashboard charts
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const issues = await db.issues.find({ schoolId: req.user.schoolId });
    
    const stats = {
      total: issues.length,
      pending: issues.filter(i => i.status === 'pending').length,
      inProgress: issues.filter(i => i.status === 'in-progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
      
      // Categorized stats
      categories: {},
      // Priority stats
      priorities: {
        low: issues.filter(i => i.priority === 'low').length,
        medium: issues.filter(i => i.priority === 'medium').length,
        high: issues.filter(i => i.priority === 'high').length
      }
    };

    issues.forEach(i => {
      stats.categories[i.category] = (stats.categories[i.category] || 0) + 1;
    });

    res.json(stats);
  } catch (err) {
    console.error('Fetch stats error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/issues/:id
// @desc    Get issue by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const issue = await db.issues.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    // Verify user is in the same school
    if (issue.schoolId !== req.user.schoolId) {
      return res.status(403).json({ message: 'Access denied: different school context' });
    }
    res.json(issue);
  } catch (err) {
    console.error('Fetch single issue error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/issues
// @desc    Report a new issue
// @access  Private
// Helper: validate base64 image (type + size)
const validateBase64Image = (base64String) => {
  if (!base64String) return { valid: true }; // no image is allowed

  // Check if it is a data URI
  const match = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9+.]+);base64,(.+)$/);
  if (!match) {
    // If it starts with http it is an external URL – skip validation
    if (base64String.startsWith('http')) return { valid: true };
    return { valid: false, message: 'Invalid image format. Must be a base64 data URI.' };
  }

  const mimeType = match[1].toLowerCase();
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(mimeType)) {
    return { valid: false, message: `Unsupported image type "${mimeType}". Allowed types: JPEG, PNG, WebP.` };
  }

  // Calculate approximate byte size from base64 length
  const base64Data = match[2];
  const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
  if (sizeInBytes > maxSizeBytes) {
    return { valid: false, message: `Image too large (${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is 5 MB.` };
  }

  return { valid: true };
};

router.post('/', auth, async (req, res) => {
  const { title, description, category, location, priority, image } = req.body;

  if (!title || !description || !category || !location || !priority) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  // Validate uploaded image (if any)
  const imageValidation = validateBase64Image(image);
  if (!imageValidation.valid) {
    return res.status(400).json({ message: imageValidation.message });
  }

  // Only store the image the user actually uploaded; null means "no image"
  const finalImage = image || null;


  try {
    const newIssue = await db.issues.create({
      title,
      description,
      category,
      location,
      priority,
      status: 'pending',
      reporter: req.user.id,
      reporterName: req.user.name,
      schoolId: req.user.schoolId,
      image: finalImage,
      timeline: [
        {
          status: 'pending',
          notes: `Issue reported by ${req.user.name} (${req.user.role}).`,
          timestamp: new Date()
        }
      ]
    });

    // Notify admins about the new issue
    const admins = await db.users.find({ role: 'admin', schoolId: req.user.schoolId });
    for (const admin of admins) {
      await db.notifications.create({
        recipient: admin._id,
        message: `New High-priority issue reported: "${title}" at ${location}.`,
        issueId: newIssue._id
      });
    }

    res.status(201).json(newIssue);
  } catch (err) {
    console.error('Report issue error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/issues/:id
// @desc    Update an issue (status, assignments, timeline)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { status, assignedStaff, estimatedResolutionTime, notes } = req.body;

  try {
    const issue = await db.issues.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Verify user is authorized
    if (issue.schoolId !== req.user.schoolId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only Admin can modify repair status/assignments
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (assignedStaff !== undefined) updates.assignedStaff = assignedStaff;
    if (estimatedResolutionTime !== undefined) updates.estimatedResolutionTime = estimatedResolutionTime;

    const timelineEvent = {
      status: status || issue.status,
      notes: notes || `Update applied by Administrator.`,
      timestamp: new Date()
    };

    const updatedIssue = await db.issues.findByIdAndUpdate(req.params.id, {
      $set: updates,
      $push: { timeline: timelineEvent }
    });

    // Notify the reporter of the status update
    await db.notifications.create({
      recipient: issue.reporter,
      message: `Your reported issue "${issue.title}" has been updated to "${status || issue.status}". Notes: ${notes || 'No notes added'}`,
      issueId: issue._id
    });

    res.json(updatedIssue);
  } catch (err) {
    console.error('Update issue error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
