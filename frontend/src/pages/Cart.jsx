import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style.css';
import { useContext } from 'react';
import { CartContext } from '../CartContext';

const Cart = () => {
  const { updateCartCount } = useContext(CartContext);

  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCurrentUser = () => {
    return sessionStorage.getItem('currentUserEmail');
  };

  useEffect(() => {
    const userEmail = getCurrentUser();
    if (!sessionStorage.getItem('isAuthenticated') || !userEmail) {
      alert('Please login to view your cart.');
      navigate('/login');
      return;
    }

    fetch(`http://localhost:8000/api/cart/?user_email=${encodeURIComponent(userEmail)}`)
      .then((response) => response.json())
      .then((data) => {
        const unorderedItems = data.filter(item => !item.ordered);
        setCartItems(unorderedItems);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching cart items:', error);
        setLoading(false);
      });
  }, [navigate]);

  const updateQuantity = (itemId, newQty) => {
    if (newQty < 1) return;

    fetch(`http://localhost:8000/api/cart/${itemId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update quantity');
        }
        setCartItems(prevItems => prevItems.map(item => item.id === itemId ? { ...item, quantity: newQty } : item));
        updateCartCount();
      })
      .catch(error => {
        alert(error.message);
      });
  };

  const removeFromCart = (itemId) => {
    fetch(`http://localhost:8000/api/cart/${itemId}/`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          const updatedCart = cartItems.filter(item => item.id !== itemId);
          setCartItems(updatedCart);
        
          // 🧠 Update sessionStorage so Navbar gets correct count
          const user = sessionStorage.getItem('currentUserEmail');
          sessionStorage.setItem(`cart_${user}`, JSON.stringify(updatedCart));
        
          updateCartCount();
        }
        else {
          throw new Error("Failed to remove item from cart");
        }
      })
      .catch(error => {
        alert(error.message);
      });
  };

  if (loading) {
    return <p>Loading cart items...</p>;
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * parseFloat(item.product_price || 0), 0);
  const shipping = subtotal > 100 ? 0 : 5.99;
  const total = (subtotal + shipping).toFixed(2);

  return (
    <div className="page-content" style={{ padding: '2rem', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Your Cart</h2>
        </div>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div style={{ display: 'flex', gap: '2rem' }}>
            {/* Cart Items */}
            <div style={{ flex: 2, background: '#fff', padding: '1rem', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem' }}>Cart Items</h3>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <img
                      src={item.product_image}
                      alt={item.product_name || 'Product Image'}
                      style={{ width: '80px', height: '80px', borderRadius: '8px', marginRight: '1rem', objectFit: 'cover' }}
                    />
                    
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{item.product_name || 'Unknown Product'}</h4>
                    <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>${item.product_price || '0.00'} each</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '0.25rem', borderRadius: '4px' }}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '0.25rem', borderRadius: '4px' }}>+</button>
                    </div>
                  </div>
                  <span style={{ fontWeight: '600', marginRight: '1rem' }}>
                    ${(item.quantity * parseFloat(item.product_price || 0)).toFixed(2)}
                  </span>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            {/* Summary */}
            <div style={{ flex: 1, background: '#fff', padding: '1rem', borderRadius: '8px', height: 'fit-content' }}>
              <h3>Order Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                <span>Shipping</span><span>${shipping.toFixed(2)}</span>
              </div>
              <hr />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', margin: '0.5rem 0' }}>
                <span>Total</span><span>${total}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Free shipping on orders over $100</p>
              <button
                onClick={() => navigate('/checkout')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#27ae60',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
              >
                Proceed to Checkout →
              </button>
              <button
                onClick={() => navigate('/shop')}
                style={{ background: 'none', border: 'none', color: '#111827', cursor: 'pointer', marginTop: '0.5rem' }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
