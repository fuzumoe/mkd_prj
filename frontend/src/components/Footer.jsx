import React from 'react';
import '../Footer.css'; // Import the CSS file

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-column footer-brand">
            <h3>AURORA ORGANICS</h3>
            <p>Advanced AI Skin Analysis</p>
            <p>Organic, Science-Backed</p>
            <p>Expert Support</p>
          </div>

          <div className="footer-column">
            <h3>COMPANY</h3>
            <ul className="footer-links">
              <li><a href="/about">About Us</a></li>
              <li><a href="/blogs">Blog</a></li>
              <li><a href="#careers">Careers</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>RESOURCES</h3>
            <ul className="footer-links">
              <li><a href="#guides">Skin Guides</a></li>
              <li><a href="#ingredients">Ingredients</a></li>
              <li><a href="/public-faq">FAQs</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>SUPPORT</h3>
            <ul className="footer-links">
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/consent">Privacy Policy</a></li>
              <li><a href="/consent">Terms of Service</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>CONNECT</h3>
            <div className="social-icons">
              <a href="https://www.instagram.com/auroraorganics4u/"><i className="fab fa-instagram"></i></a>
              <a href="#facebook"><i className="fab fa-facebook"></i></a>
              <a href="http://www.linkedin.com/company/auroraorganics"><i className="fab fa-linkedin"></i></a>
            </div>
          </div>
        </div>

        <div className="copyright">
          <p>© 2025 Aurora Organics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;