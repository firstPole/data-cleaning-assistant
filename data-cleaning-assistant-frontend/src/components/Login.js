import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import styles from './style/Login.module.css'; // Import CSS Module

function Login() {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const msg = await login(email, password);
            setMessage(msg);
            setError('');
            navigate('/dashboard');
        } catch (error) {
            setError('Login failed: ' + error.message);
            setMessage('');
        }
    };

    return (
        <Container className={styles.loginContainer}>
            <Row className="justify-content-center align-items-center min-vh-100">
                <Col md={6} lg={4}>
                    <div className={styles.loginFormContainer}>
                        <h2 className="text-center mb-4">Login</h2>
                        <Form onSubmit={handleLogin}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email:</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className={styles.formControl}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Password:</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className={styles.formControl}
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" className={styles.btnPrimary}>Login</Button>
                        </Form>
                        {message && <Alert variant="success" className="mt-3">{message}</Alert>}
                        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;
