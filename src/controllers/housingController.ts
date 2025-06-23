import { Request, Response } from 'express';
import prisma from '../prisma';

export const createHousing = async (req: Request, res: Response) => {
  try {
    const { title, description, address, price, rooms, bathrooms, size, images } = req.body;
    const ownerId = parseInt(req.body.ownerId);

    // Check if user exists and is a propietario
    const owner = await prisma.user.findUnique({
      where: { id: ownerId }
    });

    if (!owner || owner.type !== 'propietario') {
      return res.status(400).json({ message: 'Invalid owner' });
    }

    const housing = await prisma.housing.create({
      data: {
        title,
        description,
        address,
        price: parseFloat(price),
        rooms: parseInt(rooms),
        bathrooms: parseInt(bathrooms),
        size: parseFloat(size),
        images,
        ownerId
      }
    });

    res.status(201).json({ housing });
  } catch (error) {
    console.error('Error creating housing:', error);
    res.status(500).json({ message: 'Error creating housing' });
  }
};

export const getHousing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const housing = await prisma.housing.findUnique({
      where: { id: parseInt(id) },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!housing) {
      return res.status(404).json({ message: 'Housing not found' });
    }

    res.status(200).json({ housing });
  } catch (error) {
    console.error('Error getting housing:', error);
    res.status(500).json({ message: 'Error getting housing' });
  }
};

export const updateHousing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, address, price, rooms, bathrooms, size, images, available } = req.body;
    const ownerId = parseInt(req.body.ownerId);

    const existingHousing = await prisma.housing.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingHousing) {
      return res.status(404).json({ message: 'Housing not found' });
    }

    if (existingHousing.ownerId !== ownerId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const housing = await prisma.housing.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        address,
        price: parseFloat(price),
        rooms: parseInt(rooms),
        bathrooms: parseInt(bathrooms),
        size: parseFloat(size),
        images,
        available
      }
    });

    res.status(200).json({ housing });
  } catch (error) {
    console.error('Error updating housing:', error);
    res.status(500).json({ message: 'Error updating housing' });
  }
};

export const deleteHousing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ownerId = parseInt(req.body.ownerId);

    const existingHousing = await prisma.housing.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingHousing) {
      return res.status(404).json({ message: 'Housing not found' });
    }

    if (existingHousing.ownerId !== ownerId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.housing.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting housing:', error);
    res.status(500).json({ message: 'Error deleting housing' });
  }
};

export const listHousing = async (req: Request, res: Response) => {
  try {
    const { available } = req.query;

    const where = available ? { available: available === 'true' } : {};

    const housing = await prisma.housing.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({ housing });
  } catch (error) {
    console.error('Error listing housing:', error);
    res.status(500).json({ message: 'Error listing housing' });
  }
};

export const isRecentHousing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const housing = await prisma.housing.findUnique({
      where: { id: parseInt(id) }
    });

    if (!housing) {
      return res.status(404).json({ message: 'Housing not found' });
    }

    // Calculate if the housing was created within the last 30 minutes
    const now = new Date();
    const createdAt = new Date(housing.createdAt);
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    const isRecent = createdAt >= thirtyMinutesAgo;

    res.status(200).json({ isRecent });
  } catch (error) {
    console.error('Error checking if housing is recent:', error);
    res.status(500).json({ message: 'Error checking if housing is recent' });
  }
};
