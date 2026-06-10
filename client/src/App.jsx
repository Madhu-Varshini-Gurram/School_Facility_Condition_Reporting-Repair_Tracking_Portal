import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import Timeline from './pages/Timeline';
import Notifications from './pages/Notifications';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Restore session on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Poll notifications every 15 seconds to simulate real-time updates
  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [token]);

  const handleLogin = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setNotifications([]);
  };

  return (
    <Router>
      <div className="app-container">
        console.log("APP LOADED");
        <Navbar user={user} notifications={notifications} onLogout={handleLogout} />

        <Routes>
          {/* Public Route */}
          <Route
            path="/login"
            element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={token ? <Dashboard user={user} token={token} /> : <Navigate to="/login" />}
          />

          <Route
            path="/report"
            element={
              token ? (
                user?.role !== 'admin' ? (
                  <ReportIssue token={token} />
                ) : (
                  <Navigate to="/dashboard" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/timeline/:id"
            element={token ? <Timeline user={user} token={token} /> : <Navigate to="/login" />}
          />

          <Route
            path="/notifications"
            element={
              token ? (
                <Notifications
                  token={token}
                  notifications={notifications}
                  onRefreshNotifications={fetchNotifications}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/admin"
            element={
              token ? (
                user?.role === 'admin' ? (
                  <AdminPanel token={token} />
                ) : (
                  <Navigate to="/dashboard" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Root Redirect */}
          <Route
            path="/"
            element={<Navigate to={token ? "/dashboard" : "/login"} />}
          />

          {/* Fallback Catch-all Redirect */}
          <Route
            path="*"
            element={<Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
}
