import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [editStates, setEditStates] = useState({});
  const [openCard, setOpenCard] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/admin/consultations/')
      .then((res) => res.json())
      .then((data) => {
        setConsultations(data);
        const initialEditState = {};
        data.forEach(c => {
          initialEditState[c.id] = {
            assigned_consultant: c.assigned_consultant || '',
            confirmed_date: c.confirmed_date || '',
            confirmed_time: c.confirmed_time || '',
            meeting_link: c.meeting_link || '',
            consultation_fee: c.consultation_fee || '',
            status: c.status || 'pending',
            payment_confirmed: c.payment_confirmed || false,
          };
        });
        setEditStates(initialEditState);
      });
  }, []);

  const handleChange = (id, field, value) => {
    setEditStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: field === 'payment_confirmed' ? value === 'yes' : value,
      },
    }));
  };

  const handleSave = (id) => {
    const updates = editStates[id];
    fetch(`http://localhost:8000/api/admin/consultations/${id}/update/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
      .then(() => {
        toast.success('✅ Consultation details saved!');
      })
      .catch(() => {
        toast.error('❌ Failed to update consultation.');
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this consultation?')) return;
    fetch(`http://localhost:8000/api/admin/consultations/${id}/delete/`, {
      method: 'DELETE',
    })
      .then(() => {
        setConsultations(prev => prev.filter(c => c.id !== id));
        toast.success('🗑️ Consultation deleted.');
      })
      .catch(() => toast.error('❌ Failed to delete consultation.'));
  };

  const toggleCard = (id) => {
    setOpenCard(prev => (prev === id ? null : id));
  };

  return (
    <main style={{ padding: '2rem', background: '#f4f6f8', minHeight: '100vh' }}>
      <ToastContainer position="top-center" />
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#0D5F3A' }}>Manage Consultations</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {consultations.map((c) => (
          <div key={c.id} className="consultation-card">
            <p><strong>Name:</strong> {c.name}</p>
            <p><strong>Email:</strong> {c.email}</p>
            <p><strong>Concern:</strong> {c.concern}</p>
            <p><strong>Preferred:</strong> {c.preferred_date} {c.preferred_time}</p>
            <p><strong>Meeting Type:</strong> {c.meeting_type}</p>
            <p><strong>Submitted:</strong> {new Date(c.submitted_at).toLocaleString()}</p>

            <p>
              <strong>Payment:</strong>{' '}
              {c.payment_confirmed ? (
                <span style={{ color: 'green', fontWeight: 'bold' }}>Confirmed ✅</span>
              ) : (
                <span style={{ color: 'red', fontWeight: 'bold' }}>Pending ❌</span>
              )}
            </p>

            <button onClick={() => toggleCard(c.id)} className="btn-toggle">
              {openCard === c.id ? 'Hide Actions' : 'Take Action'}
            </button>

            {openCard === c.id && (
              <div className={`consultation-slide ${openCard === c.id ? 'open' : ''}`}>
                <div className="consultation-form">
                  <label>Assign Consultant:</label>
                  <input value={editStates[c.id]?.assigned_consultant} onChange={e => handleChange(c.id, 'assigned_consultant', e.target.value)} />

                  <label>Confirm Date:</label>
                  <input type="date" value={editStates[c.id]?.confirmed_date} onChange={e => handleChange(c.id, 'confirmed_date', e.target.value)} />

                  <label>Confirm Time:</label>
                  <input type="time" value={editStates[c.id]?.confirmed_time} onChange={e => handleChange(c.id, 'confirmed_time', e.target.value)} />

                  {c.meeting_type === 'online' && (
                    <>
                      <label>Meeting Link:</label>
                      <input value={editStates[c.id]?.meeting_link} onChange={e => handleChange(c.id, 'meeting_link', e.target.value)} />
                    </>
                  )}

                  <label>Consultation Fee ($):</label>
                  <input type="number" value={editStates[c.id]?.consultation_fee} onChange={e => handleChange(c.id, 'consultation_fee', e.target.value)} />

                  <label>Status:</label>
                  <select value={editStates[c.id]?.status} onChange={e => handleChange(c.id, 'status', e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                  </select>

                  <label>Payment Confirmed:</label>
                  <select value={editStates[c.id]?.payment_confirmed ? 'yes' : 'no'} onChange={e => handleChange(c.id, 'payment_confirmed', e.target.value)}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>

                  <div className="consultation-actions">
                    <button onClick={() => handleSave(c.id)} className="btn-save">Save Changes</button>
                    <button onClick={() => handleDelete(c.id)} className="btn-delete">Delete Request</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default AdminConsultations;
