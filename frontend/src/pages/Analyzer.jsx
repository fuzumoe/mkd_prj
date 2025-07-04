import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import getCroppedImg from './utils/cropImage';
import { apiCall, API_ENDPOINTS } from '../utils/api.js';
import '../style.css';

const Analyzer = () => {
const [preview, setPreview] = useState(null);
const [skinType, setSkinType] = useState('');
const [skinConcern, setSkinConcern] = useState('');
const videoRef = useRef(null);
const canvasRef = useRef(null);
const [cameraOn, setCameraOn] = useState(false);
const [stream, setStream] = useState(null);
const [cropping, setCropping] = useState(false);
const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
const navigate = useNavigate();

useEffect(() => {
  if (cameraOn && videoRef.current && stream) {
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  }
  return () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };
}, [cameraOn, stream]);

const startCamera = async () => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    setStream(mediaStream);
    setCameraOn(true);
  } catch (err) {
    console.error('Error accessing webcam:', err);
  }
};

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    setStream(null);
  }
  setCameraOn(false);
};

const captureImage = () => {
  const canvas = canvasRef.current;
  const video = videoRef.current;
  if (canvas && video) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    setPreview(dataURL);
    stopCamera();
    setCropping(true);
  }
};

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onloadend = () => {
    setPreview(reader.result);
    setCropping(true);
  };
  if (file) reader.readAsDataURL(file);
};

const onCropComplete = useCallback((_, croppedAreaPixels) => {
  setCroppedAreaPixels(croppedAreaPixels);
}, []);

const handleCropConfirm = async () => {
  try {
    const croppedImage = await getCroppedImg(preview, croppedAreaPixels);
    setPreview(croppedImage);
    setCropping(false);
  } catch (e) {
    console.error('Cropping failed:', e);
  }
};

const handleAnalyze = async () => {
  const userEmail = sessionStorage.getItem('userEmail');

  // Step 1: Send image to Flask AI
  const formData = new FormData();
  const blob = await fetch(preview).then(res => res.blob());
  formData.append('image', blob);

  try {
    const aiResponse = await apiCall(API_ENDPOINTS.FLASK.PREDICT, {
      method: "POST",
      body: formData,
    });

    const aiData = await aiResponse.json();

    const newEntry = {
      user_email: userEmail,
      skin_type: skinType,
      skin_concern: skinConcern,
      predicted_condition: aiData.prediction,
      confidence: aiData.confidence,  // ✅ Add this
      image_data: preview,
    };
    

    const response = await fetch('http://127.0.0.1:8000/api/analyze/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry)
    });

    if (response.ok) {
      const saved = await response.json();
      localStorage.setItem('latest_analysis_id', saved.id); // ✅ track for Results
      localStorage.setItem('skinType', skinType);
      localStorage.setItem('concern', skinConcern);
      navigate('/results');
    } else {
      const errorData = await response.json();
      console.error('Error saving analysis:', errorData);
      alert('Failed to save analysis. Please try again.');
    }

  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while analyzing your image.');
  }
};

return (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem',
    backgroundColor: '#f5f8fa',
    minHeight: '100vh'
  }}>
    <div style={{
      backgroundColor: '#fff',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '720px'
    }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>AI Skin Analyzer</h2>

      {preview && cropping ? (
        <div>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '400px',
            background: '#ddd',
            borderRadius: '10px',
            marginBottom: '1rem'
          }}>
            <Cropper
              image={preview}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <button onClick={handleCropConfirm} className="btn btn-outline">
            Confirm Crop
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
            <select
              value={skinType}
              onChange={(e) => setSkinType(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
            >
              <option value="">Select Skin Type</option>
              <option value="dry">Dry Skin</option>
              <option value="oily">Oily Skin</option>
              <option value="combination">Combination</option>
              <option value="dry hair scalp">Dry hair Scalp</option>
            </select>
            <select
              value={skinConcern}
              onChange={(e) => setSkinConcern(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
            >
              <option value="">Select Skin Concern</option>
              <option value="wrinkles">Wrinkles</option>
              <option value="dark spots">Dark spots</option>
              <option value="irritation">Irritation</option>
              <option value="Redness">Redness</option>
              <option value="dry lips">Dry lips</option>
              <option value="hair follicles">Hair follicles</option>
            </select>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
            borderRadius: '10px',
            padding: '1rem',
            minHeight: '300px',
            marginBottom: '1.5rem'
          }}>
            {cameraOn ? (
              <video ref={videoRef} autoPlay playsInline style={{ borderRadius: '10px', width: '100%' }} />
            ) : (
              preview && <img src={preview} alt="Preview" style={{ borderRadius: '10px', width: '100%' }} />
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center'
          }}>
            {!cameraOn && (
              <button onClick={startCamera} className="btn btn-outline">
                Start Camera
              </button>
            )}

            {cameraOn && (
              <>
                <button onClick={captureImage} className="btn btn-primary">Capture Image</button>
                <button onClick={stopCamera} className="btn btn-danger">Cancel Camera</button>
              </>
            )}

            <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>

            <button
              onClick={handleAnalyze}
              disabled={!preview || !skinType || !skinConcern}
              className="btn btn-primary"
            >
              Analyze Now
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);
};

export default Analyzer;
