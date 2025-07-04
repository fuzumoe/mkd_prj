import React, { useEffect, useState } from 'react';
import '../../style.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 5;

  useEffect(() => {
    fetch("http://localhost:8000/api/admin/contact-messages/")
      .then(response => response.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching contact messages:", error);
        setLoading(false);
      });
  }, []);

  const handleDeleteMessage = (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    fetch(`http://localhost:8000/api/admin/contact-messages/${id}/delete/`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          setMessages(prevMessages => prevMessages.filter(msg => msg.id !== id));
          toast.success('✅ Message deleted successfully.', {
            position: "top-center",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else {
          console.error('Failed to delete message.');
        }
      })
      .catch(error => {
        console.error('Error deleting message:', error);
      });
  };

  const indexOfLast = currentPage * messagesPerPage;
  const indexOfFirst = indexOfLast - messagesPerPage;
  const currentMessages = messages.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(messages.length / messagesPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  if (loading) {
    return <p className="admin-loading">Loading messages...</p>;
  }

  return (
    <div className="admin-orders-container">
      <h2 className="admin-orders-title">📥 Inbox – Contact Messages</h2>

      {messages.length === 0 ? (
        <p className="admin-no-orders">No contact messages found.</p>
      ) : (
        <>
          <div className="admin-orders-grid">
            {currentMessages.map(msg => (
              <div key={msg.id} className="admin-order-card message-card">
                <div className="message-header">
                  <h3>{msg.subject}</h3>
                  <span className="message-type">{msg.inquiry_type}</span>
                </div>

                <div className="message-meta">
                  <p><strong>Name:</strong> {msg.name}</p>
                  <p><strong>Email:</strong> <a href={`mailto:${msg.email}`}>{msg.email}</a></p>
                  {msg.phone && <p><strong>Phone:</strong> {msg.phone}</p>}
                  {msg.order_number && <p><strong>Order #:</strong> {msg.order_number}</p>}
                  <p><strong>Received:</strong> {new Date(msg.created_at).toLocaleString()}</p>
                </div>

                <div className="message-body">
                  <p>{msg.message}</p>
                </div>

                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="btn-delete"
                    style={{
                      backgroundColor: '#228132',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete Message
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination-controls">
            <button onClick={handlePrev} disabled={currentPage === 1}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
          </div>
        </>
      )}

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default AdminMessages;
