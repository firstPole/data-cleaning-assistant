import React, { useState } from 'react';
import axios from 'axios';

function FeedbackForm() {
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/feedback`, { feedback });
      setMessage('Feedback submitted successfully!');
    } catch (error) {
      setMessage('Error submitting feedback: ' + (error.response?.data?.error || error.message));
    }
  };

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
