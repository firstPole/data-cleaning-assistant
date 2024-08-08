// src/components/PhoneVerification.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

function PhoneVerification() {
    const { sendPhoneVerification } = useContext(AuthContext); // Get sendPhoneVerification function from context
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');

    const handleSendVerification = async () => {
        try {
            const msg = await sendPhoneVerification(phoneNumber);
            setMessage(msg);
        } catch (error) {
            setMessage('Error sending verification SMS: ' + error.message);
        }
    };

    return (
        <div>
            <h2>Phone Verification</h2>
            <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
            />
            <button onClick={handleSendVerification}>Send Verification SMS</button>
            <p>{message}</p>
        </div>
    );
}

export default PhoneVerification;
