import React, { useContext, useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CartContext } from '../CartContext';
import '../Navbar.css';

const Navbar = () => {
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isLoggedIn = sessionStorage.getItem('isAuthenticated') === 'true';
  const name = sessionStorage.getItem('userName');

  const handleLogout = () => {
    const userEmail = sessionStorage.getItem('currentUserEmail');
    if (userEmail) {
      sessionStorage.removeItem(`cart_${userEmail}`);
    }
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('currentUserEmail');
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mainLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/analyzer', label: 'Aurora AI' },
    { path: '/shop', label: 'Shop' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav className='navbar'>
      <div className="navbar-brand">
        <NavLink to="/">
          <img src="/home/logo-1.png" alt="Aurora Organics" />
        </NavLink>
      </div>

      <div className="navbar-links">
        {mainLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active-nav-link' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}

        {!isLoggedIn ? (
          <>
            <NavLink to="/login" className="nav-link">Login</NavLink>
            <NavLink to="/register" className="nav-link">Register</NavLink>
          </>
        ) : (
          <>
            {/* Cart */}
            <div style={{ position: 'relative' }}>
              <NavLink to="/cart" className="nav-link" style={{ fontSize: '1.25rem' }}>
                🛒
              </NavLink>
              <div className="cart-badge">{cartCount}</div>
            </div>

            {/* Avatar and Dropdown */}
            <div className="user-initials-container" ref={dropdownRef}>
              <div
                className="user-avatar"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                {name ? name.split(" ").map((word) => word[0]).slice(0, 2).join('') : "?"}
              </div>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <NavLink to="/welcome" className="dropdown-item">📊 My Dashboard</NavLink>
                  <NavLink to="/profile" className="dropdown-item">👤 My Profile</NavLink>
                  <NavLink to="/orders" className="dropdown-item">🛍️ My Orders</NavLink>
                  <div onClick={handleLogout} className="dropdown-item logout">🚪 Logout</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
