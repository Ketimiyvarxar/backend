/**
 * @openapi
 * tags:
 *   - name: User
 *     description: User profile endpoints
 *
 * components:
 *   schemas:
 *     WhoAmIResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User identifier
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const router = require('express').Router();
const { whoami } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @openapi
 * /api/user/whoami:
 *   get:
 *     summary: Get the authenticated user's details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WhoAmIResponse'
 *       401:
 *         description: Unauthorized (no or invalid token)
 *       403:
 *         description: Forbidden (expired token)
 */
router.get('/whoami', authMiddleware, whoami);

module.exports = router;
