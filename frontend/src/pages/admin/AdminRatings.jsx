import React, { useEffect, useState } from 'react';

const AdminRatings = () => {
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/admin/all-ratings/')
      .then(res => res.json())
      .then(data => setRatings(data))
      .catch(err => console.error('Failed to fetch ratings', err));
  }, []);

  const toggleApproval = (id, currentStatus) => {
    fetch(`http://localhost:8000/api/admin/toggle-rating/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: !currentStatus }),
    })
      .then(res => res.json())
      .then(updated => {
        setRatings(ratings.map(r => (r.id === id ? updated : r)));
      })
      .catch(() => alert('Failed to update rating'));
  };
  const deleteRating = (id) => {
    if (window.confirm("Are you sure you want to delete this rating?")) {
      fetch(`http://localhost:8000/api/admin/delete-rating/${id}/`, {
        method: 'DELETE',
      })
        .then(res => {
          if (res.status === 204) {
            setRatings(ratings.filter(r => r.id !== id));
          } else {
            alert("Failed to delete rating.");
          }
        })
        .catch(() => alert("Error deleting rating."));
    }
  };  

  return (
    <div className="admin-ratings">
      <h2>User Ratings</h2>
      {ratings.length === 0 ? (
        <p>No ratings submitted yet.</p>
      ) : (
        ratings.map(r => (
          <div key={r.id} className="rating-card" style={{ padding: '1rem', marginBottom: '1rem', border: '1px solid #ccc', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={r.profile_image_url || '/default-avatar.png'}
                alt="user"
                style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '1rem' }}
              />
              <div>
                <strong>{r.user_name}</strong> – {r.stars} ★
                <p style={{ margin: '0.3rem 0' }}>{r.comment}</p>
              </div>
            </div>
            <button
              onClick={() => toggleApproval(r.id, r.approved)}
              style={{
                marginTop: '0.5rem',
                backgroundColor: r.approved ? '#ccc' : '#2e8b57',
                color: 'white',
                border: 'none',
                padding: '0.4rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              {r.approved ? 'Unapprove' : 'Approve'}
            </button>
            <button
                onClick={() => deleteRating(r.id)}
                style={{
                    marginLeft: '1rem',
                    backgroundColor: '#c0392b',
                    color: 'white',
                    border: 'none',
                    padding: '0.4rem 1rem',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
                >
                Delete
                </button>

          </div>
        ))
      )}
    </div>
  );
};

export default AdminRatings;
