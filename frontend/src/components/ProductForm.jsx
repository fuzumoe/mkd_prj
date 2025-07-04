import { useState, useEffect } from 'react';
import '../style.css'; 

const ProductForm = ({ onSubmit, product, isEditing }) => {
  const [formData, setFormData] = useState({ name: '', price: '', image: '', description: '' });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData(product);
      setImagePreview(product.image);
    } else {
      setFormData({ name: '', price: '', image: '', description: '' });
      setImagePreview(null);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.image) return;
    onSubmit(formData);
    setFormData({ name: '', price: '', image: '', description: '' });
    setImagePreview(null);
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>

      <div className="form-group">
        <label>Product Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Price</label>
        <input type="number" name="price" value={formData.price} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea name="description" rows="3" value={formData.description} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Upload Product Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="image-preview" />
        )}
      </div>

      <button type="submit" className="form-button">
        {isEditing ? 'Update Product' : 'Add Product'}
      </button>
    </form>
  );
};

export default ProductForm;
