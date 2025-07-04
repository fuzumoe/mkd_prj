import React, { useEffect, useState } from 'react';
import '../../style.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const initialData = { name: '', category: '', price: '', description: '', image: '', imageFile: null, suitable_for: '', targets: '' };
  const [formData, setFormData] = useState(initialData);

  // Fetch products from Django backend
  useEffect(() => {
    fetch('http://localhost:8000/api/admin/products/')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  const openAddModal = () => {
    setFormData(initialData);
    setEditingIndex(null);
    setShowModal(true);
  };

  const openEditModal = index => {
    const prod = products[index];
    setEditingIndex(index);
    setFormData({
      id: prod.id,
      name: prod.name || '',
      category: prod.category || '',
      price: prod.price || '',
      description: prod.description || '',
      image: prod.image || '',
      imageFile: null,
      suitable_for: prod.suitable_for ? prod.suitable_for.join(', ') : '',
      targets: prod.targets ? prod.targets.join(', ') : '',
    });    
    setShowModal(true);
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFormData(fd => ({ ...fd, image: reader.result, imageFile: file }));
    reader.readAsDataURL(file);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      category: formData.category,
      price: formData.price,
      description: formData.description,
      image: formData.image,
      suitable_for: formData.suitable_for.split(',').map(s => s.trim()),
      targets: formData.targets.split(',').map(s => s.trim()),
    };    
    if (editingIndex !== null) {
      // Update product
      fetch(`http://localhost:8000/api/admin/products/${formData.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to update product');
          return res.json();
        })
        .then(data => {
          setProducts(prev => prev.map((p, i) => i === editingIndex ? data : p));
          setShowModal(false);
          setEditingIndex(null);
        })
        .catch(() => toast.error('❌ Failed to update product'));

    } else {
      // Add product
      fetch('http://localhost:8000/api/admin/products/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to add product');
          return res.json();
        })
        .then(data => {
          setProducts(prev => [...prev, data]);
          setShowModal(false);
          toast.success('✅ Product added successfully');
        })
        .catch(() => toast.error('❌ Failed to add product'));
        
    }
  };

  const handleDelete = index => {
    const prod = products[index];
    if (!window.confirm('Delete this product?')) return;
    fetch(`http://localhost:8000/api/admin/products/${prod.id}/`, { method: 'DELETE' })
    .then(() => {
      setProducts(prev => prev.filter((_, i) => i !== index));
      toast.success('🗑️ Product deleted');
    })
    .catch(() => toast.error('❌ Failed to delete product'));
  };

  return (
    <div className="admin-product-container">
      <h2 className="admin-title">Manage Products</h2>
      <button className="btn btn-primary add-btn" onClick={openAddModal}>+ Add Product</button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingIndex !== null ? 'Edit Product' : 'Add Product'}</h3>
            <form className="product-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <input name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
                <input name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleChange} required />
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <input
                  name="suitable_for"
                  placeholder="Suitable For (comma separated, e.g., dry skin, oily skin)"
                  value={formData.suitable_for}
                  onChange={handleChange}
                />
                <input
                  name="targets"
                  placeholder="Targets (comma separated, e.g., acne, wrinkles)"
                  value={formData.targets}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <input name="imageFile" type="file" accept="image/*" onChange={handleFileChange} required={!formData.image} />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-success">{editingIndex !== null ? 'Update' : 'Save'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingIndex(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-product-grid">
        {products.map((prod, idx) => (
          <div key={prod.id} className="admin-product-card">
            <img src={prod.image} alt={prod.name} className="admin-product-image" />
            <div className="admin-product-info">
              <h3>{prod.name}</h3>
              <p className="category">{prod.category}</p>
              <p className="price">${prod.price}</p>
              <p className="description">{prod.description}</p>
              {prod.suitable_for && prod.suitable_for.length > 0 && (
                <p className="suitable-for"><strong>Suitable For:</strong> {prod.suitable_for.join(', ')}</p>
              )}
              {prod.targets && prod.targets.length > 0 && (
                <p className="targets"><strong>Targets:</strong> {prod.targets.join(', ')}</p>
              )}
              <div className="admin-product-actions">
                <button onClick={() => openEditModal(idx)} className="btn btn-outline edit-btn">Edit</button>
                <button onClick={() => handleDelete(idx)} className="btn btn-danger delete-btn">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ToastContainer position="top-center" autoClose={2500} />
    </div>
  );
};

export default AdminProducts;
