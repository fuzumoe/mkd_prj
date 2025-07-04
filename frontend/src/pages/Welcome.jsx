import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../UserDashboard.css';
import { loadStripe } from '@stripe/stripe-js';
import { apiCall, API_ENDPOINTS } from '../utils/api.js';
import config from '../config/env.js';


const Welcome = () => {
  const navigate = useNavigate();
  const name = sessionStorage.getItem('userName') || 'User';
  const email = sessionStorage.getItem('currentUserEmail');
  const imageUrl = sessionStorage.getItem("profileImageURL");
  const profileImage = imageUrl && imageUrl !== "null" ? imageUrl : "/default-avatar.png";

  const [stars, setStars] = useState(4);
  const [comment, setComment] = useState('');
  const [ratingMessage, setRatingMessage] = useState('');

  const [lastAnalysisDate, setLastAnalysisDate] = useState('N/A');
  const [commonIssue, setCommonIssue] = useState('N/A');
  const [skinScore, setSkinScore] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [recent, setRecent] = useState([]);
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    if (!email) return;

    fetch(`http://localhost:8000/api/user/analysis-summary/${email}`)
      .then(res => res.json())
      .then(data => {
        setLastAnalysisDate(data.last_analysis || 'N/A');
        setCommonIssue(data.common_issue || 'N/A');
        setSkinScore(data.skin_score || null);
      });

    fetch(`http://localhost:8000/api/user/recommended-products/${email}`)
      .then(res => res.json())
      .then(data => setRecommended(data));

    fetch('http://localhost:8000/api/blogs/')
      .then(res => res.json())
      .then(data => setBlogs(data.slice(0, 2)));

    fetch(`http://localhost:8000/api/user/activity/${email}`)
      .then(res => res.json())
      .then(data => setRecent(data));

    fetch(`http://localhost:8000/api/user/consultations/${email}`)
      .then(res => res.json())
      .then(data => setConsultations(data));

  }, [email]);

  return (
    <div className="dashboard-wrapper">
      <div className="user-dashboard">
        <h2 className="dashboard-title">Welcome, {name}!</h2>
        <p className="dashboard-subtitle">Here's a snapshot of your skin wellness journey.</p>

        <div className="quick-actions-bar">
          <button onClick={() => navigate('/consent')} className="quick-action-btn">🧪 Analyze Skin</button>
          <button onClick={() => navigate('/profile')} className="quick-action-btn">👤 Profile</button>
          <button onClick={() => navigate('/consultations')} className="quick-action-btn">📅 Consultations</button>
          <button onClick={() => navigate('/public-faq')} className="quick-action-btn">❓ FAQs</button>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card highlight-card">
            <h3>🌿 Skin Health Overview</h3>
            <p><strong>Last Analysis:</strong> {lastAnalysisDate}</p>
            <p><strong>Most Common Issue:</strong> {commonIssue}</p>
            <p><strong>Skin Score:</strong> {skinScore ? `${skinScore} / 100` : 'N/A'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/consent')}>Analyze Again</button>
          </div>

          <div className="dashboard-card">
            <h3>🧴 Recommended Products</h3>
            <ul className="product-list">
              {recommended.length > 0 ? (
                recommended.map((item, idx) => <li key={idx}>{item.name}</li>)
              ) : <li>No recommendations yet.</li>}
            </ul>
            <button className="btn btn-outline" onClick={() => navigate('/shop')}>View All Products</button>
          </div>

          <div className="dashboard-card">
            <h3>📖 Latest from Aurora</h3>
            <ul className="blog-list">
              {blogs.length > 0 ? (
                blogs.map((post, idx) => (
                  <li key={idx}>
                    <strong>{post.title}</strong><br />
                    {post.excerpt || post.body.slice(0, 80)}...
                  </li>
                ))
              ) : <li>No articles available.</li>}
            </ul>
            <button className="btn btn-outline" onClick={() => navigate('/blogs')}>Read More Articles</button>
          </div>

          <div className="dashboard-card">
            <h3>🌟 Rate Our Service</h3>
            <div className="star-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  style={{ fontSize: '1.5rem', cursor: 'pointer', color: n <= stars ? '#f5b50a' : '#ccc' }}
                  onClick={() => setStars(n)}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              placeholder="Leave a comment..."
              rows="3"
              className="rating-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => {
              fetch('http://localhost:8000/api/rate-service/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_email: email,
                  user_name: name,
                  profile_image_url: profileImage,
                  stars: stars,
                  comment: comment,
                })
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.message) setRatingMessage(data.message);
                  else alert('Error: ' + JSON.stringify(data));
                });
            }}>Submit Rating</button>
            {ratingMessage && <p style={{ color: 'green' }}>{ratingMessage}</p>}
          </div>

          <div className="dashboard-card">
            <h3>🕒 Recent Activity</h3>
            <ul className="activity-list">
              {recent.length > 0 ? (
                recent.map((act, idx) => <li key={idx}>{act.description}</li>)
              ) : <li>No activity yet.</li>}
            </ul>
          </div>

          <div className="dashboard-card">
            <h3>💬 Consultations Updates</h3>
            {consultations.length > 0 ? (
              consultations.map((c, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid #ddd', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <p><strong>Status:</strong> {c.status}</p>
                  <p><strong>Assigned Consultant:</strong> {c.assigned_consultant || 'Pending assignment'}</p>
                  <p><strong>Date & Time:</strong> {c.confirmed_date || 'TBD'} {c.confirmed_time || ''}</p>
                  <p><strong>Fee:</strong> {c.consultation_fee ? `$${c.consultation_fee}` : 'Not Set'}</p>
                  {c.meeting_type === 'online' && c.meeting_link && (
                    <p><strong>Meeting Link:</strong> <a href={c.meeting_link} target="_blank" rel="noopener noreferrer">Join</a></p>
                  )}
                  <p><strong>Payment:</strong> {c.payment_confirmed ? 'Confirmed ✅' : (
                    <>
                      Pending ❌
                      <br />
                      {c.consultation_fee && (
                        <button
                          style={{
                            backgroundColor: '#1a8d50',
                            color: '#fff',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            marginTop: '0.5rem'
                          }}
                          onClick={async () => {
                            const res = await fetch('http://localhost:8000/api/consultation-payment/', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                consultation_id: c.id,
                                email: email,
                              })
                            });
                            const data = await res.json();
                            const stripe = await loadStripe(config.STRIPE_PUBLISHABLE_KEY);
                            await stripe.redirectToCheckout({ sessionId: data.id });
                          }}
                        >
                          Pay Consultation Fee
                        </button>
                      )}
                    </>
                  )}</p>

                </div>
              ))
            ) : <p>No consultations info yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
