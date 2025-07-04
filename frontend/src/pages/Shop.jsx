import React, { useEffect, useState, useMemo } from 'react';
import '../style.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useContext } from 'react';
import { CartContext } from '../CartContext';


const Shop = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortOption, setSortOption] = useState('Featured');
  const { updateCartCount } = useContext(CartContext);

  useEffect(() => {
    fetch("http://localhost:8000/api/products/")
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error("Error fetching products:", error));
  }, []);

  const categories = useMemo(() => [
    'All Categories',
    ...Array.from(new Set(products.map((p) => p.category || 'Uncategorized')))
  ], [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (selectedCategory !== 'All Categories') {
      result = result.filter((p) => (p.category || 'Uncategorized') === selectedCategory);
    }
    if (sortOption === 'Price: Low to High') {
      result = result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'Price: High to Low') {
      result = result.sort((a, b) => b.price - a.price);
    }
    return result;
  }, [products, searchTerm, selectedCategory, sortOption]);

  const isAuthenticated = () => sessionStorage.getItem('isAuthenticated') === 'true';
  const getCurrentUser = () => sessionStorage.getItem('currentUserEmail');

  const addToCart = (product) => {
    if (!isAuthenticated()) {
      toast.warn('Please login to add items to cart.', {
        position: "top-center",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }    
    const user = getCurrentUser();
    const payload = {
      user_email: user,
      product: product.id,
      quantity: 1
    };

    fetch("http://localhost:8000/api/cart/add/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.error || "Failed to add item to cart");
          });
        }
        return response.json();
      })
      .then(data => {
        console.log("Added to cart:", data);
        toast.success(`✅ ${product.name} added to cart!`, {
          position: "top-center",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        const existingCart = JSON.parse(sessionStorage.getItem(`cart_${user}`)) || [];
        const existingItem = existingCart.find(item => item.product === product.id);

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          existingCart.push({ product: product.id, quantity: 1 });
        }
        sessionStorage.setItem(`cart_${user}`, JSON.stringify(existingCart));
        updateCartCount();  // update context
      })
      
      .catch(error => {
        console.error("Error adding to cart:", error);
        toast.error(`❗ ${error.message}`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
      
  };

  return (
    <div className="shop-container">
      <h2 className="shop-title">Shop Our Products</h2>
      <p className="shop-subtitle">Discover skincare solutions tailored to your unique needs</p>

      <div className="shop-controls" style={{ display: 'flex', gap: '1rem', margin: '2rem 0', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}
        >
          <option value="Featured">Featured</option>
          <option value="Price: Low to High">Price: Low to High</option>
          <option value="Price: High to Low">Price: High to Low</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="no-products">No products found.</p>
      ) : (
        <div className="shop-grid">
          {filteredProducts.map((product) => (
            <div className="shop-card" key={product.id} style={{ position: 'relative' }}>
              <img
                src={product.image}
                alt={product.name}
                className="shop-image"
                style={{ borderRadius: '8px' }}
              />
              <div className="shop-info" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 className="shop-name" style={{ margin: 0, fontSize: '1.125rem', color: '#111827' }}>
                    {product.name}
                  </h3>
                  <span className="shop-price" style={{ fontWeight: '600', color: '#111827' }}>
                    ${product.price}
                  </span>
                </div>

                {product.category && (
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                    {product.category}
                  </div>
                )}

                <p className="shop-desc" style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {product.description || 'No description provided.'}
                </p>

                <button
                  onClick={() => addToCart(product)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#3A8349',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default Shop;
