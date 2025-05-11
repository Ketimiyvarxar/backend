import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Typography, Box, CircularProgress, Alert,
    ThemeProvider, createTheme, Button, CssBaseline, Paper
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Logo from '../assets/logo.png';

const theme = createTheme({
    palette: {
        primary:   { main: '#0B4DA1' },
        secondary: { main: '#00A19D' },
        info:      { main: '#F4F8FF' }
    },
    typography: { fontFamily: 'Poppins, Roboto, sans-serif' }
});

const AttemptReviewPage = () => {
    const { attemptId } = useParams();
    const navigate      = useNavigate();

    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    const auth = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    useEffect(() => {
        axios.get(`/api/topic/quizz/attempt/${attemptId}`, auth())
            .then(r => setAttempt(r.data))
            .catch(() => setError('Failed to load attempt'))
            .finally(() => setLoading(false));
    }, [attemptId]);

    /* ---------- loading / error ---------- */
    if (loading)
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box sx={{ bgcolor:'info.main', minHeight:'100vh', pt:4 }}>
                    <Container><CircularProgress color="primary" /></Container>
                </Box>
            </ThemeProvider>
        );

    if (error)
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box sx={{ bgcolor:'info.main', minHeight:'100vh', pt:4 }}>
                    <Container><Alert severity="error">{error}</Alert></Container>
                </Box>
            </ThemeProvider>
        );

    /* ---------- main UI ---------- */
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {/* page background */}
            <Box sx={{ bgcolor:'info.main', minHeight:'100vh', py:4 }}>
                <Container maxWidth="md">
                    {/* white card */}
                    <Paper elevation={3} sx={{ p:4, borderRadius:2 }}>
                        <Box textAlign="center" mb={2}>
                            <img src={Logo} alt="Logo" style={{ height:64 }} />
                        </Box>

                        <Button variant="text" sx={{ mb:2 }}
                                onClick={() => navigate(-1)}>
                            &larr; Back
                        </Button>

                        <Typography variant="h4" gutterBottom color="primary.main">
                            Review – {attempt.quiz.name}
                        </Typography>

                        {attempt.questions.map(q => (
                            <Box key={q.id} mb={3}>
                                <Typography fontWeight={600}>{q.text}</Typography>
                                <Box pl={3} mt={1}>
                                    {q.answers.map(a => {
                                        const wrongChosen = a.selected && !a.isCorrect;
                                        const right       = a.isCorrect;
                                        return (
                                            <Box key={a.id}
                                                 display="flex"
                                                 alignItems="center"
                                                 sx={{
                                                     textDecoration: wrongChosen ? 'line-through' : 'none',
                                                     color: wrongChosen ? 'error.main' : 'inherit',
                                                     mb: .5
                                                 }}>
                                                {right       && <CheckIcon  fontSize="small" color="success" sx={{ mr:.5 }} />}
                                                {wrongChosen && <CloseIcon fontSize="small" color="error"   sx={{ mr:.5 }} />}
                                                <Typography variant="body2">{a.text}</Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default AttemptReviewPage;
