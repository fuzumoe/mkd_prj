import React from 'react';
import { useNavigate } from 'react-router-dom';

const PhotoInstructions = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/analyzer');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f4f8',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        maxWidth: '700px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.75rem', color: '#333', marginBottom: '1rem' }}>
          📸 Photo Guidelines
        </h2>

        <img
          src="/home/face_guide.jpg"
          alt="Photo Guide"
          style={{
            width: '100%',
            maxWidth: '300px',
            margin: '1.5rem auto',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        />

        <p style={{ color: '#555', fontSize: '1rem', marginBottom: '1.5rem' }}>
          Follow these tips to ensure your photo gives the most accurate skin analysis:
        </p>

        <ul style={{
          textAlign: 'left',
          fontSize: '0.95rem',
          color: '#444',
          paddingLeft: '1rem',
          lineHeight: '1.7',
          marginBottom: '2rem'
        }}>
          <li>📷 Use good, natural lighting – avoid shadows and backlighting.</li>
          <li>💡 Ensure your entire face is visible and centered in the frame.</li>
          <li>🧼 Clean your face before the photo – no makeup or filters.</li>
          <li>🪞 Remove glasses, masks, or hats before taking your photo.</li>
          <li>📵 Avoid blurry or low-resolution images.</li>
          <li>⏹ Stand still and hold the camera at face level.</li>
        </ul>

        <button
          onClick={handleContinue}
          style={{
            backgroundColor: '#1e88e5',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          I Understand, Continue to Analyzer
        </button>
      </div>
    </div>
  );
};

export default PhotoInstructions;
