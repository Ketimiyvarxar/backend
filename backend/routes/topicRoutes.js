/**
 * @openapi
 * tags:
 *   - name: Topics
 *     description: Topic and quiz endpoints
 *
 * components:
 *   schemas:
 *     Topic:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Topic identifier
 *         name:
 *           type: string
 *           description: Topic name
 *     QuizSummary:
 *       type: object
 *       properties:
 *         quizId:
 *           type: integer
 *           description: Quiz identifier
 *         quizName:
 *           type: string
 *           description: Name of the quiz
 *     QuizDetail:
 *       type: object
 *       properties:
 *         quizId:
 *           type: integer
 *         quizName:
 *           type: string
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuestionDetail'
 *     QuestionDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         text:
 *           type: string
 *         position:
 *           type: integer
 *         answers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AnswerSummary'
 *     AnswerSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         text:
 *           type: string
 *
 *     TakeQuizRequest:
 *       type: object
 *       required:
 *         - quizId
 *         - answers
 *       properties:
 *         quizId:
 *           type: integer
 *         answers:
 *           type: array
 *           items:
 *             type: object
 *             required: [questionId, answerId]
 *             properties:
 *               questionId:
 *                 type: integer
 *               answerId:
 *                 type: integer
 *
 *     QuizAttemptSummary:
 *       type: object
 *       properties:
 *         attemptId:
 *           type: integer
 *         takenAt:
 *           type: string
 *           format: date-time
 *         correctCount:
 *           type: integer
 *
 *     QuizAttemptDetail:
 *       type: object
 *       properties:
 *         attemptId:
 *           type: integer
 *         takenAt:
 *           type: string
 *           format: date-time
 *         quiz:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuestionDetail'
 */

const router = require('express').Router();
const {getTopics} = require("../controllers/topicController");
const {
    getQuizById,
    getQuizzesByTopicId,
    takeQuiz,
    listAttempts,
    getAttempt
} = require("../controllers/quizController");
const authMiddleware = require('../middleware/authMiddleware');
const notRequiredAuthMiddleware = require('../middleware/notRequiredAuthMiddleware');

/**
 * @openapi
 * /api/topic:
 *   get:
 *     summary: List all topics
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of topic objects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topics:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Topic'
 *       500:
 *         description: Server error
 */
router.get('/', notRequiredAuthMiddleware, getTopics);

/**
 * @openapi
 * /api/topic/{topicId}/quizzes:
 *   get:
 *     summary: List all quizzes for a topic
 *     tags: [Topics]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the topic
 *     responses:
 *       200:
 *         description: Array of quiz summaries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quizzes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QuizSummary'
 *       404:
 *         description: No quizzes found for this topic
 *       500:
 *         description: Server error
 */
router.get('/:topicId/quizzes', notRequiredAuthMiddleware, getQuizzesByTopicId);

/**
 * @openapi
 * /api/topic/quizz/{quizId}:
 *   get:
 *     summary: Get detailed quiz by ID
 *     tags: [Topics]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the quiz
 *     responses:
 *       200:
 *         description: Quiz detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quiz:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QuizDetail'
 *       404:
 *         description: No quiz found with this ID
 *       500:
 *         description: Server error
 */
router.get('/quizz/:quizId', notRequiredAuthMiddleware, getQuizById);

/**
 * @openapi
 * /api/topic/quizz/take:
 *   post:
 *     summary: Submit answers for a quiz attempt
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TakeQuizRequest'
 *     responses:
 *       201:
 *         description: Quiz attempt recorded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAttemptSummary'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized (no token)
 *       403:
 *         description: Forbidden (invalid/expired token)
 *       500:
 *         description: Server error
 */
router.post('/quizz/take', authMiddleware, takeQuiz);

/**
 * @openapi
 * /api/topic/quizz/{quizId}/attempts:
 *   get:
 *     summary: List all past attempts for a quiz
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the quiz
 *     responses:
 *       200:
 *         description: Array of attempt summaries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attempts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QuizAttemptSummary'
 *       404:
 *         description: No attempts found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/quizz/:quizId/attempts', authMiddleware, listAttempts);

/**
 * @openapi
 * /api/topic/quizz/attempt/{attemptId}:
 *   get:
 *     summary: Get details of a specific attempt
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the attempt
 *     responses:
 *       200:
 *         description: Detailed attempt with user selections
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAttemptDetail'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Attempt or quiz not found
 *       500:
 *         description: Server error
 */
router.get('/quizz/attempt/:attemptId', authMiddleware, getAttempt);

module.exports = router;