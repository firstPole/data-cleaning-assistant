import React, { useState } from 'react';
import { Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function SubscriptionUpgrade() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const handleUpgrade = async () => {
    if (loading) return; // Avoid actions if loading

    if (!user) {
      navigate('/login'); // Redirect if not authenticated
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/upgrade`);
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error upgrading subscription: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      <h2>Upgrade to Premium</h2>
      <Button onClick={handleUpgrade}>Upgrade</Button>
      {message && <Alert variant="info" className="mt-3">{message}</Alert>}
    </div>
  );
}

export default SubscriptionUpgrade;
