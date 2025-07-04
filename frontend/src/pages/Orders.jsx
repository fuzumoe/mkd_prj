import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style.css';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userEmail = sessionStorage.getItem('currentUserEmail');
    if (!userEmail) {
      navigate('/login');
      return;
    }
    fetch(`http://localhost:8000/api/orders/?user_email=${encodeURIComponent(userEmail)}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
        setLoading(false);
      });
  }, [navigate]);

  if (loading) return <p style={{ textAlign: 'center' }}>Loading orders...</p>;

  return (
    <div className="page-content" style={{ padding: '2rem', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>My Orders</h2>

        {orders.length === 0 ? (
          <p style={{ textAlign: 'center' }}>You have not placed any orders yet.</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            {orders.map(order => (
              <div key={order.id} style={{
                background: '#fff',
                borderRadius: '10px',
                padding: '1.5rem',
                boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
              }}>
          
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: '0 0 0.25rem', fontWeight: '600' }}>Order ID: #{order.id}</p>
                    <p style={{ margin: 0, color: '#6b7280' }}>Placed on: {new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      backgroundColor: order.status === 'shipped' ? '#4ade80' : '#facc15',
                      color: '#111827',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h4>Shipping Details:</h4>
                  <p style={{ margin: '0.25rem 0' }}>
                    {order.shipping_first_name} {order.shipping_last_name}
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>{order.shipping_address}, {order.shipping_city}, {order.shipping_state}, {order.shipping_zip}, {order.shipping_country}</p>
                </div>

                <div>
                  <h4>Products Ordered:</h4>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                      <img src={item.product_image} alt={item.product_name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', backgroundColor: '#f3f4f6' }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: '500' }}>{item.product_name}</p>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>Qty: {item.quantity}</p>
                      </div>
                      <p style={{ margin: 0, fontWeight: '600' }}>${(item.product_price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'right', marginTop: '1rem', fontWeight: '700', fontSize: '1.1rem' }}>
                  Total: ${parseFloat(order.total).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
