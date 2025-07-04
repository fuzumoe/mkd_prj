import React, {useEffect, useState } from 'react';
import Carousel from '../components/Carousel';
import '../home.css'
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  useEffect(() => {
    fetch('http://localhost:8000/api/products/')
      .then((res) => res.json())
      .then((data) => setFeaturedProducts(data.slice(0, 4)))
      .catch((err) => console.error('Failed to load featured products', err));
  }, []);

  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/approved-ratings/')
      .then(res => res.json())
      .then(data => setTestimonials(data))
      .catch(err => console.error('Failed to load testimonials', err));
  }, []);

  return (
    <div className="main_container">
      {/* Carousel remains unchanged */}
      <Carousel />

      {/* Hero Section */}
      <section className="hero-section" style={{ backgroundColor: '#f0fff4', padding: '4rem 0' }}>
        <div className="hero-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="hero-text" style={{ flex: 1, marginRight: '2rem' }}>
            <h1 style={{ fontSize: '3rem', color: '#2e8b57', marginBottom: '1rem' }}>
              AI-Powered <span style={{ color: '#154734' }}>Skin Analysis</span> for Your Unique Needs
            </h1>
            <p style={{ fontSize: '1.125rem', color: '#333', marginBottom: '2rem' }}>
              Get personalized skincare recommendations based on advanced AI analysis of your skin profile.
            </p>
            <div className="hero-buttons" style={{ display: 'flex', alignItems: 'center' }}>
              <a href="/analyzer" style={{ backgroundColor: '#2e8b57', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none', marginRight: '1rem' }}>
                Get Started
              </a>
              <a href="/shop" style={{ backgroundColor: '#fff', color: '#2e8b57', border: '2px solid #2e8b57', padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none' }}>
                Explore Products
              </a>
            </div>
            <div className="hero-features" style={{ display: 'flex', marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginRight: '2rem' }}>
                {/* icon */}
                <span style={{ marginLeft: '0.5rem', color: '#2e8b57' }}>AI-Powered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginRight: '2rem' }}>
                <span style={{ marginLeft: '0.5rem', color: '#2e8b57' }}>Personalized</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginLeft: '0.5rem', color: '#2e8b57' }}>Cruelty-Free</span>
              </div>
            </div>
          </div>
          <div className="hero-image" style={{ flex: 1 }}>
            <img src="/home/Analyzer.png" alt="Advanced Skin Analysis" style={{ width: '100%', borderRadius: '12px', height:'500px' }} />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" style={{ padding: '4rem 0' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', color: '#2e8b57', marginBottom: '1rem' }}>How It Works</h2>
        <p style={{ textAlign: 'center', color: '#555', marginBottom: '3rem' }}>
          Our AI-powered skin analysis provides personalized skincare recommendations in just a few easy steps.
        </p>
        <div className="steps-grid" style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '100%', margin: '0 auto' }}>
          {[{
            number: 1,
            title: 'Upload a Photo',
            description: 'Take or upload a clear photo of your face in good lighting.',
            img: '/home/upload.png'
          }, {
            number: 2,
            title: 'AI Analysis',
            description: 'Our advanced AI analyzes your skin condition and identifies key concerns.',
            img: '/home/Analyzer.png'
          }, {
            number: 3,
            title: 'Get Recommendations',
            description: 'Receive personalized product recommendations tailored to your skin\'s needs.',
            img: '/home/unsplash.avif'
          }].map(step => (
            <div key={step.number} className="step-card" style={{ textAlign: 'center', flex: '1', margin: '0 1rem' }}>
              <div className="step-number" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: '#2e8b57', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                {step.number}
              </div>
              <img src={step.img} alt={step.title} style={{ borderRadius: '8px', width: '100%', height: '200px', objectFit: 'cover' }} />
              <h3 style={{ marginTop: '1rem', color: '#2e8b57' }}>{step.title}</h3>
              <p style={{ color: '#555' }}>{step.description}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <a href="/analyzer" style={{ backgroundColor: '#2e8b57', color: '#fff', padding: '0.75rem 2rem', borderRadius: '4px', textDecoration: 'none' }}>
            Try Skin Analysis Now
          </a>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products" style={{ backgroundColor: '#f9fafb', padding: '4rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '100%', margin: '0 auto', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', color: '#2e8b57' }}>Featured Products</h2>
          <a href="/shop" style={{ color: '#2e8b57', textDecoration: 'none' }}>View All Products</a>
        </div>
        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', maxWidth: '100%', margin: '0 auto' }}>
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card" style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
              <h3 style={{ margin: '1rem 0 0.5rem', color: '#2e8b57' }}>{product.name}</h3>
              <p style={{ fontSize: '1.125rem', color: '#333', marginBottom: '1rem' }}>${product.price}</p>
              <button style={{ backgroundColor: '#2e8b57', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials" style={{ padding: '4rem 0' }}>
        <h2 style={{ textAlign: 'center', color: '#2e8b57', fontSize: '2rem', marginBottom: '2rem' }}>What Our Customers Say</h2>
        <div className="testimonial-grid" style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '100%', margin: '0 auto' }}>
        {testimonials.length > 0 ? (
          testimonials.map((user, index) => (
            <div key={index} className="testimonial-card" style={{ textAlign: 'center', flex: '1', margin: '0 0.5rem', padding: '1rem' }}>
              <img
                src={user.profile_image_url || '/default-avatar.png'}
                alt={user.user_name}
                style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '1rem' }}
              />
              <div className="stars" style={{ color: '#2e8b57', marginBottom: '0.5rem' }}>
                {'★'.repeat(user.stars)}{'☆'.repeat(5 - user.stars)}
              </div>
              <p style={{ fontStyle: 'italic', color: '#555' }}>&quot;{user.comment}&quot;</p>
              <p style={{ fontWeight: 'bold', color: '#333', marginTop: '0.5rem' }}>{user.user_name}</p>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', width: '100%' }}>No testimonials yet.</p>
        )}

        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta" style={{ backgroundColor: '#f0fff4', padding: '4rem 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', color: '#2e8b57', marginBottom: '1rem' }}>Ready to Discover Your Perfect Skincare Routine?</h2>
        <p style={{ color: '#555', marginBottom: '2rem' }}>Join thousands of satisfied customers who have transformed their skincare with our AI-powered analyzer.</p>
        <a href="/analyzer" style={{ backgroundColor: '#2e8b57', color: '#fff', padding: '0.75rem 2rem', borderRadius: '4px', textDecoration: 'none' }}>
          Get Started Now
        </a>
      </section>
    </div>
  );
};

export default Home;
