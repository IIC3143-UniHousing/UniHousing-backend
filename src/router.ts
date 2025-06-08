import userRoutes from './routes/userRoutes';
import housingRoutes from './routes/housingRoutes';
import s3Routes from './routes/s3Routes';
import { Router } from 'express';
import prisma from './prisma';
import { Request, Response } from 'express';

const router = Router();

router.use('/api/users', userRoutes);
router.use('/api/housing', housingRoutes);
router.use('/api/s3', s3Routes);

router.get('/', (req, res) => {
    res.send('Hello from Express + TypeScript!');
  });
/**
 * @swagger
 * /:
 *   get:
 *     summary: Hello World
 *     description: Returns a simple greeting
 */

router.get('/dbhealth', async (req, res) => {
    try {
    await prisma.$connect();
    res.json({ data: true });
    } catch (err) {
    res.status(500).json({ data: false });
    }
});
/**
 * @swagger
 * /dbhealth:
 *   get:
 *     summary: Database health check
 *     description: Checks if the database connection is working
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: boolean
 *       500:
 *         description: Database connection error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: boolean
 */

export default router;
