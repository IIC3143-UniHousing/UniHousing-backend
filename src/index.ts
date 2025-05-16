import express from 'express';
import cors from 'cors';
import prisma from './prisma';
import { swaggerUi, swaggerSpec } from './swagger';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Express + TypeScript!');
});

app.get('/hello', (req, res) => {
  res.json({ 'data': 'Hello World!' });
});

app.get('/dbhealth', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
