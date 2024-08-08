// src/components/NavBar.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './style/NavBar.module.css'; // Import custom CSS file for additional styling

function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <ul className="navbar-nav">
        <li className="nav-item"><Link to="/">Home</Link></li>
        {!user ? (
          <>
            <li className="nav-item"><Link to="/login">Login</Link></li>
            <li className="nav-item"><Link to="/signup">Sign Up</Link></li>
          </>
        ) : (
          <>
            <li className="nav-item"><Link to="/upload">Upload</Link></li>
            <li className="nav-item"><Link to="/reports">Reports</Link></li>
            <li className="nav-item"><Link to="/verify-email">Verify Email</Link></li>
            <li className="nav-item"><Link to="/verify-phone">Verify Phone</Link></li>
            <li className="nav-item"><Link to="/upgrade">Upgrade</Link></li>
            <li className="nav-item"><Link to="/settings">Settings</Link></li>
            <li className="nav-item"><button onClick={handleLogout} className="logout-btn">Logout</button></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
