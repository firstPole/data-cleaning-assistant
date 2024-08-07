import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FileDownload() {
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/reports`);
        setReports(response.data.reports);
      } catch (error) {
        setMessage('Error fetching reports: ' + (error.response?.data?.error || error.message));
      }
    };

    fetchReports();
  }, []);

  const handleDownload = async (fileId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/download/${fileId}`, {
        responseType: 'blob', // Important to handle file downloads
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileId); // Use fileId or a proper filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setMessage('Error downloading file: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      <h2>Download Reports</h2>
      {reports.length > 0 ? (
        <ul>
          {reports.map((report) => (
            <li key={report.id}>
              {report.name}
              <button onClick={() => handleDownload(report.id)}>Download</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No reports available.</p>
      )}
      <p>{message}</p>
    </div>
  );
}

export default FileDownload;
