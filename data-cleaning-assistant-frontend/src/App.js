import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './components/style/Login.module.css'; // Import component-specific CSS after
import NavBar from './components/NavBar';
import Login from './components/Login';
import Signup from './components/SignUp';
import FileUpload from './components/FileUpload';
import FileDownload from './components/filedownload';
import PhoneVerification from './components/PhoneVerification';
import EmailVerification from './components/EmailVerification';
import ReportViewer from './components/ReportViewer';
import SubscriptionUpgrade from './components/SubscriptionUpgrade';
import Dashboard from './components/Dashboard';

import UserSettings from './components/UserSettings';
import PaymentPage from './components/PaymentPage';
import { AuthProvider, AuthContext } from './context/AuthContext'; // Import AuthContext and AuthProvider
import FeedbackForm from './components/FeedbackForm';

function ProtectedRoute({ element, ...rest }) {
  const { user } = React.useContext(AuthContext);
  return user ? element : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/fileupload" element={<ProtectedRoute element={<FileUpload />} />} />
          <Route path="/filedownload" element={<ProtectedRoute element={<FileDownload />} />} />
          <Route path="/phoneverification" element={<ProtectedRoute element={<PhoneVerification />} />} />
          <Route path="/emailverification" element={<ProtectedRoute element={<EmailVerification />} />} />
          <Route path="/reportviewer" element={<ProtectedRoute element={<ReportViewer />} />} />
          <Route path="/subscriptionupgrade" element={<ProtectedRoute element={<SubscriptionUpgrade />} />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/feedback" element={<ProtectedRoute element={<FeedbackForm />} />} />
          <Route path="/usersettings" element={<ProtectedRoute element={<UserSettings />} />} />
          <Route path="/paymentpage" element={<ProtectedRoute element={<PaymentPage />} />} />
          <Route path="/" element={<Navigate to="/dashboard" />} /> {/* Default route */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
