// src/components/FileUpload.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

function FileUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [fileCount, setFileCount] = useState(0);
  const [subscription, setSubscription] = useState('basic');
  const { user } = useContext(AuthContext); // Access user from context
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect to login if not authenticated
      return;
    }

    const fetchFileCount = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user/files-count`);
        setFileCount(response.data.count);
      } catch (error) {
        setMessage('Error fetching file count: ' + (error.response?.data?.error || error.message));
      }
    };

    const fetchSubscription = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user/subscription`);
        setSubscription(response.data.subscription);
      } catch (error) {
        setMessage('Error fetching subscription: ' + (error.response?.data?.error || error.message));
      }
    };

    fetchFileCount();
    fetchSubscription();
  }, [user, navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (subscription === 'basic' && fileCount >= 5) {
      setMessage('File upload limit reached. Please upgrade.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage(response.data.message);
      if (subscription === 'basic') setFileCount(fileCount + 1);
    } catch (error) {
      setMessage('Error processing file: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <Container>
      <h2 className="my-4">Upload File</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Control type="file" onChange={handleFileChange} required />
        </Form.Group>
        <Button variant="primary" type="submit">Upload</Button>
      </Form>
      {message && <Alert variant="info" className="mt-3">{message}</Alert>}
    </Container>
  );
}

export default FileUpload;
