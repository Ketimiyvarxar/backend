// src/pages/TopicPage.jsx
import React, { useEffect, useState } from 'react';
import {ListItemButton, Chip, LinearProgress } from '@mui/material';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import  IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';


import axios from 'axios';
import {
    Container,
    Typography,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert,
    Box,
    Button,
    RadioGroup,
    FormControlLabel,
    Radio,
    Stack,
    ThemeProvider,
    createTheme
} from '@mui/material';
import Logo from '../assets/logo.png';
import {useNavigate} from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";

/* ─────────── theme (Konstanta palette) ─────────── */
const theme = createTheme({
    palette: {
        primary: { main: '#0B4DA1' },
        secondary: { main: '#00A19D' },
        info: { main: '#F4F8FF' }
    },
    typography: { fontFamily: 'Poppins, Roboto, sans-serif' }
});

/* ─────────── small sub-components ─────────── */
const QuizSummary = ({ summary }) => (
    <Box mt={3} p={2} sx={{ bgcolor: '#e8f5e9', borderRadius: 2 }}>
        <Typography variant="subtitle1">Attempt ID: {summary.attemptId}</Typography>
        <Typography variant="subtitle1">Correct answers: {summary.correctCount}</Typography>
    </Box>
);


const TopicPage = () => {
    const [topics, setTopics]             = useState([]);
    const [loadingTopics, setLoadTopics]  = useState(true);
    const [topicsErr, setTopicsErr]       = useState('');
    const [selectedTopic, setSelected]    = useState(null);
    const navigate = useNavigate();


    const [quizzes, setQuizzes]                 = useState([]);
    const [loadingQuizList, setLoadQuizList]    = useState(false);
    const [quizListErr, setQuizListErr]         = useState('');
    const [quizDetails, setQuizDetails]         = useState({});
    const [expandedQuizId, setExpandedQuizId]   = useState(null);
    const [loadingDetail, setLoadDetail]        = useState(false);

    const [answers, setAnswers]       = useState({});
    const [summary, setSummary]       = useState(null);
    const [review, setReview]         = useState(null);
    const [loadingReview, setLoadRev] = useState(false);

    const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useEffect(() => {

        axios.get('/api/topic',auth())
            .then(r => setTopics(r.data.topics || []))
            .catch(() => setTopicsErr('Failed to load topics'))
            .finally(() => setLoadTopics(false));
    }, []);

    /* load quizzes for topic */
    const loadQuizzes = (topic) => {
        setSelected(topic);
        setExpandedQuizId(null);
        setQuizDetails({});
        setAnswers({});
        setSummary(null);
        setReview(null);

        setLoadQuizList(true);
        axios.get(`/api/topic/${topic.id}/quizzes`, auth())
            .then(r => {
                const q = r.data.quizzes ?? r.data ?? [];
                setQuizzes(Array.isArray(q) ? q : [q]);
            })
            .catch(() => setQuizListErr('Failed to load quizzes'))
            .finally(() => setLoadQuizList(false));
    };

    /* toggle single quiz detail */
    const toggleQuiz = async (quiz) => {
        const id = quiz.quizId;
        if (expandedQuizId === id) {
            setExpandedQuizId(null);
            setAnswers({});
            setSummary(null);
            setReview(null);
            return;
        }
        setExpandedQuizId(id);
        setAnswers({});
        setSummary(null);
        setReview(null);

        if (quizDetails[id]) return; // cached

        setLoadDetail(true);
        try {
            const r = await axios.get(`/api/topic/quizz/${id}`, auth());
            setQuizDetails(p => ({ ...p, [id]: r.data.quiz?.[0] || r.data }));
        } finally { setLoadDetail(false); }
    };

    /* select answer */
    const handleSelect = qid => e =>
        setAnswers(p => ({ ...p, [qid]: +e.target.value }));

    /* submit answers */
    const handleSubmit = async () => {
        if (!expandedQuizId) return;
        const payload = {
            quizId: expandedQuizId,
            answers: Object.entries(answers).map(([questionId, answerId]) => ({
                questionId: +questionId,
                answerId
            }))
        };
        try {
            const r = await axios.post('/api/topic/quizz/take', payload, auth());
            setSummary(r.data.quizAttemptSummary || r.data.quizAttempt || null);
        } catch { alert('Submit failed'); }
    };

    /* review full attempt */
    const handleReview = async () => {
        if (!summary) return;
        setLoadRev(true);
        try {
            const r = await axios.get(`/api/topic/quizz/attempt/${summary.attemptId}`, auth());
            setReview(r.data);
        } finally { setLoadRev(false); }
    };

    /* ─────────────────── render ─────────────────── */
    return (
        <ThemeProvider theme={theme}>
            <Container>
                <Box
                    mt={4}
                    mb={2}
                    px={1}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    {/* logo – left */}
                    <img src={Logo} alt="Logo" style={{ height: 64 }} />

                    {/* logout – right */}
                    <IconButton
                        color="primary"
                        size="large"
                        onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/login');          
                        }}
                    >
                        <LogoutIcon />
                    </IconButton>
                </Box>


                {/* TOPICS */}
                {!selectedTopic && (
                    <>
                        <Typography variant="h4" gutterBottom color="primary.main">Topics</Typography>
                        {loadingTopics && <CircularProgress color="primary" />}
                        {topicsErr && <Alert severity="error">{topicsErr}</Alert>}

                        {!loadingTopics && !topicsErr && (
                            topics.length ? (
                                <List sx={{ bgcolor: 'info.main', borderRadius: 2 }}>
                                    {topics.map(t => (
                                        <ListItem key={t.id} disablePadding>
                                            <ListItemButton
                                                onClick={() => loadQuizzes(t)}
                                                sx={{ '&:hover': { bgcolor: 'secondary.main', color: '#fff' } }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" alignItems="center">
                                                            <Typography sx={{ flexGrow: 1 }}>{t.name}</Typography>

                                                            {/* Chip for status */}
                                                            {t.isCompleted ? (
                                                                <Chip
                                                                    label="Completed"
                                                                    color="success"
                                                                    size="small"
                                                                    icon={<CheckIcon sx={{ fontSize: 16 }} />}
                                                                    sx={{ mr: 1 }}
                                                                />
                                                            ) : (
                                                                <Chip
                                                                    label="New"
                                                                    color="default"
                                                                    size="small"
                                                                    icon={<NewReleasesIcon sx={{ fontSize: 16 }} />}
                                                                    sx={{ mr: 1 }}
                                                                />
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box mt={0.5}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={t.averageScore * 100}   /* 0 → 0 %, 1 → 100 % */
                                                                sx={{
                                                                    height: 6,
                                                                    borderRadius: 3,
                                                                    backgroundColor: '#e0e0e0',
                                                                    '& .MuiLinearProgress-bar': {
                                                                        backgroundColor: '#00A19D' /* teal */
                                                                    }
                                                                }}
                                                            />
                                                        </Box>
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Typography>No topics found.</Typography>
                            )
                        )}
                    </>
                )}

                {/* QUIZZES */}
                {selectedTopic && (
                    <>
                        <Button variant="text" sx={{ mb:2 }}
                                onClick={() => { setSelected(null); setSummary(null); setReview(null); }}>
                            &larr; Back to topics
                        </Button>

                        <Typography variant="h4" gutterBottom color="primary.main">
                            {selectedTopic.name} – Quizzes
                        </Typography>

                        {loadingQuizList && <CircularProgress color="primary" />}
                        {quizListErr && <Alert severity="error">{quizListErr}</Alert>}

                        {!loadingQuizList && !quizListErr && quizzes.map(quiz => {
                            const id     = quiz.quizId;
                            const detail = quizDetails[id];
                            const open   = expandedQuizId === id;

                            return (
                                <Box key={id} mb={3} p={2} sx={{ bgcolor:'info.main', borderRadius:2 }}>
                                    <Typography variant="h5" color="secondary.main"
                                                sx={{ cursor:'pointer' }}
                                                onClick={() => toggleQuiz(quiz)}>
                                        {quiz.quizName}
                                    </Typography>

                                    {open && (
                                        loadingDetail && !detail ? <CircularProgress size={24} /> :
                                            detail ? (
                                                <>
                                                    {detail.questions?.map(q => (
                                                        <Box key={q.id} ml={2} mb={2}>
                                                            <Typography fontWeight={600}>{q.text}</Typography>
                                                            <RadioGroup
                                                                name={`q-${q.id}`}
                                                                value={answers[q.id] || ''}
                                                                onChange={handleSelect(q.id)}
                                                                sx={{ pl:3 }}>
                                                                {q.answers?.map(a => (
                                                                    <FormControlLabel
                                                                        key={a.id}
                                                                        value={a.id}
                                                                        control={<Radio color="secondary" />}
                                                                        label={a.text}
                                                                    />
                                                                ))}
                                                            </RadioGroup>
                                                        </Box>
                                                    ))}

                                                    {/* Submit + Review */}
                                                    <Stack direction="row" spacing={2} sx={{ mt:2 }}>
                                                        <Button variant="contained"
                                                                disabled={!Object.keys(answers).length}
                                                                onClick={handleSubmit}>
                                                            Submit
                                                        </Button>
                                                        <Button variant="outlined" color="secondary"
                                                                disabled={!summary}
                                                                onClick={() => navigate(`/attempt/${summary.attemptId}`)}>
                                                            Review
                                                        </Button>
                                                    </Stack>

                                                    {/* Summary & Review */}
                                                    {summary && <QuizSummary summary={summary} />}
                                                    {loadingReview && <CircularProgress sx={{ mt:2 }} />}
                                                    {/*{review && <AttemptReview review={review} />}*/}
                                                </>
                                            ) : <Typography>No questions.</Typography>
                                    )}
                                </Box>
                            );
                        })}
                    </>
                )}
            </Container>
        </ThemeProvider>
    );
};

export default TopicPage;
