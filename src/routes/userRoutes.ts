import { Router, Request, Response } from 'express';
import { createUser, login, updateUser, getUser } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with the provided email, password, and name
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - auth0Id
 *               - type
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               auth0Id:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [estudiante, propietario]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post('/register', async (req: Request, res: Response) => {
  await createUser(req, res);
});

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login a user
 *     description: Logs in a user with the provided auth0Id
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - auth0Id
 *             properties:
 *               auth0Id:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', async (req: Request, res: Response) => {
  await login(req, res);
});

router.get('/me', authenticateToken, getUser);

router.put('/me', authenticateToken, updateUser);


export default router;
