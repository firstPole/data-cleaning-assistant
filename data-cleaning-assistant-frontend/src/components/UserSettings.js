// UserSettings.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Update the path as needed

function UserSettings() {
  const { user, loading } = useContext(AuthContext);
  const [userData, setUserData] = useState({});
  const [subscription, setSubscription] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // Prevent fetching if loading

    if (!user) {
      navigate('/login'); // Redirect to login if user is not authenticated
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user`);
        setUserData(response.data.user);
        setSubscription(response.data.subscription);
      } catch (error) {
        setMessage('Error fetching user data: ' + (error.response?.data?.error || error.message));
      }
    };

    fetchUserData();
  }, [loading, user, navigate]);

  const handleSubscriptionChange = async (newSubscription) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/upgrade`, { subscription: newSubscription });
      setSubscription(newSubscription);
      setMessage('Subscription updated successfully.');
    } catch (error) {
      setMessage('Error updating subscription: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Container>
      <h2 className="my-4">User Settings</h2>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Username:</Form.Label>
          <Form.Control type="text" value={userData.username || ''} readOnly />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email:</Form.Label>
          <Form.Control type="email" value={userData.email || ''} readOnly />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Subscription:</Form.Label>
          <Form.Control type="text" value={subscription || ''} readOnly />
        </Form.Group>
        <Button variant="primary" onClick={() => handleSubscriptionChange('premium')}>Upgrade to Premium</Button>
      </Form>
      {message && <Alert variant="info" className="mt-3">{message}</Alert>}
    </Container>
  );
}

export default UserSettings;
