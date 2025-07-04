import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem('userName') || 'Valued Customer';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const consultation_id = params.get('consultation_id');

    if (consultation_id) {
      fetch(`http://localhost:8000/api/admin/consultations/${consultation_id}/update/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_confirmed: true })
      })
        .then((res) => res.json())
        .then(() => {
          toast.success('Payment confirmed successfully!');
          setTimeout(() => navigate('/welcome'), 3000);
        })
        .catch(() => toast.error('Error confirming payment.'));
    }
  }, [navigate]);

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0fdf4',
      padding: '2rem',
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      <ToastContainer position="top-center" />
      <img
        src="/success-check.svg"
        alt="Success"
        style={{ width: '100px', marginBottom: '1rem' }}
      />
      <h2 style={{ color: '#1a8d50', marginBottom: '0.5rem' }}>✅ Payment Successful</h2>
      <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
        Thank you, <strong>{userName}</strong>, your consultation payment has been received.
      </p>
      <p style={{ fontSize: '1rem', color: '#555' }}>
        You will be redirected to your dashboard shortly...
      </p>
    </div>
  );
};

export default PaymentSuccess;
