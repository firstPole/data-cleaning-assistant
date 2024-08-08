import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, ListGroup, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function ReportViewer() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (loading) return; // Avoid fetching if loading

    if (!user) {
      navigate('/login'); // Redirect if not authenticated
    } else {
      const fetchReports = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/reports`);
          setReports(response.data.reports);
        } catch (error) {
          setMessage('Error fetching reports: ' + (error.response?.data?.error || error.message));
        }
      };

      fetchReports();
    }
  }, [loading, user, navigate]);

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

export default ReportViewer;
