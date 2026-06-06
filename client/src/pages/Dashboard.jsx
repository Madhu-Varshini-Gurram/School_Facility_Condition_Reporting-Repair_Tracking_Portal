import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, Clock, Wrench, CheckCircle, Search, 
  Filter, PlusCircle, Calendar, MapPin, Eye, AlertTriangle 
} from 'lucide-react';

export default function Dashboard({ user, token }) {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showMyReports, setShowMyReports] = useState(false);

  const fetchIssuesAndStats = async () => {
    setLoading(true);
    try {
      // Build issues query params
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (showMyReports) params.append('myReports', 'true');

      // Fetch issues list
      const issuesRes = await fetch(`/api/issues?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const issuesData = await issuesRes.json();

      // Fetch stats
      const statsRes = await fetch('/api/issues/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const statsData = await statsRes.json();

      if (issuesRes.ok) setIssues(issuesData);
      if (statsRes.ok) setStats(statsData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchIssuesAndStats();
    }
  }, [token, statusFilter, priorityFilter, categoryFilter, showMyReports]);

  // Handle local text search filtering on issues list
  const filteredIssues = issues.filter(issue => {
    const term = searchQuery.toLowerCase();
    return (
      issue.title.toLowerCase().includes(term) ||
      issue.description.toLowerCase().includes(term) ||
      issue.location.toLowerCase().includes(term) ||
      issue.reporterName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="content-container">
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>School Infrastructure Status</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Monitoring safety conditions and maintenance progress for <strong>School ID: {user?.schoolId}</strong>
          </p>
        </div>
        {user?.role !== 'admin' && (
          <Link to="/report" className="btn btn-primary animate-fade-in">
            <PlusCircle size={18} />
            <span>Report New Issue</span>
          </Link>
        )}
      </div>

      {/* Stats Counter Section */}
      <div className="stats-grid animate-fade-in">
        {loading ? (
          Array(4).fill(0).map((_, idx) => (
            <div key={idx} className="stat-card" style={{ cursor: 'default' }}>
              <div className="skeleton skeleton-circle" style={{ flexShrink: 0 }}></div>
              <div className="stat-info" style={{ width: '100%' }}>
                <div className="skeleton" style={{ width: '40px', height: '24px', marginBottom: '6px' }}></div>
                <div className="skeleton" style={{ width: '90px', height: '14px' }}></div>
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-primary)' }}>
                <ClipboardList size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Reported</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'var(--status-pending-light)', color: 'var(--status-pending)' }}>
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.pending || 0}</div>
                <div className="stat-label">Pending Reviews</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'var(--status-inprogress-light)', color: 'var(--status-inprogress)' }}>
                <Wrench size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.inProgress || 0}</div>
                <div className="stat-label">In Progress</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'var(--status-resolved-light)', color: 'var(--status-resolved)' }}>
                <CheckCircle size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.resolved || 0}</div>
                <div className="stat-label">Resolved Repairs</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter and Search Panel */}
      <div className="card animate-fade-in" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              placeholder="Search by issue title, details or location..."
              className="input-control"
              style={{ paddingLeft: '2.5rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filtering options */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <select
              className="input-control"
              style={{ width: 'auto', padding: '0.6rem 2rem 0.6rem 1rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Electrical">Electrical</option>
              <option value="Furniture">Furniture</option>
              <option value="Structural">Structural</option>
              <option value="Safety">Safety</option>
              <option value="Other">Other</option>
            </select>

            <select
              className="input-control"
              style={{ width: 'auto', padding: '0.6rem 2rem 0.6rem 1rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              className="input-control"
              style={{ width: 'auto', padding: '0.6rem 2rem 0.6rem 1rem' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            {user?.role !== 'admin' && (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                userSelect: 'none',
                marginLeft: '0.5rem'
              }}>
                <input
                  type="checkbox"
                  checked={showMyReports}
                  onChange={(e) => setShowMyReports(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                My Reports
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Issues Grid List */}
      {loading ? (
        <div className="grid grid-3">
          {Array(3).fill(0).map((_, idx) => (
            <div key={idx} className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0', cursor: 'default' }}>
              <div className="skeleton aspect-video" style={{ borderBottom: '1px solid var(--border-color)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}></div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: '1', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div className="skeleton" style={{ width: '70px', height: '20px', borderRadius: '9999px' }}></div>
                  <div className="skeleton" style={{ width: '90px', height: '20px', borderRadius: '9999px' }}></div>
                </div>
                <div className="skeleton skeleton-title" style={{ marginTop: '0.25rem' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '100%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '40%', marginTop: 'auto' }}></div>
              </div>
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <div className="skeleton skeleton-btn"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="card animate-fade-in" style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <AlertTriangle size={48} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '1.5rem' }}>No issues found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            There are currently no reported issues matching your filter criteria. 
            If you spotted broken furniture, structural damage, sanitation concerns, or electrical hazards, please submit a report.
          </p>
          {user?.role !== 'admin' && (
            <Link to="/report" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <PlusCircle size={18} />
              <span>Submit First Report</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-3 animate-fade-in">
          {filteredIssues.map((issue) => (
            <div key={issue._id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0' }}>
              
              {/* Card Header Image / Placeholder */}
              {issue.image ? (
                <div style={{
                  height: '180px',
                  backgroundImage: `url(${issue.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <span className="badge badge-low" style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: 'white',
                    borderColor: 'var(--border-color)',
                    textTransform: 'capitalize'
                  }}>
                    {issue.category}
                  </span>
                </div>
              ) : (
                <div style={{
                  height: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  position: 'relative',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)'
                }}>
                  {/* Camera SVG icon */}
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>No Image Uploaded</span>
                  <span className="badge badge-low" style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: 'white',
                    borderColor: 'var(--border-color)',
                    textTransform: 'capitalize'
                  }}>
                    {issue.category}
                  </span>
                </div>
              )}


              {/* Card Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: '1' }}>
                {/* Badges row */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span className={`badge badge-${issue.status}`}>
                    {issue.status === 'in-progress' ? 'In Progress' : issue.status}
                  </span>
                  <span className={`badge badge-${issue.priority}`}>
                    {issue.priority} Priority
                  </span>
                </div>

                {/* Title and details */}
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                  {issue.title}
                </h3>
                
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  display: '-webkit-box',
                  WebkitLineClamp: '3',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginBottom: '1rem',
                  flex: '1'
                }}>
                  {issue.description}
                </p>

                {/* Meta details */}
                <div style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '1rem',
                  marginTop: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={14} />
                    <span>Location: <strong>{issue.location}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={14} />
                    <span>Reported on {new Date(issue.createdAt).toLocaleDateString()} by {issue.reporterName}</span>
                  </div>
                </div>
              </div>

              {/* Card Action footer */}
              <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border-color)',
                backgroundColor: 'rgba(30, 41, 59, 0.2)'
              }}>
                <Link to={`/timeline/${issue._id}`} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem' }}>
                  <Eye size={16} />
                  <span>Track Progress</span>
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
