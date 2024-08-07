import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ReportViewer() {
  const [reports, setReports] = useState([]);
  const [subscription, setSubscription] = useState('basic'); // Track subscription plan

  useEffect(() => {
    const fetchReports = async () => {
      if (subscription === 'premium' || (subscription === 'basic' && reports.length < 5)) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/reports`);
          setReports(response.data.reports);
        } catch (error) {
          console.error('Error fetching reports:', error.response?.data?.error || error.message);
        }
      }
    };

    fetchReports();
  }, [subscription]);

  return (
    <div>
      <h2>Past Reports</h2>
      {subscription === 'premium' || reports.length > 0 ? (
        reports.length > 0 ? (
          <ul>
            {reports.map((report) => (
              <li key={report.id}>{JSON.stringify(report)}</li>
            ))}
          </ul>
        ) : (
          <p>No reports found.</p>
        )
      ) : (
        <p>Upload files to view reports.</p>
      )}
    </div>
  );
}

export default ReportViewer;
