// src/components/EmailVerification.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

function EmailVerification() {
    const { sendEmailVerification } = useContext(AuthContext); // Get sendEmailVerification function from context
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSendVerification = async () => {
        try {
            const msg = await sendEmailVerification(email);
            setMessage(msg);
        } catch (error) {
            setMessage('Error sending verification email: ' + error.message);
        }
    };

    return (
        <div>
            <h2>Email Verification</h2>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <button onClick={handleSendVerification}>Send Verification Email</button>
            <p>{message}</p>
        </div>
    );
}

export default EmailVerification;
