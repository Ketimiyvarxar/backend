/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Admin-only operations for managing topics and quizzes
 *
 * components:
 *   schemas:
 *     TopicCreateRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Topic name (3–50 chars)
 *
 *     QuizCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - questions
 *       properties:
 *         name:
 *           type: string
 *           description: Quiz name (3–100 chars)
 *         questions:
 *           type: array
 *           description: Array of questions, each with text and answers
 *           items:
 *             type: object
 *             required: [text, answers]
 *             properties:
 *               text:
 *                 type: string
 *                 description: Question text (5–255 chars)
 *               answers:
 *                 type: array
 *                 description: Possible answers (2–10 items)
 *                 items:
 *                   type: object
 *                   required: [text, isCorrect]
 *                   properties:
 *                     text:
 *                       type: string
 *                       description: Answer text (1–100 chars)
 *                     isCorrect:
 *                       type: boolean
 *                       description: Whether this answer is correct
 */

const router = require('express').Router();
const authMiddleware  = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { createTopic, createQuiz } = require('../controllers/adminController');

// All admin routes require a valid JWT _and_ is_admin=true
router.use(authMiddleware, adminMiddleware);

/**
 * @openapi
 * /api/admin/topics:
 *   post:
 *     summary: Create a new topic
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TopicCreateRequest'
 *     responses:
 *       201:
 *         description: Topic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topic:
 *                   $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden (non-admin)
 *       500:
 *         description: Server error
 */
router.post('/topics', createTopic);

/**
 * @openapi
 * /api/admin/topics/{topicId}/quizzes:
 *   post:
 *     summary: Create a new quiz under a topic
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the topic to add the quiz to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuizCreateRequest'
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quiz:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     topicId:
 *                       type: integer
 *                     name:
 *                       type: string
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden (non-admin)
 *       404:
 *         description: Topic not found
 *       500:
 *         description: Server error
 */
router.post('/topics/:topicId/quizzes', createQuiz);

module.exports = router;