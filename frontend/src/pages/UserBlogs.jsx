import React, { useEffect, useState } from 'react';

const UserBlogs = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/blogs/')
      .then(res => res.json())
      .then(data => setBlogs(data));
  }, []);

  return (
    <div className="user-blogs" style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#0D5F3A', fontSize: '2.2rem', marginBottom: '0.5rem' }}>
        📰 Aurora Articles & Skincare Tips
      </h2>
      <p style={{ color: '#555', marginBottom: '2rem' }}>
        Curated by our wellness experts to help you care for your skin the smart way.
      </p>

      {blogs.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        blogs.map((blog) => (
          <div
            key={blog.id}
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <h3 style={{ color: '#0D5F3A', fontSize: '1.6rem', marginBottom: '0.3rem' }}>
              {blog.title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1rem' }}>
              Posted on {new Date(blog.created_at).toDateString()}
            </p>
            <div style={{ lineHeight: '1.8', fontSize: '1.05rem', color: '#333' }}>
              {blog.body.split('\n').map((para, idx) => (
                <p key={idx} style={{ marginBottom: '1rem' }}>{para}</p>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UserBlogs;
