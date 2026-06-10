import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, User, Tag, ShieldCheck } from 'lucide-react';

export default function Timeline({ user, token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin update form state
  const [adminForm, setAdminForm] = useState({
    status: '',
    assignedStaff: '',
    estimatedResolutionTime: '',
    notes: ''
  });
  const [updating, setUpdating] = useState(false);

  const fetchIssue = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/issues/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch issue details');
      }

      setIssue(data);
      // Initialize admin form with current values
      setAdminForm({
        status: data.status,
        assignedStaff: data.assignedStaff || '',
        estimatedResolutionTime: data.estimatedResolutionTime || '',
        notes: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) {
      fetchIssue();
    }
  }, [token, id]);

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');

    try {
      const response = await fetch(`/api/issues/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adminForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update issue');
      }

      // Refresh issue details
      setIssue(data);
      setAdminForm(prev => ({ ...prev, notes: '' })); // clear notes
      alert('Issue status and timeline logs updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="content-container">
        {/* Back button skeleton */}
        <div className="skeleton" style={{ width: '150px', height: '35px', marginBottom: '1.5rem', borderRadius: 'var(--radius-sm)' }}></div>
        
        <div className="grid timeline-grid">
          {/* Left Details Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card animate-fade-in" style={{ padding: '0', cursor: 'default' }}>
              <div className="skeleton aspect-video" style={{ borderBottom: '1px solid var(--border-color)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}></div>
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div className="skeleton" style={{ width: '80px', height: '20px', borderRadius: '9999px' }}></div>
                  <div className="skeleton" style={{ width: '100px', height: '20px', borderRadius: '9999px' }}></div>
                </div>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text" style={{ width: '100%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '95%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '85%' }}></div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', gap: '1.5rem' }}>
                  <div style={{ flex: 1 }}><div className="skeleton" style={{ width: '60px', height: '12px', marginBottom: '8px' }}></div><div className="skeleton" style={{ width: '100px', height: '16px' }}></div></div>
                  <div style={{ flex: 1 }}><div className="skeleton" style={{ width: '60px', height: '12px', marginBottom: '8px' }}></div><div className="skeleton" style={{ width: '100px', height: '16px' }}></div></div>
                  <div style={{ flex: 1 }}><div className="skeleton" style={{ width: '60px', height: '12px', marginBottom: '8px' }}></div><div className="skeleton" style={{ width: '100px', height: '16px' }}></div></div>
                </div>
              </div>
            </div>
            {user?.role === 'admin' && (
              <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="skeleton" style={{ width: '150px', height: '20px' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '35px' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '35px' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '80px' }}></div>
                <div className="skeleton skeleton-btn"></div>
              </div>
            )}
          </div>
          
          {/* Right Timeline Logs Skeleton */}
          <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
            <div className="skeleton" style={{ width: '200px', height: '24px', marginBottom: '1.5rem' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '2rem', position: 'relative' }}>
              {Array(3).fill(0).map((_, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <div className="skeleton skeleton-circle" style={{ position: 'absolute', left: '-42px', top: '0', width: '18px', height: '18px', border: '4px solid var(--bg-card)', backgroundColor: 'var(--border-color)' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div className="skeleton" style={{ width: '85px', height: '16px' }}></div>
                    <div className="skeleton" style={{ width: '120px', height: '12px' }}></div>
                  </div>
                  <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: 'var(--radius-sm)' }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !issue) {
    return (
      <div className="content-container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h3 style={{ color: 'var(--status-pending)', marginBottom: '1rem' }}>Error Loading Details</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      {/* Back button */}
      <button 
        onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')} 
        className="btn btn-secondary"
        style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Directory</span>
      </button>

      {/* Grid: Details (Left/Top) & Timeline (Right/Bottom) */}
      <div className="grid timeline-grid animate-fade-in" style={{ gap: '2rem' }}>
        
        {/* Issue Details Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '0' }}>
            {/* Image Banner / Placeholder */}
            {issue.image ? (
              <div className="aspect-video" style={{
                backgroundImage: `url(${issue.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderBottom: '1px solid var(--border-color)',
                position: 'relative'
              }}>
                <span className={`badge badge-${issue.status}`} style={{ position: 'absolute', top: '15px', right: '15px' }}>
                  {issue.status}
                </span>
              </div>
            ) : (
              <div className="aspect-video" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                borderBottom: '1px solid var(--border-color)',
                position: 'relative',
                backgroundColor: 'rgba(30, 41, 59, 0.5)'
              }}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', opacity: 0.45 }}>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>No Image Uploaded</span>
                <span className={`badge badge-${issue.status}`} style={{ position: 'absolute', top: '15px', right: '15px' }}>
                  {issue.status}
                </span>
              </div>
            )}


            {/* Content body */}
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="badge badge-low" style={{ textTransform: 'capitalize' }}>
                  <Tag size={12} style={{ marginRight: '4px' }} />
                  {issue.category}
                </span>
                <span className={`badge badge-${issue.priority}`}>
                  {issue.priority} Priority
                </span>
              </div>

              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{issue.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                {issue.description}
              </p>

              {/* Specs Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> Location
                  </div>
                  <strong>{issue.location}</strong>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={14} /> Reporter
                  </div>
                  <strong>{issue.reporterName}</strong>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> Reported Date
                  </div>
                  <strong>{new Date(issue.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>

              {/* Maintenance Specs Row */}
              {(issue.assignedStaff || issue.estimatedResolutionTime) && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  marginTop: '1.5rem',
                  fontSize: '0.85rem'
                }}>
                  {issue.assignedStaff && (
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Assigned Staff:</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {issue.assignedStaff}
                      </div>
                    </div>
                  )}
                  {issue.estimatedResolutionTime && (
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Est. Resolution Time:</span>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary)', marginTop: '2px' }}>
                        {issue.estimatedResolutionTime}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Admin Management Panel overlay */}
          {user?.role === 'admin' && (
            <div className="card" style={{ border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} className="text-primary" />
                <span>Admin Action Center</span>
              </h3>

              <form onSubmit={handleAdminUpdate}>
                <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label">Repair Status</label>
                    <select
                      className="input-control"
                      value={adminForm.status}
                      onChange={(e) => setAdminForm({ ...adminForm, status: e.target.value })}
                    >
                      <option value="pending">Pending Review</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved / Fixed</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label">Assigned Staff / Vendor</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="e.g., Plumber Dave, Acme Electric"
                      value={adminForm.assignedStaff}
                      onChange={(e) => setAdminForm({ ...adminForm, assignedStaff: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Resolution Time</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g., 2 days, By Friday morning, Completed"
                    value={adminForm.estimatedResolutionTime}
                    onChange={(e) => setAdminForm({ ...adminForm, estimatedResolutionTime: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Update Logs & Progress Note</label>
                  <textarea
                    rows="2"
                    className="input-control"
                    placeholder="Describe actions taken (e.g. dispatched crew, parts ordered)..."
                    value={adminForm.notes}
                    onChange={(e) => setAdminForm({ ...adminForm, notes: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  disabled={updating}
                >
                  {updating ? 'Saving Update...' : 'Commit Repair Update'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Timeline Log History Column */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            Repair Tracking History
          </h3>

          <div className="timeline-list" style={{ flex: '1' }}>
            {issue.timeline && issue.timeline.length > 0 ? (
              issue.timeline.map((event, index) => (
                <div key={index} className="timeline-item">
                  {/* Status Indicator circle */}
                  <div className={`timeline-dot timeline-dot-${event.status}`}></div>
                  
                  <div className="timeline-header">
                    <strong style={{ textTransform: 'capitalize', fontSize: '0.95rem' }}>
                      {event.status === 'in-progress' ? 'WIP (In Progress)' : event.status}
                    </strong>
                    <span className="timeline-time">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="timeline-notes">
                    {event.notes}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
                No events logged on this timeline yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
