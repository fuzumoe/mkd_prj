import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
BarChart, Bar, XAxis, YAxis, Tooltip as BarTooltip,
ResponsiveContainer as BarResponsiveContainer, CartesianGrid,
PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend,
ResponsiveContainer as PieResponsiveContainer
} from 'recharts';
import '../../style.css';

const AdminDashboard = () => {
const navigate = useNavigate();
const [dailyData, setDailyData] = useState([]);
const [productData, setProductData] = useState([]);
const [histories, setHistories] = useState([]);
const [diseaseData, setDiseaseData] = useState([]);
const [totalOrders, setTotalOrders] = useState(0);
const [totalRevenue, setTotalRevenue] = useState('0.00');

// Convert Data URL to Blob for prediction
const dataURLtoBlob = dataurl => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
};

// Fetch orders and raw analysis histories
useEffect(() => {
  const isAdminAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';
  if (!isAdminAuthenticated) {
    navigate('/admin-login');
    return;
  }

  Promise.all([
    fetch('http://localhost:8000/api/admin/orders/').then(res => res.json()),
    fetch('http://localhost:8000/api/admin/analyze/list/').then(res => res.json())
  ])
    .then(([orders, analyses]) => {
      // Orders metrics
      setTotalOrders(orders.length);
      const revenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
      setTotalRevenue(revenue.toFixed(2));

      // Daily Orders
      const counts = {};
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        counts[d.toISOString().split('T')[0]] = 0;
      }
      orders.forEach(o => {
        const key = new Date(o.date).toISOString().split('T')[0];
        if (counts[key] !== undefined) counts[key]++;
      });
      setDailyData(Object.entries(counts).map(([date, count]) => ({ date, count })));

      // Best Selling Products
      const prodCounts = {};
      orders.forEach(o => {
        if (Array.isArray(o.items)) {
          o.items.forEach(item => {
            if (item && item.product_name) {
              prodCounts[item.product_name] = (prodCounts[item.product_name] || 0) + (item.quantity || 1);
            }
          });
        }
      });

      // Sort products by quantity descending for better chart
      const sortedProducts = Object.entries(prodCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setProductData(sortedProducts);


      // Store raw histories for AI prediction
      setHistories(analyses);
    })
    .catch(err => console.error('Error fetching data:', err));
}, [navigate]);

// Aggregate AI predictions for the "Most Reported AI Predictions" chart
useEffect(() => {
  if (histories.length === 0) return;

  Promise.all(
    histories.map(record => {
      const blob = dataURLtoBlob(record.image_data);
      const formData = new FormData();
      formData.append('image', blob, 'image.png');
      return fetch('http://localhost:5000/predict', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => data.prediction || 'Unknown');
    })
  )
    .then(predictions => {
      const counts = {};
      predictions.forEach(pred => {
        counts[pred] = (counts[pred] || 0) + 1;
      });
      setDiseaseData(Object.entries(counts).map(([name, value]) => ({ name, value })));
    })
    .catch(err => console.error('Error fetching AI predictions:', err));
}, [histories]);

const COLORS = ['#3A8349', '#27ae60', '#88C079', '#A8E6CF', '#DCE775', '#FFD54F', '#BA68C8', '#F06292'];

const handleLogout = () => {
  sessionStorage.removeItem('isAdminAuthenticated');
  navigate('/admin-login');
};

// Sidebar links
const navItems = [
  { label: 'Dashboard Home', path: '/admin' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Consultations', path: '/admin/consultations' },
  { label: 'Analyzed Images', path: '/admin/images' },
  { label: 'Manage Products', path: '/admin/products' },
  { label: 'Manage Orders', path: '/admin/orders' },
  { label: 'Product Analytics', path: '/admin/analytics' },
  { label: 'Contact Messages', path: '/admin/messages' },
  {label: 'Carousel', path: '/admin/carousel'},
  {label: 'FAQs', path: '/admin/faqs'},
  {label: 'Blogs', path: '/admin/blogs'},
  {label: 'Ratings', path: '/admin/ratings'},
];

return (
  <div className="admin-dashboard" style={{ display: 'flex', minHeight: '100vh'}}>
    <aside className="admin-sidebar" style={{
      width: '260px', background: 'linear-gradient(180deg,rgb(2, 73, 40),rgb(0, 139, 19))', color: 'white', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'fixed', height: '100vh', overflowY: 'auto', boxShadow: '3px 0 10px rgba(0,0,0,0.1)'
    }}>
      <div>
        <div style={{ background: '#fff', color: '#0D5F3A', height: '100px', width: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', margin: '0 auto 2.5rem', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>Aurora</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding:'1rem 0.5rem', borderRadius:'1rem',justifyContent:'left' }}>
          {navItems.map((item, idx) => (
            <NavLink key={idx} to={item.path} className={({ isActive }) => `admin-nav-link ${isActive ? 'active-admin-link' : ''}`}>{item.label}</NavLink>
          ))}
        </nav>
      </div>
      <button onClick={handleLogout} style={{ marginTop: '2rem', background: '#fff', color: '#0D5F3A', border: 'none', padding: '0.85rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'all 0.2s ease' }}>Logout</button>
    </aside>

    <main className="admin-main" style={{ flex: 1, marginLeft: '260px', padding: '2rem' }}>
      {/* Stats Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1rem', color: '#6b7280' }}>Total Orders:</h3>
          <p style={{ fontSize: '1.75rem', fontWeight: '600' }}>{totalOrders}</p>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1rem', color: '#6b7280' }}>Total Revenue:</h3>
          <p style={{ fontSize: '1.75rem', fontWeight: '600' }}>${totalRevenue}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {/* Daily Orders Chart */}
        <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h4 style={{ marginBottom: '0.75rem', fontSize: '1.125rem', color: '#0D5F3A' }}>Daily Orders (Last 7 Days)</h4>
          <BarResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ecebea" />
              <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 12 }} />
              <YAxis tick={{ fill: '#555', fontSize: 12 }} />
              <BarTooltip contentStyle={{ background: '#fff', borderRadius: '4px', border: '1px solid #eee' }} />
              <Bar dataKey="count" fill="#3A8349" radius={[4,4,0,0]} />
            </BarChart>
          </BarResponsiveContainer>
        </div>
        {/* Best Selling Products Chart */}
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h4 style={{ marginBottom: '0.75rem', fontSize: '1.125rem', color: '#0D5F3A' }}>Best Selling Products</h4>
          <PieResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={productData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {productData.map((_, idx) => (<Cell key={idx} fill={COLORS[idx % COLORS.length]} />))}
              </Pie>
              <PieTooltip />
              <PieLegend verticalAlign="bottom" height={24} />
            </PieChart>
          </PieResponsiveContainer>
        </div>
        {/* Most Reported AI Predictions Chart */}
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h4 style={{ marginBottom: '0.75rem', fontSize: '1.125rem', color: '#0D5F3A' }}>Most Reported AI Predictions</h4>
          {diseaseData.length > 0 ? (
            <PieResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={diseaseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {diseaseData.map((_, idx) => (<Cell key={idx} fill={COLORS[idx % COLORS.length]} />))}
                </Pie>
                <PieTooltip />
                <PieLegend verticalAlign="bottom" height={24} />
              </PieChart>
            </PieResponsiveContainer>
          ) : (
            <p style={{ color: '#888', fontStyle: 'italic' }}>No AI prediction data yet.</p>
          )}
        </div>
      </div>

      <section className="nested-content">
        <Outlet />
      </section>
    </main>
  </div>
);
};

export default AdminDashboard;
