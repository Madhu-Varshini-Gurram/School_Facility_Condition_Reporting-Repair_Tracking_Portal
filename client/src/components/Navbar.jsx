import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Bell, Shield, LogOut, Wrench } from 'lucide-react';

export default function Navbar({ user, notifications, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Wrench size={24} className="text-primary" />
          <span>SchoolRepair</span>
        </Link>

        {user ? (
          <div className="navbar-links">
            <Link 
              to="/dashboard" 
              className={`navbar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <Home size={18} />
              <span>Dashboard</span>
            </Link>

            {user.role !== 'admin' && (
              <Link 
                to="/report" 
                className={`navbar-link ${location.pathname === '/report' ? 'active' : ''}`}
              >
                <PlusCircle size={18} />
                <span>Report Issue</span>
              </Link>
            )}

            {user.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`navbar-link ${location.pathname === '/admin' ? 'active' : ''}`}
              >
                <Shield size={18} />
                <span>Admin Panel</span>
              </Link>
            )}

            <Link 
              to="/notifications" 
              className={`navbar-link ${location.pathname === '/notifications' ? 'active' : ''}`}
            >
              <div className="navbar-badge-container">
                <Bell size={18} />
                {unreadCount > 0 && <span className="navbar-badge">{unreadCount}</span>}
              </div>
              <span>Alerts</span>
            </Link>

            <div className="navbar-user">
              <div className="navbar-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {user.role} ({user.schoolId})
                </span>
              </div>
              <button 
                onClick={handleLogout} 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', marginLeft: '0.5rem' }}
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="navbar-links">
            <Link 
              to="/login" 
              className={`btn btn-primary`}
              style={{ padding: '0.5rem 1.2rem' }}
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
