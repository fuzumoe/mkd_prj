import React, { useState, useEffect } from 'react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/admin/users/')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error('Error fetching users:', err));
  }, []);

  const handleDelete = (email) => {
    if (!window.confirm('Delete this user?')) return;

    fetch(`http://localhost:8000/api/admin/users/${email}/delete/`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Delete failed');
        setUsers((prev) => prev.filter((u) => u.email !== email));
      })
      .catch((err) => {
        console.error('Error deleting user:', err);
        alert('Failed to delete user.');
      });
  };

  return (
    <main style={{ padding: '2rem', background: '#f4f6f8', minHeight: '100vh', borderRadius:'2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#0D5F3A', fontSize: '2rem' }}>
        Registered Users
      </h2>

      {users.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#555' }}>No users found.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {users.map((user) => (
            <div
              key={user.email}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s',
              }}
            >
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Name:</strong> {user.name}
              </p>
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Email:</strong> {user.email}
              </p>
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Age:</strong> {user.age}
              </p>
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Allergies:</strong>{' '}
                {Array.isArray(user.allergies) ? user.allergies.join(', ') : 'None'}
              </p>
              <button
                onClick={() => handleDelete(user.email)}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  background: '#3A8349',
                  color: '#fff',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Delete User
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default AdminUsers;
