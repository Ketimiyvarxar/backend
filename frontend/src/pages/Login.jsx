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
        secondary: { main: '#00A19D' },
    },
    typography: { fontFamily: 'Poppins, Roboto, sans-serif' }
});

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) =>
        setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            navigate('/topic');
        } catch {
            setError('Invalid email or password');
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="xs">
                <Box mt={8} textAlign="center">
                    <img src={Logo} alt="Konstanta" style={{ height: 60 }} />
                    <Typography variant="h5" mt={2} color="primary.main">Login</Typography>

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} mt={3}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            color="primary"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            color="primary"
                            required
                        />
                        <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
                            Login
                        </Button>
                        <Button fullWidth color="secondary" sx={{ mt: 1 }} onClick={() => navigate('/register')}>
                            Don't have an account? Register
                        </Button>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default Login;