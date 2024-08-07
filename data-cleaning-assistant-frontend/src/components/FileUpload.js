import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [fileCount, setFileCount] = useState(0); // Track number of uploaded files
  const [subscription, setSubscription] = useState('basic'); // Track subscription plan

  useEffect(() => {
    const fetchFileCount = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user/files-count`);
        setFileCount(response.data.count);
      } catch (error) {
        console.error('Error fetching file count:', error.response?.data?.error || error.message);
      }
    };

    fetchFileCount();
  }, [subscription]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (subscription === 'basic' && fileCount >= 5) {
        setMessage('File upload limit reached. Please upgrade to upload more files.');
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
        if (error.response?.status === 429) {
            setMessage('Rate limit exceeded. Please try again later.');
        } else {
            setMessage('Error processing file: ' + (error.response?.data?.error || error.message));
        }
    }
};

  return (
    <div>
      <h2>Upload CSV</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} required />
        <button type="submit">Upload</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default FileUpload;
