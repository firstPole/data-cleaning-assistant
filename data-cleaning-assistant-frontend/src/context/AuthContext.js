// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle loading state
  const [error, setError] = useState(null); // To handle errors

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/auth`);
        if (response.data && response.data.user) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch auth data', error);
        setError('Failed to fetch authentication data.');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/login`, { email, password });
      setUser(response.data.user); // Set user data on successful login
      setError(null); // Clear any previous error
      return response.data.message; // Return message to handle in the component
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/logout`); // Endpoint to handle logout
      setUser(null); // Clear user data from context
      setError(null); // Clear any previous error
    } catch (error) {
      setError('Logout failed.');
      console.error('Logout failed:', error);
    }
  };

  const register = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/signup`, { email, password });
      setError(null); // Clear any previous error
      return response.data.message; // Return message to handle in the component
    } catch (error) {
      setError(error.response?.data?.error || 'Sign-up failed');
      throw new Error(error.response?.data?.error || 'Sign-up failed');
    }
  };

  const sendEmailVerification = async (email) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/send-verification-email`, { email });
      setError(null); // Clear any previous error
      return 'Verification email sent. Please check your inbox.';
    } catch (error) {
      setError(error.response?.data?.error || 'Error sending verification email');
      throw new Error(error.response?.data?.error || 'Error sending verification email');
    }
  };

  const sendPhoneVerification = async (phoneNumber) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/send-sms-verification`, { phone_number: phoneNumber });
      setError(null); // Clear any previous error
      return 'Verification SMS sent. Please check your phone.';
    } catch (error) {
      setError(error.response?.data?.error || 'Error sending verification SMS');
      throw new Error(error.response?.data?.error || 'Error sending verification SMS');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register, sendEmailVerification, sendPhoneVerification }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
