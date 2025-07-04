import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const AdminImages = () => {
  const [images, setImages] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [predictionFilter, setPredictionFilter] = useState('All');
  const [selectedImages, setSelectedImages] = useState(new Set());

  // Load analysis records (image_data + skin_concern fallback)
  useEffect(() => {
    fetch('http://localhost:8000/api/admin/analyze/list/')
      .then(res => res.json())
      .then(data => {
        const aggregated = [];
        const grouped = {};
        data.forEach(record => {
          const email = record.user_email;
          if (!grouped[email]) grouped[email] = [];
          grouped[email].push(record);
        });
        Object.entries(grouped).forEach(([email, recs]) => {
          recs.forEach((record, idx) => {
            aggregated.push({
              id: record.id,
              email,
              index: idx,
              url: record.image_data,
              skin_concern: record.skin_concern
            });
          });
        });
        setImages(aggregated);
      })
      .catch(err => console.error('Error fetching images:', err));
  }, []);

  // Fetch AI prediction for each image
  useEffect(() => {
    images.forEach(img => {
      if (!predictions[img.id]) {
        // convert dataURL to Blob
        const arr = img.url.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        const blob = new Blob([u8arr], { type: mime });

        const formData = new FormData();
        formData.append('image', blob, 'image.png');

        fetch('http://localhost:5000/predict', { method: 'POST', body: formData })
          .then(res => res.json())
          .then(data => {
            if (data.prediction) {
              setPredictions(prev => ({ ...prev, [img.id]: data.prediction }));
            }
          })
          .catch(err => console.error(`Error fetching prediction for ${img.id}:`, err));
      }
    });
  }, [images, predictions]);

  // Delete record
  const handleDelete = id => {
    if (!window.confirm('Delete this record?')) return;
    fetch(`http://localhost:8000/api/analyze/${id}/`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          setImages(prev => prev.filter(img => img.id !== id));
          setPredictions(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
      })
      .catch(err => console.error('Error deleting:', err));
  };

  // Download functions
  const handleDownloadAll = () => {
    const zip = new JSZip();
    images.forEach((img, i) => {
      const base64 = img.url.split(',')[1];
      zip.file(`image_${img.email}_${i}.png`, base64, { base64: true });
    });
    zip.generateAsync({ type: 'blob' }).then(blob => saveAs(blob, 'all_images.zip'));
  };

  const handleDownloadSelected = () => {
    const zip = new JSZip();
    images.filter(img => selectedImages.has(`${img.id}-${img.index}`)).forEach((img, i) => {
      const base64 = img.url.split(',')[1];
      zip.file(`selected_${img.email}_${i}.png`, base64, { base64: true });
    });
    zip.generateAsync({ type: 'blob' }).then(blob => saveAs(blob, 'selected_images.zip'));
  };

  // Selection toggle
  const toggleSelectImage = key => {
    setSelectedImages(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Build filter options from predictions (fallback to skin_concern)
  const optionsSet = new Set();
  images.forEach(img => {
    const pred = predictions[img.id] || img.skin_concern;
    optionsSet.add(pred);
  });
  const predictionOptions = ['All', ...optionsSet];

  // Filter displayed by prediction
  const displayedImages = images.filter(img => {
    const pred = predictions[img.id] || img.skin_concern;
    return predictionFilter === 'All' || pred === predictionFilter;
  });

  return (
    <div className="page-content" style={{ padding: '2rem', background: '#f9fafb' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Analyzed Image Records</h2>

      {images.length > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <label style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Filter by AI Prediction:</label>
          <select
            value={predictionFilter}
            onChange={e => setPredictionFilter(e.target.value)}
            style={{ padding: '0.5rem', marginRight: '1rem' }}
          >
            {predictionOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button onClick={handleDownloadAll} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', marginTop:'1rem'}}>
            Download All as ZIP
          </button>
          <button
            onClick={handleDownloadSelected}
            disabled={selectedImages.size === 0}
            style={{ padding: '0.5rem 1rem' }}
          >
            Download Selected
          </button>
        </div>
      )}

      {displayedImages.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#555' }}>No images found.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          {displayedImages.map(img => {
            const key = `${img.id}-${img.index}`;
            const pred = predictions[img.id] || img.skin_concern;
            return (
              <div key={key} style={{
                background: '#fff', borderRadius: '10px', padding: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', position: 'relative'
              }}>
                <input
                  type="checkbox"
                  checked={selectedImages.has(key)}
                  onChange={() => toggleSelectImage(key)}
                  style={{ position: 'absolute', top: '10px', right: '10px' }}
                />
                <img src={img.url} alt="Analyzed" style={{ width: '100%', borderRadius: '6px', marginBottom: '0.5rem' }} />
                <p><strong>AI Prediction:</strong> {pred}</p>
                <button
                  onClick={() => handleDelete(img.id)}
                  style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#E53E3E', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminImages;
