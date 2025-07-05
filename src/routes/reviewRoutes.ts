import { Router, Request, Response } from 'express';
import { createReview, getReview, updateReview, deleteReview, listReviews } from '../controllers/reviewController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { RequestHandler } from 'express-serve-static-core';

const router = Router();

/**
 * @swagger
 * components:
 *  schemas:
 *    Review:
 *      type: object
 *      required:
 *        - userId
 *        - housingId
 *        - score
 *        - comment
 *      properties:
 *        id:
 *          type: integer
 *          description: The auto-generated id of the review
 *        userId:
 *          type: integer
 *          description: The id of the user who made the review
 *        housingId:
 *          type: integer
 *          description: The id of the housing being reviewed
 *        score:
 *          type: integer
 *          description: The score given (1-5)
 *        comment:
 *          type: string
 *          description: The review comment
 *        date:
 *          type: string
 *          format: date-time
 *          description: The date the review was created
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - housingId
 *               - score
 *               - comment
 *             properties:
 *               userId:
 *                 type: integer
 *               housingId:
 *                 type: integer
 *               score:
 *                 type: integer
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: The review was successfully created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, createReview as RequestHandler);

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get all reviews, optionally filtered by housingId or userId
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: housingId
 *         schema:
 *           type: integer
 *         description: Filter by housing ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: List of reviews
 *       500:
 *         description: Server error
 */
router.get('/', listReviews as RequestHandler);

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Get a review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The review ID
 *     responses:
 *       200:
 *         description: Review details
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getReview as RequestHandler);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               score:
 *                 type: integer
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, updateReview as RequestHandler);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Review deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, deleteReview as RequestHandler);

export default router;
