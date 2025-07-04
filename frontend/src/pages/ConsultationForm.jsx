import React, { useState } from 'react';
import '../style.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ConsultationForm = () => {
  const userEmail = sessionStorage.getItem('currentUserEmail') || '';
  const [form, setForm] = useState({
    name: '',
    email: userEmail,
    phone: '',
    date: '',
    time: '',
    concerns: [],
    info: '',
    meeting_type: ''
  });

  // Label/value pairs so UI stays the same but backend gets HH:MM:SS
  const times = [
    { label: '9:00 AM', value: '09:00:00' },
    { label: '10:00 AM', value: '10:00:00' },
    { label: '11:00 AM', value: '11:00:00' },
    { label: '1:00 PM', value: '13:00:00' },
    { label: '2:00 PM', value: '14:00:00' },
    { label: '3:00 PM', value: '15:00:00' },
    { label: '4:00 PM', value: '16:00:00' }
  ];

  const concernsList = [
    'Acne', 'Aging', 'Dryness', 'Redness', 'Pigmentation', 'Sensitivity', 'Oiliness'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleConcern = (c) => {
    setForm(prev => {
      const has = prev.concerns.includes(c);
      const updated = has ? prev.concerns.filter(x => x !== c) : [...prev.concerns, c];
      return { ...prev, concerns: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      preferred_date: form.date,
      preferred_time: form.time,
      concern: form.concerns.join(', '),
      additional_info: form.info,
      meeting_type: form.meeting_type
    };

    fetch('http://localhost:8000/api/consultations/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to submit consultation');
        return res.json();
      })
      .then(() => {
        toast.success('Your consultation request has been submitted!');
        setForm({ name: '', email: '', phone: '', date: '', time: '', concerns: [], info: '' });
      })
      .catch(err => {
        console.error('Error:', err);
        toast.error('Failed to submit consultation. Please try again.');
      });
  };

  return (
    <div className="form-page" style={{ backgroundColor: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.25rem', fontSize: '2rem', color: '#111827' }}>
          Book a Skin Consultation
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>
          Schedule a one-on-one consultation with our skin experts
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Left Column: Form */}
          <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', color: '#111827' }}>Request an Appointment</h3>
            <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.95rem' }}>
              Fill out the form below and we'll get back to you to confirm your consultation.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>👤</span>
                  <input
                    name="name" type="text" value={form.name} onChange={handleChange} required
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                    Email Address
                  </label>
                  <input
                    name="email" type="email" value={form.email} readOnly
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                    Phone Number
                  </label>
                  <input
                    name="phone" type="tel" value={form.phone} onChange={handleChange} required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                  />
                </div>
              </div>

              {/* Preferred Date */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                  Preferred Date
                </label>
                <input
                  name="date" type="date" value={form.date} onChange={handleChange} required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                />
              </div>

              {/* Preferred Time */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                  Preferred Time
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {times.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, time: value }))}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: form.time === value ? '2px solid #27ae60' : '1px solid #e5e7eb',
                        background: form.time === value ? '#27ae60' : 'transparent',
                        color: form.time === value ? '#fff' : '#111827',
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Concerns */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                  Skin Concerns <span style={{ fontWeight: '400' }}>(select all that apply)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {concernsList.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleConcern(c)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: form.concerns.includes(c) ? '2px solid #27ae60' : '1px solid #e5e7eb',
                        background: form.concerns.includes(c) ? '#27ae60' : 'transparent',
                        color: form.concerns.includes(c) ? '#fff' : '#111827',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              {/* Meeting Type */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                  Preferred Meeting Type
                </label>
                <select
                  name="meeting_type"
                  value={form.meeting_type || ''}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                >
                  <option value="">Select</option>
                  <option value="online">Online (Zoom/Google Meet)</option>
                  <option value="physical">Physical (In-person)</option>
                </select>
              </div>


              {/* Additional Info */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#111827' }}>
                  Additional Information
                </label>
                <textarea
                  name="info" rows={4} value={form.info} onChange={handleChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb', resize: 'vertical' }}
                  placeholder="Tell us more about your skin concerns or questions..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                style={{
                  width: '100%', padding: '0.75rem', backgroundColor: '#27ae60', color: '#fff',
                  border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer'
                }}
              >
                Request Consultation
              </button>
            </form>
          </div>

          {/* Right Column: Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* What to Expect */}
            <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '500', color: '#111827', marginBottom: '1rem' }}>What to Expect</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', gap: '0.75rem' }}>
                  <span>⏱️</span>
                  <div>
                    <strong>30-Minute Session</strong>
                    <p style={{ color: '#6b7280', margin: 0 }}>Each consultation lasts about 30 minutes, giving you ample time to discuss your concerns.</p>
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '0.75rem' }}>
                  <span>📅</span>
                  <div>
                    <strong>Flexible Scheduling</strong>
                    <p style={{ color: '#6b7280', margin: 0 }}>Choose a time that works for you. We offer both in-person and virtual consultations.</p>
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '0.75rem' }}>
                  <span>👩‍⚕️</span>
                  <div>
                    <strong>Expert Advice</strong>
                    <p style={{ color: '#6b7280', margin: 0 }}>Our licensed estheticians provide personalized recommendations based on your unique skin.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Testimonial */}
            <div style={{ background: '#ecfdf3', borderRadius: '8px', padding: '1rem 1.5rem', fontStyle: 'italic', color: '#111827' }}>
              "The consultation was incredibly helpful. The specialist analyzed my skin and created a custom routine that actually works for my combination skin."
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem', gap: '0.75rem' }}>
                <div style={{ background: '#27ae60', color: '#fff', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                  JD
                </div>
                <div>
                  <strong>Jane Doe</strong><br />
                  Aurora Organics Client
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '500', color: '#111827', marginBottom: '1rem' }}>Consultation FAQs</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <strong>How much does a consultation cost?</strong>
                  <p style={{ color: '#6b7280', margin: 0 }}>Initial consultations are $45, which can be applied as credit toward product purchases.</p>
                </div>
                <div>
                  <strong>Should I come with clean skin?</strong>
                  <p style={{ color: '#6b7280', margin: 0 }}>Yes, please come with clean, makeup-free skin for the most accurate assessment.</p>
                </div>
                <div>
                  <strong>Can I bring current products?</strong>
                  <p style={{ color: '#6b7280', margin: 0 }}>Yes! We encourage you to bring your current skincare products for review.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default ConsultationForm;
