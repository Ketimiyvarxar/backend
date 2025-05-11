import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    ThemeProvider,
    createTheme
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.png';

const theme = createTheme({
    palette: {
        primary: { main: '#0B4DA1' },
        secondary: { main: '#00A19D' }
    },
    typography: { fontFamily: 'Poppins, Roboto, sans-serif' }
});

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        repeatPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) =>
        setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.repeatPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            await axios.post('/api/auth/register', formData);
            navigate('/login');
        } catch {
            setError('Registration failed');
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="xs">
                <Box mt={6} textAlign="center">
                    <img src={Logo} alt="Konstanta" style={{ height: 60 }} />
                    <Typography variant="h5" mt={2} color="primary.main">Register</Typography>

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} mt={3}>
                        <TextField label="First Name" name="firstName" fullWidth margin="normal" value={formData.firstName} onChange={handleChange} required />
                        <TextField label="Last Name" name="lastName" fullWidth margin="normal" value={formData.lastName} onChange={handleChange} required />
                        <TextField label="Username" name="username" fullWidth margin="normal" value={formData.username} onChange={handleChange} required />
                        <TextField label="Email" name="email" type="email" fullWidth margin="normal" value={formData.email} onChange={handleChange} required />
                        <TextField label="Password" name="password" type="password" fullWidth margin="normal" value={formData.password} onChange={handleChange} required />
                        <TextField label="Repeat Password" name="repeatPassword" type="password" fullWidth margin="normal" value={formData.repeatPassword} onChange={handleChange} required />

                        <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
                            Register
                        </Button>
                        <Button fullWidth color="secondary" sx={{ mt: 1 }} onClick={() => navigate('/login')}>
                            Already have an account? Login
                        </Button>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default Register;