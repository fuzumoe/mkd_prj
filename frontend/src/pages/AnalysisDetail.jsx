import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../style.css';
import { jsPDF } from 'jspdf';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const AnalysisDetail = () => {
const { id } = useParams();
const navigate = useNavigate();
const [entry, setEntry] = useState(null);
const [prediction, setPrediction] = useState('');
const [confidence, setConfidence] = useState(null);

const handleAddToCart = async (item) => {
  const user = sessionStorage.getItem('currentUserEmail');
  if (!sessionStorage.getItem('isAuthenticated') || !user) {
    return toast.error('Please login to add items to cart.', { position: "top-center" });
  }

  try {
    // Fetch all real products
    const response = await fetch('http://localhost:8000/api/products/');
    const allProducts = await response.json();

    // Match product by name
    const matchedProduct = allProducts.find(prod => prod.name.toLowerCase() === item.name.toLowerCase());

    if (!matchedProduct) {
      toast.error('❗ Product not found in catalog.', { position: "top-center" });
      return;
    }

    const payload = {
      user_email: user,
      product: matchedProduct.id,
      quantity: 1,
    };

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
useEffect(() => {
  fetch('http://localhost:8000/api/products/')
    .then(res => res.json())
    .then(data => setProducts(data))
    .catch(error => console.error('Error fetching products:', error));
}, []);

const [products, setProducts] = useState([]);
const [predMap, setPredMap] = useState({});

const handleDownloadReport = () => {
  const doc = new jsPDF();

  // Aurora Header
  doc.setFontSize(22);
  doc.setTextColor(38, 70, 83); // Elegant dark green-blue
  doc.text('Aurora Organics', 20, 20);
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 25, 190, 25); // Underline

  // Section: Analysis Summary
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Skin Analysis Report', 20, 40);

  doc.setFontSize(12);
  doc.text(`Date: ${new Date(created_at).toLocaleDateString()}`, 20, 50);
  doc.text(`Skin Type: ${skin_type || 'Not specified'}`, 20, 60);
  doc.text(`Skin Concern: ${skin_concern || 'N/A'}`, 20, 70);
  doc.text(`AI Detected: ${displayPrediction}`, 20, 80);
  doc.text(`Confidence: ${displayConfidence}`, 20, 90);

  let currentY = 100;

  // Section: Insert analyzed image
  if (image_data) {
    const imgProps = doc.getImageProperties(image_data);
    const pdfWidth = 120;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    doc.addImage(image_data, 'PNG', 40, currentY, pdfWidth, pdfHeight);
    currentY += pdfHeight + 10;
  }

  // Section: Recommended Products
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Recommended Products:', 20, currentY);
  currentY += 10;

  doc.setFontSize(12);
  recommendations.forEach((item) => {
    if (currentY > 270) { 
      doc.addPage(); 
      currentY = 20; 
    }
    doc.text(`• ${item.name} (When: AM & PM)`, 25, currentY);
    currentY += 8;
  });

  // Save
  doc.save('aurora_analysis_report.pdf');
};



useEffect(() => {
  fetch(`http://localhost:8000/api/analyze/${id}/`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch analysis detail');
      }
      return response.json();
    })
    .then(data => {
      setEntry(data);
      setPrediction(data.predicted_condition);
      setConfidence(data.confidence);
    })
    .catch(error => {
      console.error('Error fetching analysis detail:', error);
      alert('Could not find analysis record. Redirecting to Profile...');
      navigate('/profile');
    });
}, [id, navigate]);  // ✅ This closes the useEffect properly

useEffect(() => {
  fetch('http://localhost:8000/api/prediction-mapping/')
    .then(res => res.json())
    .then(data => setPredMap(data))
    .catch(err => console.error('Failed to load mapping:', err));
}, []);

if (!entry) return null;

const { image_data, skin_type, skin_concern, created_at } = entry;

const displayPrediction = prediction || 'N/A';
const displayConfidence = confidence !== null ? `${Math.round(confidence * 100)}%` : 'N/A';

const skinMap = { dry: 'dry skin', oily: 'oily skin', combination: 'combination skin' };


const normSkin = skin_type ? skinMap[skin_type] : null;
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


return (
  <div className="form-page" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
    {/* Left Panel */}
    <div style={{ flex: 1, minWidth: '320px', textAlign: 'center' }}>
      <h2 className="title">Analysis Detail</h2>
      {image_data && (
        <img
          src={image_data}
          alt="Analyzed"
          className="preview"
          style={{ width: '100%', borderRadius: '10px' }}
        />
      )}
      <div
        className="legend"
        style={{ marginTop: '1rem', background: '#f0f0f0', padding: '1rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      >
        <p><strong>Date:</strong> {new Date(created_at).toLocaleDateString()}</p>
        <p style={{ fontSize: '1.1rem' }}>🧠 AI detected:</p>
        <p style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>{displayPrediction}</p>
        <p style={{ fontSize: '0.9rem', color: 'gray' }}>Confidence: {displayConfidence}</p>
        <p style={{ fontSize: '0.9rem', color: 'gray', marginTop: '0.5rem' }}>Skin Type: <strong>{skin_type || 'Not specified'}</strong></p>
        <p style={{ fontSize: '0.9rem', color: 'gray' }}>Skin Concern: <strong>{skin_concern || 'N/A'}</strong></p>
      </div>
      <button
        onClick={() => navigate('/profile')}
        className="btn btn-outline"
        style={{ marginTop: '1.5rem' }}
      >
        Back to Profile
      </button>
      <button
          onClick={handleDownloadReport}
          className="btn btn-primary"
          style={{ marginTop: '1rem', marginLeft: '1rem' }}
          >
          Download Report
      </button>

    </div>

    {/* Right Panel */}
    <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column' }}>
      <h2 className="title">Recommended Products</h2>
      {recommendations.length > 0 ? (
        <div style={{ flex: 1, ...(recommendations.length > 2 && { maxHeight: '460px', overflowY: 'auto' }) }}>
          {recommendations.map((item, idx) => (
            <div key={idx} style={{ border: '1px solid #eee', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', backgroundColor: '#fff', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', backgroundColor: '#f7f7f7' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>{item.name}</p>
                  <p style={{ fontSize: '0.9rem', color: '#777' }}>
                    {item.description ? item.description : 'No description available.'}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#999' }}>
                    <em>When:</em> AM & PM
                  </p>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="btn btn-primary"
                    style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    Add to Cart
                  </button>
                </div>

            </div>
          ))}

        </div>
      ) : (
        <p>No tailored products found. Please explore our catalog.</p>
      )}
    </div>
    <ToastContainer />
  </div>
);
};

export default AnalysisDetail;
