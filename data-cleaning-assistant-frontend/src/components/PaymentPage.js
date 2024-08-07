import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BraintreeDropIn } from 'react-braintree-dropin';

function PaymentPage() {
  const [clientToken, setClientToken] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchClientToken = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/braintree/token`);
        setClientToken(response.data.token);
      } catch (error) {
        setMessage('Error fetching client token: ' + (error.response?.data?.error || error.message));
      }
    };

    fetchClientToken();
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    const { nonce } = window.braintreeInstance.requestPaymentMethod();

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/braintree/checkout`, { paymentMethodNonce: nonce });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error processing payment: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      <h2>Payment</h2>
      {clientToken ? (
        <form onSubmit={handlePayment}>
          <BraintreeDropIn
            options={{ authorization: clientToken }}
            onInstance={(instance) => {
              window.braintreeInstance = instance;
            }}
          />
          <button type="submit">Pay</button>
        </form>
      ) : (
        <p>Loading payment options...</p>
      )}
      <p>{message}</p>
    </div>
  );
}

export default PaymentPage;
