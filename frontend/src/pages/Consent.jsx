import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style.css';

const ConsentPage = () => {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState({
    terms: false,
    privacy: false,
    image: false,
  });
  const [checked, setChecked] = useState({
    terms: false,
    privacy: false,
    image: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCheckbox = (key) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = checked.terms && checked.privacy && checked.image;

  return (
    <div className="form-page" style={{ backgroundColor: '#f9fafb' }}>
      <div
        className="consent-container"
        style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '2rem',
        }}
      >
        <h1 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem' }}>
          Terms & Privacy Consent
        </h1>
        <p style={{ textAlign: 'center', color: '#555', marginBottom: '2rem' }}>
          Please review and accept our terms to continue using Aurora Organics
        </p>

        {/* Accordion */}
        <div style={{ marginBottom: '2rem' }}>
          {[
            {
              key: 'terms',
              title: 'Terms of Use',
              content: (
                <div style={{ padding: '1rem 0', color: '#444', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  <p>Welcome to Aurora Organics. By using our AI skin analyzer and other services, you agree to these Terms of Use.</p>
                  <ol style={{ marginLeft: '1.2rem' }}>
                    <li><strong>Service Description:</strong> Aurora Organics provides an AI-powered skin analysis service that offers personalized skincare recommendations based on user-provided images and information. Our service is for informational purposes only and does not replace professional medical advice.</li>
                    <li><strong>User Responsibilities:</strong> You are responsible for the accuracy of information you provide and for maintaining the confidentiality of your account credentials. You agree not to use our service for any illegal purposes or in ways that could disable, overburden, or impair the service.</li>
                    <li><strong>Limitations of Liability:</strong> Aurora Organics provides this service "as is" without warranties of any kind. We are not liable for any damages arising from your use of our service or inability to use our service.</li>
                  </ol>
                  <p>By using our service, you agree to these terms. If you do not agree, please do not use our service.</p>
                </div>
              ),
            },
            {
              key: 'privacy',
              title: 'Data Privacy Policy',
              content: (
                <div style={{ padding: '1rem 0', color: '#444', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  <p>At Aurora Organics, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
                  <ol style={{ marginLeft: '1.2rem' }}>
                    <li><strong>Information We Collect:</strong> We collect information you provide directly to us, including your name, email address, age bracket, allergy information, and images you upload for skin analysis. We also collect information about your use of our service.</li>
                    <li><strong>How We Use Your Information:</strong> We use your information to provide and improve our service, personalize your experience, communicate with you, process transactions, and for research and development purposes.</li>
                    <li><strong>Information Sharing:</strong> We do not sell your personal information. We may share your information with service providers who help us deliver our service, when required by law, or in connection with business transfers.</li>
                    <li><strong>Your Rights and Choices:</strong> You have the right to access, correct, or delete your personal information. You can manage your communication preferences through your account settings.</li>
                  </ol>
                </div>
              ),
            },
            {
              key: 'image',
              title: 'Image Usage Policy',
              content: (
                <div style={{ padding: '1rem 0', color: '#444', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  <p>By using our skin analysis service, you agree to the following terms regarding the images you upload.</p>
                  <ol style={{ marginLeft: '1.2rem' }}>
                    <li><strong>How We Use Your Images:</strong> Images you upload are used solely for the purpose of providing you with skin analysis and personalized product recommendations. Your images are processed by our AI algorithms to identify skin conditions and concerns.</li>
                    <li><strong>Image Storage and Retention:</strong> We store your images securely for the purpose of providing our service to you. Images are retained to allow you to review your skin analysis history and track changes over time. You can delete your images at any time through your account settings.</li>
                    <li><strong>Service Improvement:</strong> With your explicit consent, we may use anonymized versions of your images to improve our AI algorithms. No personally identifiable information will be associated with these anonymized images.</li>
                    <li><strong>Third-Party Access:</strong> Your images are not shared with third parties except as required to provide our service (e.g., cloud storage providers who are bound by confidentiality agreements).</li>
                  </ol>
                </div>
              ),
            },
          ].map(({ key, title, content }) => (
            <div key={key} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <button
                onClick={() => toggleSection(key)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#111827',
                  display: 'flex',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                {title}
                <span>{openSections[key] ? '▾' : '▸'}</span>
              </button>
              {openSections[key] && content}
            </div>
          ))}
        </div>

        {/* Consent Checkboxes */}
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1.5rem',
            background: '#ffffff',
          }}
        >
          {[
            {
              key: 'terms',
              label: 'Terms of Use',
              desc: 'I acknowledge that I have read and agree to the Terms of Use.',
            },
            {
              key: 'privacy',
              label: 'Data Privacy Policy',
              desc: 'I acknowledge that I have read and agree to the Data Privacy Policy.',
            },
            {
              key: 'image',
              label: 'Image Usage Policy',
              desc: 'I allow Aurora Organics to collect, store, and process images I upload for the purpose of skin analysis and service improvement.',
            },
          ].map(({ key, label, desc }) => (
            <label
              key={key}
              style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1rem', gap: '0.75rem' }}
            >
              <input
                type="checkbox"
                checked={checked[key]}
                onChange={() => handleCheckbox(key)}
                style={{ marginTop: '0.2rem', transform: 'scale(1.2)' }}
              />
              <div>
                <div style={{ fontWeight: '500', color: '#111827' }}>{label}</div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>{desc}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={() => navigate('/photo-instructions')}
          disabled={!allChecked}
          style={{
            marginTop: '1.5rem',
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#fff',
            backgroundColor: allChecked ? '#6a18ff' : '#c4b5fd',
            border: 'none',
            borderRadius: '8px',
            cursor: allChecked ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.3s',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ConsentPage;
