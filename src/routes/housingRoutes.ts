import { Router, Request, Response } from 'express';
import { createHousing, getHousing, updateHousing, deleteHousing, listHousing } from '../controllers/housingController';

const router = Router();

/**
 * @swagger
 * /api/housing:
 *   post:
 *     summary: Create a new housing listing
 *     tags: [Housing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - address
 *               - price
 *               - rooms
 *               - bathrooms
 *               - size
 *               - ownerId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               price:
 *                 type: number
 *               rooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               size:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               ownerId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Housing created successfully
 *       400:
 *         description: Invalid owner
 *       500:
 *         description: Server error
 */
router.post('/', async (req: Request, res: Response) => {
  await createHousing(req, res);
});

/**
 * @swagger
 * /api/housing/{id}:
 *   get:
 *     summary: Get housing by ID
 *     tags: [Housing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Housing found
 *       404:
 *         description: Housing not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req: Request, res: Response) => {
  await getHousing(req, res);
});

/**
 * @swagger
 * /api/housing/{id}:
 *   put:
 *     summary: Update housing
 *     tags: [Housing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               price:
 *                 type: number
 *               rooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               size:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               available:
 *                 type: boolean
 *               ownerId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Housing updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Housing not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req: Request, res: Response) => {
  await updateHousing(req, res);
});

/**
 * @swagger
 * /api/housing/{id}:
 *   delete:
 *     summary: Delete housing
 *     tags: [Housing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ownerId
 *             properties:
 *               ownerId:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Housing deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Housing not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req: Request, res: Response) => {
  await deleteHousing(req, res);
});

/**
 * @swagger
 * /api/housing:
 *   get:
 *     summary: List all housing
 *     tags: [Housing]
 *     parameters:
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *     responses:
 *       200:
 *         description: List of housing
 *       500:
 *         description: Server error
 */
router.get('/', listHousing);

export default router;
