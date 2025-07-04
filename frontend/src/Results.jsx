import React from 'react';
import '../style.css';
import { Link } from 'react-router-dom'; 
const Results = () => {
  // Get the current user's email
  const userEmail = localStorage.getItem('userEmail');

  // Parse the allHistories object from localStorage
  const allHistories = JSON.parse(localStorage.getItem('allHistories')) || {};

  // Get this user's entire history array
  const userRecords = allHistories[userEmail] || [];

  // Grab the most recent entry for display
  const lastRecord = userRecords[userRecords.length - 1] || {};

  // Pull out the fields we need
  const analyzedImage = lastRecord.image;
  const skinType = lastRecord.skinType;
  const concern = lastRecord.skinConcern;
  // If you store AI fields in the same record, read them similarly:
  const prediction = lastRecord.aiPrediction;  // or whatever key you used
  const confidence = lastRecord.confidence;

  return (
    <div className="form-page">
      <div className="form-card">
        <h2 className="title">Analysis Results</h2>

        <div className="result-preview">
          {analyzedImage && (
            <img src={analyzedImage} alt="Analyzed Face" className="preview" />
          )}
        </div>

        <div className="result-info">
          <p><strong>Skin Type:</strong> {skinType || 'Not specified'}</p>
          <p><strong>Concern:</strong> {concern || 'Not specified'}</p>
          <p><strong>AI Detected:</strong> {Array.isArray(prediction) ? prediction.join(', ') : prediction || 'No prediction made'}</p>
          <p><strong>Confidence:</strong> {confidence ? `${Math.round(confidence * 100)}%` : 'N/A'}</p>
        </div>

        <div className="recommendations">
          <h3>Recommendations</h3>
          <ul>
            {concern === 'acne' && (
              <li>Use a gentle cleanser with salicylic acid</li>
            )}
            {concern === 'Rosacea' && (
              <li>Use fragrance-free, hypoallergenic cleansers and moisturizers that calm irritated skin.</li>
            )}
            {concern === 'pigmentation' && (
              <li>Use vitamin C serum and wear SPF 50+ every day</li>
            )}
            {concern === 'Keratosis Pilaris' && (
              <li>Use hydroxy acids (AHAs) or lactic acid to soften and smooth rough</li>
            )}
            {concern === 'Folliculitis' && (
              <li>Use Radiant plump Moisturizer every day</li>
            )}
            {!concern && (
              <li>No specific concern selected.</li>
            )}
          </ul>
        </div>
        {/* New button row */}
        <div className="form-row" style={{ marginTop: '20px' }}>
          <Link to="/profile" className="btn btn-outline">
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;
