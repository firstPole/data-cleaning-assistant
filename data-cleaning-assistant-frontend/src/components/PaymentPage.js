// src/components/PaymentPage.js
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import braintree from 'braintree-web-drop-in';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function PaymentPage() {
  const { user, loading, setError } = useContext(AuthContext);
  const [clientToken, setClientToken] = useState(null);
  const dropinRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // Prevent fetching if loading

    if (!user) {
      navigate('/login'); // Redirect to login if user is not authenticated
      return;
    }

    const fetchClientToken = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/get-client-token`);
        const { clientToken } = response.data; // Destructure clientToken from the response
        setClientToken(clientToken);
        setError(null); // Clear any previous error
      } catch (error) {
        setError('Error fetching client token. Please try again later.');
        console.error('Error fetching client token:', error);
      }
    };

    fetchClientToken();
  }, [loading, user, navigate, setError]);

  const handlePayment = useCallback(async (nonce) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/checkout`, { paymentMethodNonce: nonce });
      alert('Payment successful!');
      setError(null); // Clear any previous error
    } catch (error) {
      setError('Payment failed. Please try again later.');
      console.error('Payment error:', error);
      alert('Payment failed!');
    }
  }, [setError]); // Include setError as a dependency

  useEffect(() => {
    if (clientToken && dropinRef.current) {
      braintree.create({
        authorization: clientToken,
        container: dropinRef.current,
      }, (err, instance) => {
        if (err) {
          setError('Error initializing Braintree. Please try again later.');
          console.error('Braintree Error:', err);
          return;
        }
        document.getElementById('submit-button').addEventListener('click', () => {
          instance.requestPaymentMethod((err, payload) => {
            if (err) {
              setError('Error requesting payment method. Please try again later.');
              console.error('Error requesting payment method:', err);
              return;
            }
            handlePayment(payload.nonce);
          });
        });
      });
    }
  }, [clientToken, dropinRef, setError, handlePayment]); // Add handlePayment to dependency array

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Payment Page</h2>
      <div ref={dropinRef} />
      <button id="submit-button">Submit Payment</button>
    </div>
  );
}

export default PaymentPage;
