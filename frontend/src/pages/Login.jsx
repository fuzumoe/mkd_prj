import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../style.css';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }
      const userData = await response.json();
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('userEmail', userData.email);
      sessionStorage.setItem('currentUserEmail', userData.email);
      sessionStorage.setItem('userName', userData.name);
      sessionStorage.setItem('userAge', userData.age);
      sessionStorage.setItem('userAllergies', JSON.stringify(userData.allergies));

      const redirectTo = location.state?.from;
      if (redirectTo === 'analyzer') navigate('/consent');
      else if (redirectTo === 'profile') navigate('/profile');
      else navigate('/welcome');
    } catch (err) {
      toast.error(err.message, {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <GoogleOAuthProvider clientId="372577436744-fs9686m4uvvikhlmv75971sffhg5ts2v.apps.googleusercontent.com">
      <div className="form-page login-bg" style={{ background: 'linear-gradient(to right, #a8edea,rgb(222, 241, 203))', minHeight: '100vh' }}>
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          minHeight: '100vh', padding: '1rem'
        }}>
          <div style={{
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            maxWidth: '400px',
            width: '100%',
            transition: 'transform 0.2s'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1A8D50', fontWeight: '700' }}>Aurora Organics</h1>
              <p style={{ margin: '0.5rem 0 0', color: '#6b7280' }}>Sign in to continue</p>
            </div>

            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <GoogleLogin
                onSuccess={async credentialResponse => {
                  try {
                    const res = await fetch('http://localhost:8000/api/google-login/', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ token: credentialResponse.credential })
                    });

                    if (!res.ok) {
                      const error = await res.json();
                      throw new Error(error.error || 'Google login failed');
                    }

                    const userData = await res.json();
                    sessionStorage.setItem('isAuthenticated', 'true');
                    sessionStorage.setItem('userEmail', userData.email);
                    sessionStorage.setItem('currentUserEmail', userData.email);
                    sessionStorage.setItem('userName', userData.name);
                    sessionStorage.setItem('userAge', userData.age || '');
                    sessionStorage.setItem('userAllergies', JSON.stringify(userData.allergies || []));

                    navigate('/welcome');
                  } catch (error) {
                    toast.error(error.message || "Google login failed");
                  }
                }}
                onError={() => {
                  toast.error("Google Login Failed");
                }}
              />
            </div>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '10px',
                    border: '1px solid #ccc', outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#1A8D50'}
                  onBlur={e => e.target.style.borderColor = '#ccc'}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '10px',
                    border: '1px solid #ccc', outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#1A8D50'}
                  onBlur={e => e.target.style.borderColor = '#ccc'}
                />
              </div>

              <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                <a href="/forgot-password" style={{ fontSize: '0.85rem', color: '#1A8D50', textDecoration: 'none' }}>Forgot password?</a>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  backgroundColor: '#1A8D50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.target.style.backgroundColor = '#157a42'}
                onMouseLeave={e => e.target.style.backgroundColor = '#1A8D50'}
              >
                Login
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Don’t have an account? <a href="/register" style={{ color: '#1A8D50', textDecoration: 'none' }}>Sign up</a>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
