import express from 'express';
import cors from 'cors';
import { prisma } from './prisma';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
