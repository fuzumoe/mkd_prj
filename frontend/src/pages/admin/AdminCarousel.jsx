import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const AdminCarousel = () => {
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState(null);
  const [title, setTitle] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCarouselImages();
  }, []);

  const fetchCarouselImages = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/admin/carousel/manage/');
      setImages(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load carousel images');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newImage && !editingId) return toast.warn('Please select an image');

    const formData = new FormData();
    if (newImage) formData.append('image', newImage);
    formData.append('title', title);
    formData.append('order', order);
    formData.append('is_active', isActive);

    try {
      const url = editingId
        ? `http://localhost:8000/api/admin/carousel/manage/${editingId}/`
        : 'http://localhost:8000/api/admin/carousel/manage/';

      const method = editingId ? 'patch' : 'post';

      await axios({
        method,
        url,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(editingId ? 'Image updated' : 'Image uploaded successfully');
      setEditingId(null);
      setNewImage(null);
      setTitle('');
      setOrder(0);
      setIsActive(true);
      fetchCarouselImages();
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image');
    }
  };

  const handleEdit = (img) => {
    setNewImage(null);
    setTitle(img.title);
    setOrder(img.order);
    setIsActive(img.is_active);
    setEditingId(img.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/carousel/manage/${id}/`);
      toast.success('Image deleted');
      fetchCarouselImages();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete image');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', fontFamily: 'Segoe UI, sans-serif' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#1A8D50' }}>Manage Homepage Carousel</h2>
      <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
        Recommended image dimensions: <strong>1200 x 400 pixels</strong>
      </p>

      <form onSubmit={handleUpload} style={{
        display: 'grid',
        gap: '1rem',
        background: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        marginBottom: '2rem'
      }}>
        <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} />
        <input type="text" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
        <input type="number" placeholder="Order" value={order} onChange={(e) => setOrder(parseInt(e.target.value))} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
        <label style={{ fontSize: '0.95rem' }}>
          <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} style={{ marginRight: '0.5rem' }} /> Active
        </label>
        <button type="submit" style={{
          background: '#1A8D50',
          color: 'white',
          border: 'none',
          padding: '0.7rem 1.2rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          width: 'fit-content'
        }}>{editingId ? 'Update Image' : 'Upload Image'}</button>
      </form>

      <div className="carousel-preview">
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Current Slides</h3>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1.5rem' }}>
          {images.map((img) => (
            <li key={img.id} style={{
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '1rem',
              background: '#fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}>
              <img src={img.image} alt={img.title} style={{ width: '100%', maxWidth: '100%', borderRadius: '6px', marginBottom: '0.5rem' }} />
              <p style={{ fontWeight: '500' }}><strong>{img.title || 'Untitled'}</strong> — Order: {img.order} — {img.is_active ? 'Active' : 'Inactive'}</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleEdit(img)} style={{
                  background: '#ffc107',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: '#212529'
                }}>Edit</button>
                <button onClick={() => handleDelete(img.id)} style={{
                  background: '#dc3545',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer'
                }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default AdminCarousel;
