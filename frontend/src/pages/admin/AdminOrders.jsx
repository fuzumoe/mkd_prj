import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminOrders = () => {
const [orders, setOrders] = useState([]);
const navigate = useNavigate();
const [downloadOption, setDownloadOption] = useState('all'); // 'all' or 'today'

useEffect(() => {
  const isAdminAuthenticated = sessionStorage.getItem('isAdminAuthenticated');
  if (isAdminAuthenticated !== 'true') {
    navigate('/admin-login');
    return;
  }

  fetch('http://localhost:8000/api/admin/orders/')
    .then(res => res.json())
    .then(data => setOrders(data))
    .catch(err => console.error('Failed to fetch orders:', err));
}, [navigate]);

const handleDownloadPDF = () => {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleString();

  doc.setFontSize(18);
  doc.text('Aurora Organics Orders Receipt (Admin Copy)', 14, 20);

  doc.setFontSize(12);
  doc.text(`Document Generated: ${currentDate}`, 14, 30);

  const tableColumn = ["Order ID", "User Email", "City", "Country", "Products Ordered", "Order Date", "Total ($)", "Status"];
  const tableRows = [];

  // 🛠 Handle "today" filter or "all"
  let filteredOrders = orders;

  if (downloadOption === 'today') {
    const today = new Date();
    filteredOrders = orders.filter(order => {
      if (!order.date) return false;
      const orderDate = new Date(order.date);
      return orderDate.toDateString() === today.toDateString();
    });

    if (filteredOrders.length === 0) {
      alert("No orders placed today.");
      return; // Exit early if no orders today
    }
  }

  filteredOrders.forEach(order => {
    const orderData = [
      order.id,
      order.user_email,
      order.shipping_city,
      order.shipping_country,
      order.items && order.items.length > 0
        ? order.items.map(item => `${item.product_name} (x${item.quantity})`).join(", ")
        : "No products",
      order.date ? new Date(order.date).toLocaleDateString() : "Unknown date",
      Number(order.total).toFixed(2),
      order.status
    ];
    tableRows.push(orderData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
  });

  const filenameSuffix = downloadOption === 'today' ? 'Today' : 'All';
  doc.save(`Aurora_Orders_Admin_${filenameSuffix}_${new Date().toISOString().slice(0,10)}.pdf`);
};

const confirmOrder = (id) => {
  fetch(`http://localhost:8000/api/admin/orders/${id}/update/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'confirmed' }),
  })
    .then((response) => {
      if (response.ok) {
        console.log('✅ Order confirmed successfully.');
        // ✅ Instead of just updating frontend, fetch fresh orders
        fetch('http://localhost:8000/api/admin/orders/')
          .then(res => res.json())
          .then(data => setOrders(data))
          .catch(err => console.error('Failed to refresh orders:', err));
      } else {
        console.error('❗ Failed to confirm order.');
      }
    })
    .catch(err => console.error('Failed to confirm order:', err));
};


const deleteOrder = (id) => {
  fetch(`http://localhost:8000/api/admin/orders/${id}/delete/`, {
    method: 'DELETE'
  })
    .then(() => setOrders(orders.filter(order => order.id !== id)))
    .catch(err => console.error('Failed to delete order:', err));
};

return (
  <div className="page-content">
    <h2 style={{color:'green', textAlign:'center'}}>Admin Orders</h2>
    <div style={{ marginBottom: '1rem' }}>
      <select
        value={downloadOption}
        onChange={(e) => setDownloadOption(e.target.value)}
        style={{
          padding: '0.5rem',
          borderRadius: '8px',
          fontSize: '1rem',
          border: '1px solid #d1d5db',
          marginRight: '1rem'
        }}
      >
        <option value="all">Download All Orders</option>
        <option value="today">Download Today's Orders</option>
      </select>

      <button onClick={handleDownloadPDF} className="btn-download" style={{marginTop:'2rem', marginLeft:'25rem'}}>
        Download PDF
      </button>
    </div>


    <div className="admin-orders-container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        marginTop: '2rem'
      }}>
        {orders.length === 0 ? (
          <p>No orders available.</p>
        ) : (
          orders.map(order => (
            <div key={order.id} className="admin-order-card" style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '10px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
            }}>

            <h4>Order #{order.id}</h4>
            <p><strong>User Email:</strong> {order.user_email}</p>
            <p><strong>Shipping Address:</strong> {order.shipping_address}</p>
            <p><strong>Shipping City:</strong> {order.shipping_city}</p>
            <p><strong>Shipping Country:</strong> {order.shipping_country}</p>
            <p><strong>Total Amount:</strong> ${order.total}</p>

            {/* Products Ordered */}
            {order.items && order.items.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4>Products Ordered:</h4>
                {order.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <img
                      src={item.product_image ? item.product_image : '/default-placeholder.png'}
                      alt={item.product_name || 'Product'}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginRight: '10px' }}
                    />
                    <div>
                      <p><strong>Name:</strong> {item.product_name}</p>
                      <p><strong>Price:</strong> ${item.product_price}</p>
                      <p><strong>Quantity:</strong> {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Status */}
            <div className="admin-order-payment">
              <h4>Payment Status</h4>
              <p><strong>Status:</strong> {order.payment_status === 'paid' ? '✅ Paid' : '❌ Unpaid'}</p>
            </div>

            {/* Order Status */}
            <p><strong>Order Status:</strong> {order.status}</p>

            {/* Buttons */}
            <div style={{ marginTop: '10px' }}>
              {order.status === 'pending' && order.payment_status === 'paid' && (
                <button onClick={() => confirmOrder(order.id)} className="btn-confirm">
                  Confirm Order
                </button>
              )}
              <button onClick={() => deleteOrder(order.id)} className="btn-delete">
                Delete Order
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);
};

export default AdminOrders;
