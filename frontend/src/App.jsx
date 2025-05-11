import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Topic from './pages/Topic.jsx';
import AttemptReviewPage from "./pages/AttemptReviewPage.jsx";

const App = () => {
    const isAuthenticated = !!localStorage.getItem('token');

    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    isAuthenticated ? <Navigate to="/topic" /> : <Navigate to="/login" />
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/topic"
                    element={isAuthenticated ? <Topic /> : <Navigate to="/login" />}
                />
                <Route
                    path="/topic/:topicId/quizzes"
                />
                <Route path="/attempt/:attemptId" element={isAuthenticated ? <AttemptReviewPage /> : <Navigate to="/login" />}/>
            </Routes>
        </Router>
    );
};

export default App;
