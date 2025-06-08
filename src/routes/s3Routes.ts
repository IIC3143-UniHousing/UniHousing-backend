import { Router, Request, Response } from 'express';
import { getPresignedPost } from '../controllers/s3Controller';

const router = Router();

/**
 * @swagger
 * /api/s3/presignedpost:
 *   post:
 *     summary: Generate a presigned POST URL for S3 direct upload
 *     tags: [S3]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filename
 *             properties:
 *               filename:
 *                 type: string
 *                 description: Original filename with extension
 *               contentType:
 *                 type: string
 *                 description: Optional MIME type of the file (defaults to image/jpeg)
 *     responses:
 *       200:   
 *         description: Presigned URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 presignedPost:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     fields:
 *                       type: object
 *                 fileUrl:
 *                   type: string
 *                   description: The public URL where the file will be accessible after upload
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
router.post('/presignedpost', async (req: Request, res: Response) => {
  await getPresignedPost(req, res);
});

export default router;
