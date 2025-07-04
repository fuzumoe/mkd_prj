import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import config from '../config/env.js';
import '../style.css';

const stripePromise = loadStripe(config.STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
const navigate = useNavigate();
const [cartItems, setCartItems] = useState([]);
const [form, setForm] = useState({
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States'
});

useEffect(() => {
  const userEmail = sessionStorage.getItem('currentUserEmail');
  if (!userEmail) {
    navigate('/login');
    return;
  }

  // Autofill the email field
  setForm(prev => ({
    ...prev,
    email: userEmail,
  }));

  fetch(`http://localhost:8000/api/cart/?user_email=${encodeURIComponent(userEmail)}`)
    .then(res => res.json())
    .then(data => {
      const unorderedItems = data.filter(item => !item.ordered);
      setCartItems(unorderedItems);
    })
    .catch(err => console.error('Failed to fetch cart items:', err));
}, [navigate]);


const handleChange = (e) => {
  const { name, value } = e.target;
  setForm(prev => ({ ...prev, [name]: value }));
};

const handlePayment = async (e) => {
  e.preventDefault();

  if (cartItems.length === 0) {
    alert('No items to checkout.');
    return;
  }

  const stripe = await stripePromise;

  const formattedCartItems = cartItems.map(item => ({
    product_name: item.product_name || item.name || item.pname,
    price: item.product_price || item.price,
    quantity: item.quantity,
  }));

  // 🚀 Save shipping form into localStorage before going to Stripe
  localStorage.setItem('shippingDetails', JSON.stringify(form));

  try {
    const response = await fetch('http://localhost:8000/api/create-checkout-session/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        cart: formattedCartItems,
        shipping_details: form,
      }),
    });

    const session = await response.json();

    if (response.ok) {
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error(result.error.message);
        alert(result.error.message);
      }
    } else {
      console.error('Server error:', session.error);
      alert('Failed to create checkout session.');
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('An unexpected error occurred.');
  }
};

const placeOrder = async (shippingDetails) => {
  console.log("🚀 Placing order now...");
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      const orderResponse = await fetch('http://localhost:8000/api/orders/place/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: shippingDetails.email,
          shipping_first_name: shippingDetails.firstName,
          shipping_last_name: shippingDetails.lastName,
          shipping_email: shippingDetails.email,
          shipping_address: shippingDetails.address,
          shipping_city: shippingDetails.city,
          shipping_state: shippingDetails.state,
          shipping_zip: shippingDetails.zip,
          shipping_country: shippingDetails.country,
        }),
      });

      if (orderResponse.ok) {
        console.log('✅ Order placed successfully.');
        navigate('/order-success');
        return; // Exit the function on success
      } else {
        attempts++;
        console.warn(`Attempt ${attempts} failed to place order.`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1 second before retry
      }
    } catch (error) {
      console.error('❗ Error placing order:', error);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000)); // wait before retry
    }
  }

  console.error('❗ All attempts to place order failed.');
  alert('Order could not be placed. Please contact support.');
};

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('success')) {
    console.log("✅ Stripe payment success detected");

    const savedShipping = JSON.parse(localStorage.getItem('shippingDetails'));
    if (savedShipping) {
      setForm(savedShipping);  // Restore form
      placeOrder(savedShipping); // Place order
      localStorage.removeItem('shippingDetails'); // Clear it after placing
    } else {
      // ✅ No alert if shippingDetails not found.
      console.warn('⚠️ Shipping details not found after payment. Likely already placed.');
    }
  }

  if (urlParams.get('canceled')) {
    console.log("❗ Stripe checkout was canceled");
    alert("Payment was canceled.");
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);



return (
  <div className="page-content" style={{ padding: '2rem', backgroundColor: '#f9fafb' }}>
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Checkout</h2>
      <form onSubmit={handlePayment} className="checkout-form">
        {/* Shipping Section */}
        <div className="section">
          <h3>Shipping Information</h3>
          <input name="firstName" type="text" value={form.firstName} onChange={handleChange} placeholder="First Name" required />
          <input name="lastName" type="text" value={form.lastName} onChange={handleChange} placeholder="Last Name" required />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
          <input name="address" type="text" value={form.address} onChange={handleChange} placeholder="Address" required />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input name="city" type="text" value={form.city} onChange={handleChange} placeholder="City" required />
            <input name="state" type="text" value={form.state} onChange={handleChange} placeholder="State" required />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input name="zip" type="text" value={form.zip} onChange={handleChange} placeholder="ZIP Code" required />
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: '#fff',
                color: '#111827'
              }}
            >
              <option value="">Select Country</option>
              <option value="United States">United States</option>
              <option value="Uganda">Uganda</option>
              <option value="Kenya">Kenya</option>
              <option value="Nigeria">Nigeria</option>
              <option value="United Kingdom">United Kingdom</option>
            </select>
          </div>
        </div>

        {/* Payment Section */}
        <div className="section">
          <h3>Payment Details</h3>
          <p>Secure payment will be handled via Stripe after clicking "Pay Now".</p>
        </div>

        <button type="submit" className="btn-submit" style={{ marginTop: '2rem', width: '100%' }}>
          Pay Now
        </button>
      </form>
    </div>
  </div>
);
};

export default Checkout;
