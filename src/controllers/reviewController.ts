import { Request, Response } from 'express';
import prisma from '../prisma';

export const createReview = async (req: Request, res: Response) => {
  try {
    const { userId, housingId, score, comment } = req.body;
    
    // Validate score (assuming score is between 1-5)
    if (score < 1 || score > 5) {
      res.status(400).json({ message: 'Score must be between 1 and 5' });
      return;
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid user' });
      return;
    }

    // Check if housing exists
    const housing = await prisma.housing.findUnique({
      where: { id: parseInt(housingId) }
    });

    if (!housing) {
      res.status(400).json({ message: 'Invalid housing' });
      return;
    }

    // Check if user has already reviewed this housing
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: parseInt(userId),
        housingId: parseInt(housingId)
      }
    });

    if (existingReview) {
      res.status(400).json({ message: 'You have already reviewed this housing' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        userId: parseInt(userId),
        housingId: parseInt(housingId),
        score: parseInt(score),
        comment
      }
    });

    res.status(201).json({ review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
};

export const getReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        housing: {
          select: {
            id: true,
            title: true,
            address: true
          }
        }
      }
    });

    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    res.status(200).json({ review });
  } catch (error) {
    console.error('Error getting review:', error);
    res.status(500).json({ message: 'Error getting review' });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score, comment, userId } = req.body;
    
    // Validate score (assuming score is between 1-5)
    if (score && (score < 1 || score > 5)) {
      res.status(400).json({ message: 'Score must be between 1 and 5' });
      return;
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user is the author of the review
    if (existingReview.userId !== parseInt(userId)) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const review = await prisma.review.update({
      where: { id: parseInt(id) },
      data: {
        score: score ? parseInt(score) : undefined,
        comment: comment ? comment : undefined
      }
    });

    res.status(200).json({ review });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Error updating review' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(req.body.userId);

    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user is the author of the review
    if (existingReview.userId !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await prisma.review.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
};

export const listReviews = async (req: Request, res: Response) => {
  try {
    const { housingId, userId } = req.query;
    
    let where = {};
    
    // Filter by housingId if provided
    if (housingId) {
      where = {
        ...where,
        housingId: parseInt(housingId as string)
      };
    }
    
    // Filter by userId if provided
    if (userId) {
      where = {
        ...where,
        userId: parseInt(userId as string)
      };
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        housing: {
          select: {
            id: true,
            title: true,
            address: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error listing reviews:', error);
    res.status(500).json({ message: 'Error listing reviews' });
  }
};
