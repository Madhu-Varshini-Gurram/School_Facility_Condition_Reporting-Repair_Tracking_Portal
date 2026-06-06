import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckSquare, BellOff, ExternalLink, Calendar } from 'lucide-react';

export default function Notifications({ token, notifications, onRefreshNotifications }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        onRefreshNotifications();
      }
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const markAllRead = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications/read/all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        onRefreshNotifications();
      }
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onRefreshNotifications();
  }, [token]);

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="content-container" style={{ maxWidth: '800px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>School Alerts & Notifications</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Stay updated on repair statuses, schedules, and resolution comments for reported facilities.
          </p>
        </div>
        
        {unreadNotifications.length > 0 && (
          <button 
            onClick={markAllRead} 
            className="btn btn-secondary"
            disabled={loading}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            <CheckSquare size={16} />
            <span>{loading ? 'Marking...' : 'Mark all as read'}</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card animate-fade-in" style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <BellOff size={48} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '1.4rem' }}>All caught up!</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto' }}>
            You have no notifications. Updates on infrastructure reports and scheduling changes will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">
          {notifications.map((notif) => (
            <div 
              key={notif._id} 
              className="card animate-fade-in" 
              style={{
                padding: '1.25rem 1.5rem',
                borderLeft: notif.read ? '1px solid var(--border-color)' : '4px solid var(--color-primary)',
                backgroundColor: notif.read ? 'var(--bg-card)' : 'rgba(59, 130, 246, 0.04)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                {/* Visual Unread Dot indicator */}
                {!notif.read && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    marginTop: '8px',
                    flexShrink: 0
                  }}></div>
                )}
                
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '0.95rem',
                    color: notif.read ? 'var(--text-secondary)' : 'var(--text-primary)',
                    fontWeight: notif.read ? 400 : 500,
                    marginBottom: '0.5rem',
                    lineHeight: '1.4'
                  }}>
                    {notif.message}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)'
                  }}>
                    <Calendar size={12} />
                    <span>{new Date(notif.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action columns */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {notif.issueId && (
                  <Link 
                    to={`/timeline/${notif.issueId}`} 
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => { if (!notif.read) markAsRead(notif._id); }}
                  >
                    <span>Track</span>
                    <ExternalLink size={12} />
                  </Link>
                )}

                {!notif.read && (
                  <button 
                    onClick={() => markAsRead(notif._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
