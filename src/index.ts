import express from 'express';
import cors from 'cors';
import { swaggerUi, swaggerSpec } from './swagger';
import router from './router';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/', router);

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
