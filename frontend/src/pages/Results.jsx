import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../style.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Results = () => {
const [analysisData, setAnalysisData] = useState(null);
const [prediction, setPrediction] = useState('');
const [confidence, setConfidence] = useState(null);
const userEmail = sessionStorage.getItem('userEmail');

useEffect(() => {
if (userEmail) {
  fetch(`http://localhost:8000/api/analyze/latest/?user_email=${encodeURIComponent(userEmail)}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        setAnalysisData(data[0]);
      } else {
        console.error('No analysis data found for user.');
      }
    })
    .catch((error) => {
      console.error('Error fetching analysis data:', error);
    });
}
}, [userEmail]);

useEffect(() => {
  if (analysisData) {
    setPrediction(analysisData.predicted_condition);
    setConfidence(analysisData.confidence);  // ✅ Get from backend
  }
}, [analysisData]);



useEffect(() => {
fetch('http://localhost:8000/api/products/')
  .then(res => res.json())
  .then(data => setProducts(data))
  .catch(error => console.error('Error fetching products:', error));
}, []);

const [products, setProducts] = useState([]);

const skinMap = { dry: 'dry skin', oily: 'oily skin', combination: 'combination skin' };
const [predMap, setPredMap] = useState({});

useEffect(() => {
  fetch('http://localhost:8000/api/prediction-mapping/')
    .then(res => res.json())
    .then(data => setPredMap(data))
    .catch(err => console.error('Failed to load mapping:', err));
}, []);


const normSkin = analysisData ? skinMap[analysisData.skin_type] : null;
const keys = prediction ? (predMap[prediction.toLowerCase()] || []) : [];

const concern = sessionStorage.getItem('concern'); // Fetch skin concern from sessionStorage

const scored = products.map(p => {
  let score = 0;

  // NEW: AI Prediction Matching (highest priority)
  if (keys.length > 0 && p.targets && keys.some(k => p.targets.includes(k))) {
    score += 3;
  }

  // Skin Concern Matching (medium priority)
  if (concern && p.targets && p.targets.includes(concern.toLowerCase())) {
    score += 2;
  }

  // Skin Type Matching (lowest priority)
  if (normSkin && p.suitable_for && p.suitable_for.includes(normSkin)) {
    score += 1;
  }

  return { ...p, score };
});

const recommendations = scored
.filter(p => p.score > 0)
.sort((a, b) => b.score - a.score);

const numericConfidence = confidence !== null ? confidence : null;
const displayPrediction = prediction || 'No prediction';
const displayConfidence = numericConfidence !== null ? `${Math.round(numericConfidence * 100)}%` : 'N/A';

const handleAddToCart = async (item) => {
const user = sessionStorage.getItem('currentUserEmail');
if (!sessionStorage.getItem('isAuthenticated') || !user) {
  return toast.error('Please login to add items to cart.', { position: "top-center" });
}

try {
  // Fetch all products from your backend (same like Shop does)
  const response = await fetch('http://localhost:8000/api/products/');
  const allProducts = await response.json();

  // Find the product by name (matching recommendation name to real product)
  const matchedProduct = allProducts.find(prod => prod.name.toLowerCase() === item.name.toLowerCase());

  if (!matchedProduct) {
    toast.error('❗ Product not found in database.', { position: "top-center" });
    return;
  }

  // Build payload
  const payload = {
    user_email: user,
    product: matchedProduct.id,
    quantity: 1,
  };

  // Send to backend cart
  const addResponse = await fetch('http://localhost:8000/api/cart/add/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!addResponse.ok) {
    const errorData = await addResponse.json();
    throw new Error(errorData.error || "Failed to add product.");
  }

  toast.success(`✅ ${matchedProduct.name} added to cart!`, { position: "top-center" });
} catch (error) {
  console.error('Error adding to cart:', error);
  toast.error(`❗ ${error.message}`, { position: "top-center" });
}
};


return (
<div className="form-page" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
  {/* Left Panel */}
  <div style={{ flex: 1, minWidth: '320px', textAlign: 'center' }}>
    <h2 className="title">Analysis Result</h2>
    {analysisData && analysisData.image_data && (
      <img
        src={analysisData.image_data}
        className="preview"
        alt="Result"
        style={{ width: '100%', borderRadius: '10px' }}
      />
    )}
    <div className="legend" style={{ marginTop: '1rem', background: '#f0f0f0', padding: '1rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <p>🧠 AI detected: <strong>{displayPrediction}</strong></p>
      <p>Confidence: {displayConfidence}</p>
      <p>Skin Type: <strong>{analysisData ? analysisData.skin_type : 'N/A'}</strong></p>
      <p>Skin Concern: <strong>{analysisData ? analysisData.skin_concern : 'N/A'}</strong></p>
      {numericConfidence !== null && (
        <div style={{ marginTop: '1rem', background: '#fff3cd', padding: '1rem', borderRadius: '5px', border: '1px solid #ffeeba' }}>
          {numericConfidence < 0.8 ? (
            <p>Low confidence (&lt;80%). If you feel unsure, consult an Aurora specialist.</p>
          ) : (
            <p>AI suggests confidence above 80%. Still, feel free to consult an expert if needed.</p>
          )}
        </div>
      )}
    </div>
    <Link to="/profile" className="btn btn-outline" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
      Go to Profile
    </Link>
  </div>

  {/* Right Panel */}
  <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column' }}>
    <h2 className="title">Our Recommendations</h2>
    <p style={{ color: '#555' }}>Here are the best Aurora Organics products for you:</p>
    <div style={{ flex: 1, ...(recommendations.length > 2 && { maxHeight: '300px', overflowY: 'auto' }) }}>
      {recommendations.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '1rem', background: '#fff', padding: '1rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '1rem' }}>
          <img
              src={item.image}
              alt={item.name}
              style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', backgroundColor: '#f7f7f7' }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 'bold' }}>{item.name}</p>
              <p style={{ fontSize: '0.9rem', color: '#777' }}>
                {item.description ? item.description : 'No description available.'}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#999' }}>
                <em>When:</em> AM & PM
              </p>
              <button className="btn btn-primary" onClick={() => handleAddToCart(item)}>
                Add to Cart
              </button>
            </div>

        </div>
      ))}
      {recommendations.length === 0 && (
        <p>No tailored products found. Please explore our catalog.</p>
      )}
    </div>
  </div>
  <ToastContainer />
</div>
);
};

export default Results;
