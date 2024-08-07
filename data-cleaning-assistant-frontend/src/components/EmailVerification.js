import React, { useState } from 'react';
import axios from 'axios';

function EmailVerification() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSendVerification = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/send-verification-email`, { email });
            setMessage('Verification email sent. Please check your inbox.');
        } catch (error) {
            setMessage('Error sending verification email: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div>
            <h2>Email Verification</h2>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button onClick={handleSendVerification}>Send Verification Email</button>
            <p>{message}</p>
        </div>
    );
}

export default EmailVerification;
