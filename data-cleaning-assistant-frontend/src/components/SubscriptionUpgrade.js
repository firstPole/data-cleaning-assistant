import React, { useState } from 'react';
import axios from 'axios';

function SubscriptionUpgrade() {
  const [message, setMessage] = useState('');

  const handleUpgrade = async () => {
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
      <button onClick={handleUpgrade}>Upgrade</button>
      <p>{message}</p>
    </div>
  );
}

export default SubscriptionUpgrade;
