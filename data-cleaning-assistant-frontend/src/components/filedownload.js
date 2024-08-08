// src/components/FileDownload.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Button, ListGroup, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

function FileDownload() {
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState('');
  const { user } = useContext(AuthContext); // Access user from context
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect to login if not authenticated
      return;
    }

    const fetchReports = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/reports`);
        setReports(response.data.reports);
      } catch (error) {
        setMessage('Error fetching reports: ' + (error.response?.data?.error || error.message));
      }
    };

    fetchReports();
  }, [user, navigate]);

  const handleDownload = async (fileId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/download/${fileId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileId);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setMessage('Error downloading file: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <Container>
      <h2 className="my-4">Download Reports</h2>
      {reports.length > 0 ? (
        <ListGroup>
          {reports.map((report) => (
            <ListGroup.Item key={report.id}>
              {report.name}
              <Button variant="link" onClick={() => handleDownload(report.id)}>Download</Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p>No reports available.</p>
      )}
      {message && <Alert variant="info" className="mt-3">{message}</Alert>}
    </Container>
  );
}

export default FileDownload;
