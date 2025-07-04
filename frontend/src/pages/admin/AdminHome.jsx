import React, { useEffect, useState } from 'react';
import '../../style.css';

const AdminHome = () => {
  const [stats, setStats] = useState({ users: 0, consultations: 0, images: 0 });
  const [recentConsults, setRecentConsults] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/api/admin/users/").then(res => res.json()),
      fetch("http://localhost:8000/api/admin/consultations/").then(res => res.json()),
      fetch("http://localhost:8000/api/admin/analyze/list/").then(res => res.json()),
    ])
      .then(([usersData, consultsData, analysesData]) => {
        setStats({
          users: usersData.length,
          consultations: consultsData.length,
          images: analysesData.length,
        });
        setRecentUsers(usersData.slice(-5).reverse());
        setRecentConsults(consultsData.slice(-5).reverse());
      })
      .catch(err => console.error("Error fetching admin home data:", err));
  }, []);

  return (
    <div className="admin-home-container">
      <h2 className="admin-page-title">Welcome to the Admin Dashboard</h2>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon users-icon" />
          <div className="stat-info">
            <h3>{stats.users}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon consult-icon" />
          <div className="stat-info">
            <h3>{stats.consultations}</h3>
            <p>Total Consultations</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon image-icon" />
          <div className="stat-info">
            <h3>{stats.images}</h3>
            <p>Images Analyzed</p>
          </div>
        </div>
      </div>

      <div className="recent-sections">
        <div className="recent-card">
          <h4>Recent Consultations</h4>
          {recentConsults.length === 0 ? (
            <p className="empty-text">No recent consultations.</p>
          ) : (
            <ul className="recent-list">
              {recentConsults.map((c, i) => (
                <li key={i} className="recent-item">
                  <span className="item-name">{c.name}</span>
                  <span className="item-date">{new Date(c.preferred_date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="recent-card">
          <h4>New Users</h4>
          {recentUsers.length === 0 ? (
            <p className="empty-text">No recent users.</p>
          ) : (
            <ul className="recent-list">
              {recentUsers.map((u, i) => (
                <li key={i} className="recent-item">
                  <span className="item-name">{u.name}</span>
                  <span className="item-date">{u.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
