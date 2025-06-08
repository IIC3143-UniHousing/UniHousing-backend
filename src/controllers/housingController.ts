import { Request, Response } from 'express';
import prisma from '../prisma';
import housingService from '../services/housingService';

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
    const filters = {
      available: req.query.available === 'true',
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      minRooms: req.query.minRooms ? parseInt(req.query.minRooms as string) : undefined,
      maxRooms: req.query.maxRooms ? parseInt(req.query.maxRooms as string) : undefined,
      minBathrooms: req.query.minBathrooms ? parseInt(req.query.minBathrooms as string) : undefined,
      maxBathrooms: req.query.maxBathrooms ? parseInt(req.query.maxBathrooms as string) : undefined
    };

    const housing = await housingService.filterHousing(filters);

    res.status(200).json({ housing });
  } catch (error) {
    console.error('Error listing housing:', error);
    res.status(500).json({ message: 'Error listing housing' });
  }
};
