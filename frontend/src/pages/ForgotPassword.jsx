import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "Check your email for password reset instructions.");
        setTimeout(() => {
          navigate('/');  // Redirect to login page after 3 seconds
        }, 3000);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Something went wrong. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page login-bg">
      <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="login-card" style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1A8D50' }}>Forgot Password</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: loading ? '#ccc' : '#1A8D50', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              {loading ? "Sending..." : "Reset Password"}
            </button>
          </form>

          {message && (
            <p style={{ marginTop: '1rem', color: 'green', fontWeight: 'bold', textAlign: 'center' }}>
              {message}
            </p>
          )}

          {error && (
            <p style={{ marginTop: '1rem', color: 'red', fontWeight: 'bold', textAlign: 'center' }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
