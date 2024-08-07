import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserSettings() {
  const [subscription, setSubscription] = useState('basic');

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user/subscription`);
        setSubscription(response.data.subscription);
      } catch (error) {
        console.error('Error fetching subscription:', error.response?.data?.error || error.message);
      }
    };

    fetchSubscription();
  }, []);

  const handleUpgrade = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/upgrade`);
      setSubscription('premium');
    } catch (error) {
      console.error('Error upgrading subscription:', error.response?.data?.error || error.message);
    }
  };

  return (
    <div>
      <h2>User Settings</h2>
      <p>Current Subscription: {subscription}</p>
      {subscription === 'basic' && (
        <button onClick={handleUpgrade}>Upgrade to Premium</button>
      )}
    </div>
  );
}

export default UserSettings;
