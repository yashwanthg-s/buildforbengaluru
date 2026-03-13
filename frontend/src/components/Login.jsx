import { useState } from 'react';
import '../styles/Login.css';

export const Login = ({ onLogin, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'citizen'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Hardcoded credentials for admin and officer
      if (formData.role === 'admin') {
        if (formData.username === 'admin' && formData.password === 'admin') {
          onLogin({ role: 'admin', username: 'admin', id: 1 });
        } else {
          setError('Invalid admin credentials');
        }
      } else if (formData.role === 'officer') {
        if (formData.username === 'officer' && formData.password === 'officer') {
          onLogin({ role: 'officer', username: 'officer', id: 2 });
        } else {
          setError('Invalid officer credentials');
        }
      } else {
        // For citizens, check against database
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          onLogin({ 
            role: 'citizen', 
            username: data.user.username, 
            id: data.user.id,
            name: data.user.name,
            email: data.user.email
          });
        } else {
          setError(data.message || 'Invalid credentials');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🚨 Complaint System</h1>
          <h2>Login</h2>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="role">Login As</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="citizen">👤 Citizen</option>
              <option value="officer">👮 Officer</option>
              <option value="admin">🔐 Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-large"
          >
            {loading ? '⏳ Logging in...' : '✓ Login'}
          </button>
        </form>

        {formData.role === 'citizen' && (
          <div className="login-footer">
            <p>Don't have an account?</p>
            <button
              onClick={onSwitchToSignup}
              className="btn-link"
            >
              Sign Up Here
            </button>
          </div>
        )}

        {formData.role !== 'citizen' && (
          <div className="login-info">
            <p className="info-text">
              {formData.role === 'admin' && '🔐 Admin: username=admin, password=admin'}
              {formData.role === 'officer' && '👮 Officer: username=officer, password=officer'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
