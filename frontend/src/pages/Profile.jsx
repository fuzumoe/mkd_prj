import React, { useEffect, useState } from 'react';
import "../profile.css";
import { Link } from 'react-router-dom';

const Profile = () => {
  const [history, setHistory] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const userEmail = sessionStorage.getItem('currentUserEmail') || sessionStorage.getItem('userEmail');
  const userName = sessionStorage.getItem('userName');
  const userAge = sessionStorage.getItem('userAge');
  const userAllergies = sessionStorage.getItem('userAllergies');

  // Fetch profile image from backend
  useEffect(() => {
    if (userEmail) {
      fetch(`http://localhost:8000/api/get-profile-image/?email=${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => {
          const image = data.profile_image_url && data.profile_image_url !== "null"
            ? data.profile_image_url
            : "/default-avatar.png";

          setProfileImage(image);
          sessionStorage.setItem("profileImageURL", image);

        })        
        .catch(err => console.error('Error fetching profile image:', err));
    }
  }, [userEmail]);

  const dataURLtoBlob = dataurl => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  useEffect(() => {
    if (userEmail) {
      fetch(`http://localhost:8000/api/analyze/list/?user_email=${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(err => console.error('Error fetching analysis history:', err));
    }
  }, [userEmail]);

  useEffect(() => {
    history.forEach(entry => {
      if (!predictions[entry.id]) {
        const blob = dataURLtoBlob(entry.image_data);
        const formData = new FormData();
        formData.append('image', blob, 'image.png');

        fetch('http://localhost:5000/predict', { method: 'POST', body: formData })
          .then(res => res.json())
          .then(data => {
            if (data.prediction) {
              setPredictions(prev => ({ ...prev, [entry.id]: data.prediction }));
            }
          })
          .catch(err => console.error('Error fetching prediction for entry', entry.id, err));
      }
    });
  }, [history, predictions]);

  const handleDelete = id => {
    fetch(`http://localhost:8000/api/analyze/${id}/`, { method: 'DELETE' })
      .then(response => {
        if (response.ok) {
          setHistory(prev => prev.filter(r => r.id !== id));
          setPredictions(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
      })
      .catch(err => console.error('Error deleting record:', err));
  };

  const handleClearAll = () => {
    if (!window.confirm('Are you sure you want to clear all your analysis history?')) return;
    Promise.all(history.map(r => fetch(`http://localhost:8000/api/analyze/${r.id}/`, { method: 'DELETE' })))
      .then(() => {
        setHistory([]);
        setPredictions({});
      })
      .catch(err => console.error('Error clearing history:', err));
  };

  const handlePasswordChange = async () => {
    setPasswordMessage('');

    if (newPassword.length < 8) {
      setPasswordMessage('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('New password and confirmation do not match.');
      return;
    }
    if (newPassword === oldPassword) {
      setPasswordMessage('New password must be different from old password.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, old_password: oldPassword, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowChangePassword(false);
      } else {
        setPasswordMessage(data.error || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordMessage('Something went wrong. Please try again.');
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        
        fetch('http://localhost:8000/api/upload-profile-image/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, profileImage: base64String })
        })
        .then(response => response.json())
        .then(data => {
          console.log(data.message);
          setProfileImage(base64String); // Update UI immediately
        })
        .catch(error => {
          console.error('Error uploading profile image:', error);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = dateString => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="page-content">
      <div className="profile-page container">
        <div className="profile-header">
        <div className="profile-avatar">
          {profileImage ? (
            <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            userName ? userName.charAt(0).toUpperCase() : 'U'
          )}
        </div>

        <div style={{ marginTop: '8px', textAlign: 'center' }}>
          <label className="btn btn-outline" style={{ cursor: 'pointer', marginTop: '5rem', marginLeft:'-1rem' }}>
            Change Photo
            <input type="file" accept="image/*" onChange={handleProfileImageChange} style={{ display: 'none' }} />
          </label>
        </div>

          <h1>Welcome, {userName}</h1>
        </div>

        <div className="profile-tabs">
          <button className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Personal Info</button>
          <button className={`tab-button ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Analysis History</button>
        </div>

        {activeTab === 'profile' && (
          <div className="profile-content">
            <div className="profile-card">
              <div className="profile-details">
                <div className="detail-group"><span className="detail-label">Name</span><span className="detail-value">{userName}</span></div>
                <div className="detail-group"><span className="detail-label">Email</span><span className="detail-value">{userEmail}</span></div>
                <div className="detail-group"><span className="detail-label">Age Bracket</span><span className="detail-value">{userAge}</span></div>
                <div className="detail-group"><span className="detail-label">Allergies</span><span className="detail-value">{userAllergies || 'None specified'}</span></div>
              </div>
              <Link to="/edit-profile" className="btn btn-primary">Edit Profile</Link>
              <Link to="/consultations" className="btn btn-outline" style ={{marginLeft:'1rem'}}>Book Consultation</Link>
              <button onClick={() => setShowChangePassword(true)} className="btn btn-outline" style ={{marginLeft:'1rem'}}>Security Settings</button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="profile-content">
            <div className="history-header">
              <h2>Your Analysis History</h2>
              {history.length > 0 && <button className="btn btn-outline btn-small" onClick={handleClearAll}>Clear All</button>}
            </div>

            {history.length === 0 ? (
              <div className="empty-history">
                <div className="empty-icon">📊</div>
                <p>No analysis history available.</p>
                <p className="empty-subtitle">Complete a skin analysis to see your results here.</p>
                <Link to="/analyze" className="btn btn-primary">Start Analysis</Link>
              </div>
            ) : (
              <div className="history-grid">
                {history.map(entry => {
                  const pred = predictions[entry.id] || 'Loading...';
                  return (
                    <div key={entry.id} className="history-card">
                      <div className="history-card-header">
                        <span className="history-date">{formatDate(entry.created_at)}</span>
                        <button className="btn-icon" onClick={() => handleDelete(entry.id)} aria-label="Delete"><span className="delete-icon">×</span></button>
                      </div>
                      <div className="history-image-container">
                        <img src={entry.image_data} alt="Skin analysis" className="history-image" />
                      </div>
                      <div className="history-info">
                        <div className="history-detail"><span className="detail-label">Skin Type:</span><span className="detail-tag">{entry.skin_type}</span></div>
                        <div className="history-detail"><span className="detail-label">AI Prediction:</span><span className="detail-tag">{pred}</span></div>
                      </div>
                      <Link to={`/analysis/${entry.id}`} className="btn btn-outline btn-full">View Details</Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 style={{ marginBottom: '20px' }}>🔒 Change Your Password</h2>

              <div className="form-group">
                <label>Old Password:</label>
                <input 
                  type="password" 
                  placeholder="Enter your old password" 
                  value={oldPassword} 
                  onChange={e => setOldPassword(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>New Password:</label>
                <input 
                  type="password" 
                  placeholder="Enter a new password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password:</label>
                <input 
                  type="password" 
                  placeholder="Confirm your new password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>

              {passwordMessage && (
                <p className={passwordMessage.includes('successfully') ? "success-message" : "error-message"}>
                  {passwordMessage}
                </p>
              )}

              <div className="modal-buttons" style={{ marginTop: '20px' }}>
                <button onClick={handlePasswordChange} className="btn btn-primary" style={{ marginRight: '10px' }}>
                  Save New Password
                </button>
                <button onClick={() => setShowChangePassword(false)} className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
