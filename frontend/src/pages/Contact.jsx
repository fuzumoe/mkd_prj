import React, { useState, useEffect } from 'react';
import '../style.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    order_number: '',
    inquiry_type: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // New state to track login

  useEffect(() => {
    const currentUserEmail = sessionStorage.getItem('currentUserEmail');
    if (currentUserEmail) {
      setFormData(prev => ({ ...prev, email: currentUserEmail }));
      setIsLoggedIn(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    fetch("http://localhost:8000/api/contact/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            console.error("Backend validation error:", JSON.stringify(data));
            throw new Error("Failed to send message. Check inputs.");
          });
        }
        return res.json();
      })
      .then(() => {
        toast.success('✅ Message sent successfully! We’ll respond within 24–48 hours.', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });        
        setFormData({
          name: '',
          email: isLoggedIn ? sessionStorage.getItem('currentUserEmail') || '' : '',
          phone: '',
          subject: '',
          order_number: '',
          inquiry_type: '',
          message: ''
        });
      })
      .catch(error => {
        alert(error.message);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="form-header">
          <h2>Contact Aurora Organics</h2>
        </div>
        <div className="form-text">
          <p>We'd love to hear from you! Fill out the form and our team will respond promptly.</p>
        </div>

        <form onSubmit={handleSubmit} className="form-box">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                readOnly={isLoggedIn}
                style={isLoggedIn ? { backgroundColor: '#e5e7eb', cursor: 'not-allowed' } : {}}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="order_number">Order Number (optional)</label>
              <input id="order_number" name="order_number" value={formData.order_number} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="inquiry_type">Inquiry Type *</label>
              <select id="inquiry_type" name="inquiry_type" value={formData.inquiry_type} onChange={handleChange} required>
                <option value="">Select an option</option>
                <option value="product">Product Inquiry</option>
                <option value="order">Order Support</option>
                <option value="wholesale">Wholesale Information</option>
                <option value="sustainability">Sustainability Practices</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows="5" required />
          </div>

          <div className="form-policy">
            <input type="checkbox" id="consent" name="consent" required />&nbsp;
            <label htmlFor="consent">
              I consent to Aurora Organics storing my data according to the <a href="/privacy-policy">Privacy Policy</a>
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
        <ToastContainer />
        <div className="form-footer">
          <p>For urgent inquiries, please call <strong>(555) 123-4567</strong></p>
          <p>Email: <a href="mailto:support@auroraorganics.com">info@auroraorganics.co</a></p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
