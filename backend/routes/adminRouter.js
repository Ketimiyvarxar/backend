const router = require('express').Router();
const authMiddleware  = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { createTopic, createQuiz } = require('../controllers/adminController');

// All admin routes require a valid JWT _and_ is_admin=true
router.use(authMiddleware, adminMiddleware);

// POST /api/admin/topics
router.post('/topics', createTopic);

// POST /api/admin/topics/:topicId/quizzes
router.post('/topics/:topicId/quizzes', createQuiz);

module.exports = router;
