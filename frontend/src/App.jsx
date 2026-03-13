import React, { useState, useEffect } from 'react';
import { ComplaintForm } from './components/ComplaintForm';
import OfficerDashboard from './components/OfficerDashboard';
import CitizenHistory from './components/CitizenHistory';
import AdminDashboard from './components/AdminDashboard';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { NotificationBell } from './components/NotificationBell';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('complaint'); // 'complaint', 'history', 'dashboard', or 'admin'
  const [authPage, setAuthPage] = useState('login'); // 'login' or 'signup'
  const [user, setUser] = useState(null); // null when not logged in
  const [selectedComplaintId, setSelectedComplaintId] = useState(null); // For notification navigation

  // Check for saved user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedPage = localStorage.getItem('currentPage');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // Restore the page they were on, or default based on role
        if (savedPage) {
          setCurrentPage(savedPage);
        } else {
          // Set default page based on role
          if (userData.role === 'admin') {
            setCurrentPage('admin');
          } else if (userData.role === 'officer') {
            setCurrentPage('dashboard');
          } else {
            setCurrentPage('complaint');
          }
        }
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('currentPage');
      }
    }
  }, []);

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage, user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Set initial page based on role
    if (userData.role === 'admin') {
      setCurrentPage('admin');
    } else if (userData.role === 'officer') {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('complaint');
    }
  };

  const handleSignup = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('complaint');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('currentPage');
    setCurrentPage('complaint');
    setAuthPage('login');
  };

  const handleNotificationClick = (complaintId) => {
    // Navigate to history page and select the complaint
    setSelectedComplaintId(complaintId);
    setCurrentPage('history');
  };

  // If not logged in, show login/signup page
  if (!user) {
    if (authPage === 'login') {
      return <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthPage('signup')} />;
    } else {
      return <Signup onSignup={handleSignup} onSwitchToLogin={() => setAuthPage('login')} />;
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🚨 Geo-Tagged Complaint System</h1>
          <div className="header-right">
            {user.role === 'citizen' && (
              <NotificationBell 
                userId={user.id} 
                onNotificationClick={handleNotificationClick}
              />
            )}
            <div className="user-info">
              <span className="user-name">👤 {user.name || user.username}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <nav className="nav">
              {user.role === 'citizen' && (
                <>
                  <button
                    className={`nav-btn ${currentPage === 'complaint' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('complaint')}
                  >
                    📝 Submit Complaint
                  </button>
                  <button
                    className={`nav-btn ${currentPage === 'history' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('history')}
                  >
                    📋 My History
                  </button>
                </>
              )}
              {user.role === 'officer' && (
                <button
                  className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('dashboard')}
                >
                  👮 Officer Dashboard
                </button>
              )}
              {user.role === 'admin' && (
                <button
                  className={`nav-btn ${currentPage === 'admin' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('admin')}
                >
                  🔐 Admin Dashboard
                </button>
              )}
              <button
                className="nav-btn logout-btn"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="app-main">
        {currentPage === 'complaint' && <ComplaintForm userId={user.id} />}
        {currentPage === 'history' && (
          <CitizenHistory 
            userId={user.id} 
            selectedComplaintId={selectedComplaintId}
            onComplaintViewed={() => setSelectedComplaintId(null)}
          />
        )}
        {currentPage === 'dashboard' && <OfficerDashboard userId={user.id} />}
        {currentPage === 'admin' && <AdminDashboard />}
      </main>

      <footer className="app-footer">
        <p>© 2024 Geo-Tagged Complaint System. All rights reserved.</p>
        <p>Live camera capture • GPS location • Automatic timestamp</p>
      </footer>
    </div>
  );
}

export default App;
