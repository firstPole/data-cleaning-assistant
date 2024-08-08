// FeedbackForm.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Update the path as needed

function FeedbackForm() {
  const { user, loading } = useContext(AuthContext);
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (loading) return; // Prevent redirect if loading

    if (!user) {
      navigate('/login'); // Redirect to login if user is not authenticated
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/feedback`, { feedback });
      setMessage('Feedback submitted successfully!');
    } catch (error) {
      setMessage('Error submitting feedback: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Feedback and Support</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Enter your feedback or support request"
          required
        />
        <button type="submit">Submit</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default FeedbackForm;
