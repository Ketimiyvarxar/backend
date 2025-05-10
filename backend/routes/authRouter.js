/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: User registration & login
 *
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - username
 *         - email
 *         - password
 *         - repeatPassword
 *       properties:
 *         firstName:
 *           type: string
 *           description: User's first name (2–20 chars)
 *         lastName:
 *           type: string
 *           description: User's last name (2–20 chars)
 *         username:
 *           type: string
 *           description: Unique username (2–20 chars)
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *           description: At least 8 chars, upper/lower/number/special
 *         repeatPassword:
 *           type: string
 *           format: password
 *           description: Must match `password`
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT for authenticated requests
 */

const router = require('express').Router();
const { register, login } = require('../controllers/authController');

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       '201':
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       '400':
 *         description: Validation error (e.g. missing fields, bad password, duplicates)
 *       '500':
 *         description: Server error
 */
router.post('/register', register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       '400':
 *         description: Missing email or password
 *       '401':
 *         description: Invalid credentials
 *       '500':
 *         description: Server error
 */
router.post('/login', login);

module.exports = router;
