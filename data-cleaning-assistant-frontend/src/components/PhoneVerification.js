import React, { useState } from 'react';
import axios from 'axios';

function PhoneVerification() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');

    const handleSendVerification = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/send-sms-verification`, { phone_number: phoneNumber });
            setMessage('Verification SMS sent. Please check your phone.');
        } catch (error) {
            setMessage('Error sending verification SMS: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div>
            <h2>Phone Verification</h2>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
            <button onClick={handleSendVerification}>Send Verification SMS</button>
            <p>{message}</p>
        </div>
    );
}

export default PhoneVerification;
