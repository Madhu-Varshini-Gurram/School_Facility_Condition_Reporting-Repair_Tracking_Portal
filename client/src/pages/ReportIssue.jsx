import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Upload, AlertCircle, Camera, Check } from 'lucide-react';

export default function ReportIssue({ token }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Furniture',
    location: '',
    priority: 'medium',
    image: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Process selected image file, convert to base64 string for preview and upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file must be under 2MB in size.');
        return;
      }
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Quick custom validations
    if (formData.title.length < 5) {
      setError('Please provide a descriptive title (at least 5 characters).');
      return;
    }
    if (formData.description.length < 15) {
      setError('Please provide more description details (at least 15 characters).');
      return;
    }
    if (!formData.location) {
      setError('Please specify the exact location of the infrastructure issue.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }

      setSubmitted(true);
      setFormData({
        title: '',
        description: '',
        category: 'Furniture',
        location: '',
        priority: 'medium',
        image: ''
      });
      setPreview(null);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Something went wrong while reporting the issue.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="content-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card animate-fade-in" style={{ textAlign: 'center', maxWidth: '400px', padding: '3rem 2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-resolved-light)',
            color: 'var(--status-resolved)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <Check size={36} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Report Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            The infrastructure report has been recorded. Administrators have been notified. Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container" style={{ maxWidth: '800px' }}>
      {/* Back button */}
      <button 
        onClick={() => navigate('/dashboard')} 
        className="btn btn-secondary"
        style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Report Infrastructure Issue</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Help us maintain a safe school environment by providing detailed, accurate reports of infrastructure damage.
        </p>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: 'var(--status-pending-light)',
          color: 'var(--status-pending)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-2 animate-fade-in" style={{ gap: '2rem' }}>
        
        {/* Form elements */}
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
          <div className="form-group">
            <label className="form-label">Issue Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g., Broken fan in Classroom 3B"
              className="input-control"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              className="input-control"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Furniture">Furniture & Desks</option>
              <option value="Sanitation">Sanitation & Washrooms</option>
              <option value="Electrical">Electrical & Fans</option>
              <option value="Structural">Structural & Classroom walls</option>
              <option value="Safety">Safety & Hazards</option>
              <option value="Other">Other / Miscellaneous</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Exact Location</label>
            <input
              type="text"
              name="location"
              placeholder="e.g., Main building, Floor 2, Room 204"
              className="input-control"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['low', 'medium', 'high'].map((lvl) => (
                <label key={lvl} style={{
                  flex: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.6rem 0.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: formData.priority === lvl ? `var(--status-${lvl === 'low' ? 'resolved' : lvl === 'medium' ? 'inprogress' : 'pending'}-light)` : 'var(--bg-input)',
                  color: formData.priority === lvl ? `var(--status-${lvl === 'low' ? 'resolved' : lvl === 'medium' ? 'inprogress' : 'pending'})` : 'var(--text-secondary)',
                  borderColor: formData.priority === lvl ? `var(--status-${lvl === 'low' ? 'resolved' : lvl === 'medium' ? 'inprogress' : 'pending'})` : 'var(--border-color)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '0.8rem',
                  transition: 'all var(--transition-fast)'
                }}>
                  <input
                    type="radio"
                    name="priority"
                    value={lvl}
                    checked={formData.priority === lvl}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  {lvl}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description Details</label>
            <textarea
              name="description"
              rows="4"
              placeholder="Provide a description of the condition, safety issues, and what needs repair..."
              className="input-control"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading || submitted}
          >
            <Send size={18} />
            <span>{loading ? 'Submitting Report...' : 'Submit Condition Report'}</span>
          </button>
        </form>

        {/* Media upload column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: '2px', flex: '1', minHeight: '300px' }}>
            {preview ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                <img 
                  src={preview} 
                  alt="Issue preview" 
                  style={{
                    width: '100%',
                    maxHeight: '260px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '1rem'
                  }} 
                />
                <button 
                  onClick={() => { setPreview(null); setFormData({ ...formData, image: '' }); }}
                  className="btn btn-danger"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-input)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  color: 'var(--text-secondary)'
                }}>
                  <Camera size={28} />
                </div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Upload Photo of Condition</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '240px', margin: '0 auto 1.5rem auto' }}>
                  Upload clear photos showing the damage to help repairs teams understand what tools are required.
                </p>
                <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                  <Upload size={16} />
                  <span>Choose Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}
          </div>
          
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'rgba(30, 41, 59, 0.2)' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} style={{ color: 'var(--color-primary)' }} />
              Important Guideline
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Report issues directly to aid the school maintenance office. If you notice hazardous electrical wires, major water leaks, or collapsed desks that pose immediate physical danger to children, mark them as <strong>HIGH PRIORITY</strong>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
