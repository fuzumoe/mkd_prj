import React, { useEffect, useState } from 'react';

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Custom CSS styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 24px',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: '#333',
    },
    header: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '32px',
      display: 'flex',
      alignItems: 'center',
      color: '#1a202c',
    },
    emoji: {
      marginRight: '12px',
      fontSize: '24px',
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
      gap: '32px',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      padding: '24px',
      transition: 'transform 0.2s ease',
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '16px',
      color: '#2d3748',
      display: 'flex',
      alignItems: 'center',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#4a5568',
    },
    input: {
      width: '100%',
      padding: '10px 14px',
      fontSize: '15px',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      transition: 'border 0.2s ease, box-shadow 0.2s ease',
      outline: 'none',
    },
    focusInput: {
      border: '1px solid #3182ce',
      boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.2)',
    },
    textarea: {
      width: '100%',
      padding: '10px 14px',
      fontSize: '15px',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      minHeight: '150px',
      resize: 'vertical',
      transition: 'border 0.2s ease, box-shadow 0.2s ease',
      outline: 'none',
    },
    button: {
      backgroundColor: '#3182ce',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '10px 16px',
      fontSize: '15px',
      fontWeight: '500',
      cursor: 'pointer',
      width: '100%',
      transition: 'background-color 0.2s ease, transform 0.1s ease',
    },
    buttonHover: {
      backgroundColor: '#2b6cb0',
    },
    buttonActive: {
      transform: 'scale(0.98)',
    },
    buttonDisabled: {
      backgroundColor: '#90cdf4',
      cursor: 'not-allowed',
    },
    notification: {
      padding: '12px 16px',
      borderRadius: '6px',
      marginBottom: '24px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
    },
    successNotification: {
      backgroundColor: '#48bb78',
      color: 'white',
    },
    errorNotification: {
      backgroundColor: '#f56565',
      color: 'white',
    },
    blogList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    blogItem: {
      padding: '16px 0',
      borderBottom: '1px solid #edf2f7',
    },
    blogTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '4px',
    },
    blogExcerpt: {
      color: '#718096',
      fontSize: '14px',
      lineHeight: '1.5',
    },
    deleteButton: {
      backgroundColor: 'transparent',
      color: '#e53e3e',
      border: '1px solid #e53e3e',
      borderRadius: '4px',
      padding: '6px 12px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      marginLeft: '12px',
      transition: 'background-color 0.2s ease, color 0.2s ease',
    },
    deleteButtonHover: {
      backgroundColor: '#e53e3e',
      color: 'white',
    },
    emptyState: {
      textAlign: 'center',
      padding: '32px 0',
      color: '#718096',
    },
    emptyStateText: {
      fontSize: '18px',
      marginBottom: '8px',
    },
    emptyStateSubtext: {
      fontSize: '14px',
    },
    blogItemHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    blogContent: {
      flex: '1',
    }
  };

  const fetchBlogs = () => {
    fetch('http://localhost:8000/api/admin/blogs/')
      .then(res => res.json())
      .then(data => setBlogs(data))
      .catch(error => {
        console.error('Error fetching blogs:', error);
        showNotification('Failed to load blogs', 'error');
      });
  };

  useEffect(() => {
    fetchBlogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    fetch('http://localhost:8000/api/admin/blogs/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, excerpt, body })
    })
      .then(res => res.json())
      .then(() => {
        setTitle('');
        setExcerpt('');
        setBody('');
        fetchBlogs();
        showNotification('Blog post created successfully!');
      })
      .catch(error => {
        console.error('Error creating blog:', error);
        showNotification('Failed to create blog post', 'error');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      fetch(`http://localhost:8000/api/admin/blogs/delete/${id}/`, {
        method: 'DELETE'
      })
        .then(() => {
          fetchBlogs();
          showNotification('Blog post deleted successfully!');
        })
        .catch(error => {
          console.error('Error deleting blog:', error);
          showNotification('Failed to delete blog post', 'error');
        });
    }
  };

  return (
    <div style={styles.container}>
      {notification && (
        <div style={{
          ...styles.notification,
          ...(notification.type === 'error' ? styles.errorNotification : styles.successNotification)
        }}>
          {notification.message}
        </div>
      )}
      
      <h1 style={styles.header}>
        <span style={styles.emoji}>📝</span>
        <span>Manage Blog Posts</span>
      </h1>

      <div style={styles.gridContainer}>
        {/* Form Section */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Create New Blog Post</h2>
          
          <div>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="title">
                Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter blog title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                style={styles.input}
                onFocus={e => e.target.style.cssText = `
                  width: 100%;
                  padding: 10px 14px;
                  font-size: 15px;
                  border-radius: 6px;
                  border: 1px solid #3182ce;
                  transition: border 0.2s ease, box-shadow 0.2s ease;
                  outline: none;
                  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
                `}
                onBlur={e => e.target.style.cssText = `
                  width: 100%;
                  padding: 10px 14px;
                  font-size: 15px;
                  border-radius: 6px;
                  border: 1px solid #e2e8f0;
                  transition: border 0.2s ease, box-shadow 0.2s ease;
                  outline: none;
                `}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="excerpt">
                Excerpt
              </label>
              <input
                id="excerpt"
                type="text"
                placeholder="Short description"
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                style={styles.input}
                onFocus={e => e.target.style.cssText = `
                  width: 100%;
                  padding: 10px 14px;
                  font-size: 15px;
                  border-radius: 6px;
                  border: 1px solid #3182ce;
                  transition: border 0.2s ease, box-shadow 0.2s ease;
                  outline: none;
                  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
                `}
                onBlur={e => e.target.style.cssText = `
                  width: 100%;
                  padding: 10px 14px;
                  font-size: 15px;
                  border-radius: 6px;
                  border: 1px solid #e2e8f0;
                  transition: border 0.2s ease, box-shadow 0.2s ease;
                  outline: none;
                `}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="body">
                Content
              </label>
              <textarea
                id="body"
                rows="6"
                placeholder="Write your blog content here..."
                value={body}
                onChange={e => setBody(e.target.value)}
                required
                style={styles.textarea}
                onFocus={e => e.target.style.cssText = `
                  width: 100%;
                  padding: 10px 14px;
                  font-size: 15px;
                  border-radius: 6px;
                  border: 1px solid #3182ce;
                  min-height: 150px;
                  resize: vertical;
                  transition: border 0.2s ease, box-shadow 0.2s ease;
                  outline: none;
                  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
                `}
                onBlur={e => e.target.style.cssText = `
                  width: 100%;
                  padding: 10px 14px;
                  font-size: 15px;
                  border-radius: 6px;
                  border: 1px solid #e2e8f0;
                  min-height: 150px;
                  resize: vertical;
                  transition: border 0.2s ease, box-shadow 0.2s ease;
                  outline: none;
                `}
              ></textarea>
            </div>
            
            <button 
              onClick={handleCreate}
              disabled={isSubmitting}
              style={{
                ...styles.button,
                ...(isSubmitting ? styles.buttonDisabled : {})
              }}
              onMouseOver={e => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = '#2b6cb0';
                }
              }}
              onMouseOut={e => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = '#3182ce';
                }
              }}
              onMouseDown={e => {
                if (!isSubmitting) {
                  e.target.style.transform = 'scale(0.98)';
                }
              }}
              onMouseUp={e => {
                if (!isSubmitting) {
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Blog Post'}
            </button>
          </div>
        </div>

        {/* Blog List Section */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span style={styles.emoji}>📚</span>
            <span>Existing Blogs</span>
          </h2>
          
          {blogs.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyStateText}>No blogs available.</p>
              <p style={styles.emptyStateSubtext}>Create your first blog post to get started!</p>
            </div>
          ) : (
            <ul style={styles.blogList}>
              {blogs.map(blog => (
                <li key={blog.id} style={styles.blogItem}>
                  <div style={styles.blogItemHeader}>
                    <div style={styles.blogContent}>
                      <h3 style={styles.blogTitle}>{blog.title}</h3>
                      <p style={styles.blogExcerpt}>
                        {blog.excerpt || blog.body.slice(0, 100)}
                        {(blog.excerpt?.length > 100 || (!blog.excerpt && blog.body.length > 100)) && '...'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDelete(blog.id, blog.title)}
                      style={styles.deleteButton}
                      onMouseOver={e => {
                        e.target.style.backgroundColor = '#e53e3e';
                        e.target.style.color = 'white';
                      }}
                      onMouseOut={e => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#e53e3e';
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBlogs;