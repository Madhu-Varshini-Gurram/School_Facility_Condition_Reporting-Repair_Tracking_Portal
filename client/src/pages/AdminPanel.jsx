import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, Download, Search, ChevronRight, AlertTriangle 
} from 'lucide-react';

export default function AdminPanel({ token }) {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    priorities: { low: 0, medium: 0, high: 0 },
    categories: {}
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch all issues for school
      const resIssues = await fetch('/api/issues', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const dataIssues = await resIssues.json();

      // Fetch stats
      const resStats = await fetch('/api/issues/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const dataStats = await resStats.json();

      if (resIssues.ok) setIssues(dataIssues);
      if (resStats.ok) setStats(dataStats);
    } catch (err) {
      console.error('Error loading admin panel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token]);

  // Handle Export to CSV
  const handleExportCSV = () => {
    if (issues.length === 0) return;
    
    // Define headers
    const headers = ['Issue ID', 'Title', 'Description', 'Category', 'Location', 'Priority', 'Status', 'Reporter', 'Assigned Staff', 'Est Resolution Time', 'Date Reported'];
    
    // Map issue records to rows
    const rows = issues.map(issue => [
      issue._id,
      `"${issue.title.replace(/"/g, '""')}"`,
      `"${issue.description.replace(/"/g, '""')}"`,
      issue.category,
      issue.location,
      issue.priority,
      issue.status,
      issue.reporterName,
      issue.assignedStaff || 'Unassigned',
      issue.estimatedResolutionTime || 'TBD',
      new Date(issue.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `School_Facility_Repair_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredIssues = issues.filter(issue => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      issue.title.toLowerCase().includes(term) ||
      issue.location.toLowerCase().includes(term) ||
      issue.reporterName.toLowerCase().includes(term);

    const matchesStatus = !statusFilter || issue.status === statusFilter;
    const matchesPriority = !priorityFilter || issue.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const completionRate = stats?.total > 0 ? Math.round(((stats.resolved || 0) / stats.total) * 100) : 0;

  // Safe category retrieval for custom charts
  const categoriesList = ['Sanitation', 'Electrical', 'Furniture', 'Structural', 'Safety', 'Other'];
  const maxCategoryCount = Math.max(...categoriesList.map(cat => (stats?.categories || {})[cat] || 0), 1);

  return (
    <div className="content-container">
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={32} className="text-primary" />
            <span>Admin Facility Control Center</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Review condition logs, assign repair tasks, update resolution schedules, and generate compliance reports.
          </p>
        </div>
        
        {issues.length > 0 && (
          <button onClick={handleExportCSV} className="btn btn-primary animate-fade-in">
            <Download size={18} />
            <span>Export Repair Report (CSV)</span>
          </button>
        )}
      </div>

      {/* Grid: Charts and High Level Metrics */}
      <div className="grid grid-2 animate-fade-in" style={{ marginBottom: '2rem' }}>
        
        {/* KPI Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Performance Metrics
          </h3>
          
          {loading ? (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: '1' }}>
              <div className="skeleton skeleton-circle" style={{ width: '120px', height: '120px', flexShrink: 0 }}></div>
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '0.5rem' }}></div>
                  <div className="skeleton" style={{ width: '80px', height: '18px' }}></div>
                </div>
                <div>
                  <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '0.5rem' }}></div>
                  <div className="skeleton" style={{ width: '80px', height: '18px' }}></div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              {/* Radial-like visual circle */}
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: `conic-gradient(var(--status-resolved) ${completionRate}%, var(--border-color) ${completionRate}%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{completionRate}%</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fixed</span>
                </div>
              </div>

              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending Repair Review:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--status-pending)' }}></div>
                    <strong style={{ fontSize: '1.1rem' }}>{(stats?.pending || 0)} issues</strong>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Work in Progress:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--status-inprogress)' }}></div>
                    <strong style={{ fontSize: '1.1rem' }}>{(stats?.inProgress || 0)} repairs</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div style={{
            marginTop: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}>
            <span>Total Issues Registered: <strong>{loading ? '...' : (stats?.total || 0)}</strong></span>
            <span>Priority High: <strong style={{ color: 'var(--status-pending)' }}>{loading ? '...' : (stats?.priorities?.high || 0)}</strong></span>
          </div>
        </div>

        {/* Dynamic CSS Bar Chart for categories */}
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            Condition Reports by Category
          </h3>
          
          {loading ? (
            <div className="bar-chart-container">
              {Array(6).fill(0).map((_, idx) => (
                <div key={idx} className="chart-bar-wrapper">
                  <div className="skeleton" style={{ width: '100%', height: '80%', borderRadius: '4px 4px 0 0' }}></div>
                  <div className="skeleton" style={{ width: '40px', height: '12px', marginTop: '0.5rem' }}></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bar-chart-container">
              {categoriesList.map(cat => {
                const count = (stats?.categories || {})[cat] || 0;
                const heightPercent = stats?.total > 0 ? (count / maxCategoryCount) * 100 : 0;
                return (
                  <div key={cat} className="chart-bar-wrapper">
                    <div className="chart-bar" style={{ height: `${Math.max(heightPercent, 5)}%`, opacity: count > 0 ? 1 : 0.25 }}>
                      {count > 0 && <span className="chart-value">{count}</span>}
                    </div>
                    <span className="chart-label">{cat}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Filter and Table Card */}
      <div className="card animate-fade-in" style={{ padding: '1.5rem 0' }}>
        
        {/* Header and filters inside card */}
        <div style={{
          padding: '0 1.5rem 1rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h3 style={{ fontSize: '1.3rem' }}>Infrastructure Repair Directory</h3>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '200px' }}>
              <Search size={16} style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                placeholder="Search logs..."
                className="input-control"
                style={{ paddingLeft: '2.2rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', fontSize: '0.85rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="input-control"
              style={{ width: 'auto', padding: '0.5rem 2rem 0.5rem 0.75rem', fontSize: '0.85rem' }}
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
              style={{ width: 'auto', padding: '0.5rem 2rem 0.5rem 0.75rem', fontSize: '0.85rem' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Directory Table Grid */}
        {loading ? (
          <div style={{ overflowX: 'auto', padding: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem 1.5rem' }}><div className="skeleton" style={{ width: '100px', height: '14px' }}></div></th>
                  <th style={{ padding: '1rem 1.5rem' }}><div className="skeleton" style={{ width: '80px', height: '14px' }}></div></th>
                  <th style={{ padding: '1rem 1.5rem' }}><div className="skeleton" style={{ width: '60px', height: '14px' }}></div></th>
                  <th style={{ padding: '1rem 1.5rem' }}><div className="skeleton" style={{ width: '60px', height: '14px' }}></div></th>
                  <th style={{ padding: '1rem 1.5rem' }}><div className="skeleton" style={{ width: '80px', height: '14px' }}></div></th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}><div className="skeleton" style={{ width: '50px', height: '14px', marginLeft: 'auto' }}></div></th>
                </tr>
              </thead>
              <tbody>
                {Array(3).fill(0).map((_, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(38, 51, 77, 0.5)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div className="skeleton" style={{ width: '180px', height: '16px', marginBottom: '6px' }}></div>
                      <div className="skeleton" style={{ width: '140px', height: '12px' }}></div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}><div className="skeleton" style={{ width: '70px', height: '16px' }}></div></td>
                    <td style={{ padding: '1rem 1.5rem' }}><div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '9999px' }}></div></td>
                    <td style={{ padding: '1rem 1.5rem' }}><div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '9999px' }}></div></td>
                    <td style={{ padding: '1rem 1.5rem' }}><div className="skeleton" style={{ width: '90px', height: '16px' }}></div></td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}><div className="skeleton" style={{ width: '70px', height: '30px', borderRadius: 'var(--radius-sm)', marginLeft: 'auto' }}></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <AlertTriangle size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
            <h4 style={{ color: 'var(--text-secondary)' }}>No matches found</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Try refining your status or search keyword filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.9rem'
            }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <th style={{ padding: '1rem 1.5rem' }}>Issue details</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Category</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Priority</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Assignee</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => (
                  <tr key={issue._id} style={{
                    borderBottom: '1px solid rgba(38, 51, 77, 0.5)',
                    transition: 'background-color var(--transition-fast)'
                  }} className="table-row-hover">
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{issue.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Loc: <strong>{issue.location}</strong> | By: {issue.reporterName} ({new Date(issue.createdAt).toLocaleDateString()})
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                      {issue.category}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className={`badge badge-${issue.priority}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className={`badge badge-${issue.status}`}>
                        {issue.status === 'in-progress' ? 'In Progress' : issue.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: issue.assignedStaff ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: issue.assignedStaff ? 500 : 400 }}>
                      {issue.assignedStaff || 'Unassigned'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <Link 
                        to={`/timeline/${issue._id}`} 
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '2px' }}
                      >
                        <span>Manage</span>
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
