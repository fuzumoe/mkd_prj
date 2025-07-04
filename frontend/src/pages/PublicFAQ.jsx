import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PublicFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/faqs/');
      setFaqs(res.data);
    } catch (error) {
      console.error('Failed to fetch FAQs', error);
    }
  };

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '2rem' }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: '#ffffff',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.07)'
      }}>
        <h2 style={{ textAlign: 'center', color: '#1A8D50', marginBottom: '2rem' }}>
          Frequently Asked Questions
        </h2>
  
        {faqs.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No FAQs available at the moment.</p>
        ) : (
          faqs.map((faq, index) => (
            <div key={faq.id} style={{
              background: '#f9fafb',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              marginBottom: '1rem',
              overflow: 'hidden'
            }}>
              <div
                onClick={() => toggleFAQ(index)}
                style={{
                  cursor: 'pointer',
                  padding: '1rem',
                  backgroundColor: '#f0fdf4',
                  fontWeight: 'bold',
                  color: '#1A8D50'
                }}
              >
                Q: {faq.question}
              </div>
              <div
                style={{
                  maxHeight: openIndex === index ? '500px' : '0px',
                  overflow: 'hidden',
                  transition: 'max-height 0.4s ease',
                  padding: openIndex === index ? '1rem' : '0 1rem',
                  backgroundColor: '#ffffff',
                  color: '#444'
                }}
              >
                A: {faq.answer}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );  
};

export default PublicFAQ;
