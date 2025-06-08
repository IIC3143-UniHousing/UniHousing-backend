import { Router, Request, Response } from 'express';
import { auth0Login } from '../controllers/authController';

const router = Router();
router.post('/login', async (req: Request, res: Response) => {
    await auth0Login(req, res);
});

export default router;