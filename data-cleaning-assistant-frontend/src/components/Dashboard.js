// src/components/Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button, ListGroup, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';  // Import AuthContext

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext); // Access user and logout from AuthContext
  const [files, setFiles] = useState([]);
  const [cleanFiles, setCleanFiles] = useState([]);
  const [fileUploadError, setFileUploadError] = useState(null);
  const [fileUploadSuccess, setFileUploadSuccess] = useState(null);
  const [subscription, setSubscription] = useState(user?.subscription || 'basic');

  useEffect(() => {
    if (user) { // Ensure user is available before fetching files
      fetchFiles();
      fetchCleanFiles();
    }
  }, [user]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('/api/reports');
      setFiles(response.data.reports);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchCleanFiles = async () => {
    try {
      const response = await axios.get('/api/cleanfiles');
      setCleanFiles(response.data.cleanFiles);
    } catch (error) {
      console.error('Error fetching clean files:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const formData = new FormData();
    Array.from(event.target.files).forEach(file => {
      formData.append('file', file);
    });

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFileUploadSuccess(response.data.message);
      fetchFiles();  // Refresh files list
    } catch (error) {
      setFileUploadError(error.response?.data?.error || 'Upload failed');
    }
  };

  const handleUpgradeSubscription = async () => {
    try {
      const response = await axios.post('/api/upgrade');
      setSubscription('premium');
      alert(response.data.message);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container mt-4">
      <h1>Welcome, {user?.email}</h1>
      <Button variant="primary" onClick={handleLogout}>Logout</Button>
      <div className="mt-4">
        <h2>Upload Files</h2>
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          disabled={subscription === 'basic' && files.length >= 5}
        />
        {fileUploadError && <Alert variant="danger">{fileUploadError}</Alert>}
        {fileUploadSuccess && <Alert variant="success">{fileUploadSuccess}</Alert>}
      </div>
      <div className="mt-4">
        <h2>Uploaded Files</h2>
        <ListGroup>
          {files.map(file => (
            <ListGroup.Item key={file.id}>
              {file.name} - {file.status}
              {file.status === 'processed' && (
                <a href={`/api/download/${file.id}`} download>Download</a>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
      {subscription === 'basic' && (
        <div className="mt-4">
          <Button variant="success" onClick={handleUpgradeSubscription}>Upgrade to Premium</Button>
        </div>
      )}
      <div className="mt-4">
        <h2>Clean Files</h2>
        <ListGroup>
          {cleanFiles.map(file => (
            <ListGroup.Item key={file.id}>
              {file.name} - {file.status}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
      <div className="mt-4">
        <Link to="/feedback">Give Feedback</Link>
      </div>
    </div>
  );
};

export default Dashboard;
