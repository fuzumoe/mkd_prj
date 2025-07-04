import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminFAQ = () => {
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');

  const fetchFAQs = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/admin/faqs/');
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load FAQs');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/admin/faqs/', {
        question: questionText,
        answer: answerText,
      });
      toast.success('FAQ added');
      setQuestionText('');
      setAnswerText('');
      fetchFAQs();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add FAQ');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/faqs/${id}/`);
      toast.success('FAQ deleted');
      fetchFAQs();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete FAQ');
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#1A8D50' }}>Manage FAQs</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        <textarea
          placeholder="Enter question"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
          style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <textarea
          placeholder="Enter answer"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          required
          style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{ background: '#1A8D50', color: 'white', padding: '0.7rem', border: 'none', borderRadius: '6px' }}
        >
          Add FAQ
        </button>
      </form>

      <div>
        <h3 style={{ marginBottom: '1rem' }}>Current FAQs</h3>
        {questions.map((q) => (
          <div key={q.id} style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
            <p><strong>Q:</strong> {q.question}</p>
            <p><strong>A:</strong> {q.answer}</p>
            <button
              onClick={() => handleDelete(q.id)}
              style={{ background: '#228132', color: 'white', padding: '0.5rem', border: 'none', borderRadius: '4px' }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default AdminFAQ;
