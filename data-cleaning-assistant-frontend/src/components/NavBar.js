// src/components/NavBar.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import './style/NavBar.css'; // Import custom CSS file for additional styling

function NavBar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirect to login page after logout
    };

    return (
        <Navbar bg="light" expand="lg" className="navbar">
            <Container>
                <Navbar.Brand as={Link} to="/">MyApp</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        {!user ? (
                            <>
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/upload">Upload</Nav.Link>
                                <Nav.Link as={Link} to="/reports">Reports</Nav.Link>
                                <Nav.Link as={Link} to="/verify-email">Verify Email</Nav.Link>
                                <Nav.Link as={Link} to="/verify-phone">Verify Phone</Nav.Link>
                                <Nav.Link as={Link} to="/upgrade">Upgrade</Nav.Link>
                                <Nav.Link as={Link} to="/settings">Settings</Nav.Link>
                                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavBar;
