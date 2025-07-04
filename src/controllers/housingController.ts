import { Request, Response } from 'express';
import prisma from '../prisma';
import fetch from 'node-fetch';

interface NominatimResponse {
  lat: string;
  lon: string;
}

const geocodeAddress = async (address: string) => {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`, {
    headers: { 'User-Agent': 'UniHousing/1.0 (email@ejemplo.com)' } 
  });
  const data = await response.json() as NominatimResponse[];
  if (data.length === 0) throw new Error('Dirección no válida');
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon)
  };
};

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

    let lat: number;
    let lon: number;

    try {
      const coords = await geocodeAddress(address);
      lat = coords.lat;
      lon = coords.lon;
    } catch (error) {
      return res.status(400).json({ message: 'Dirección no válida o no encontrada' });
    }

    const housing = await prisma.housing.create({
      data: {
        title,
        description,
        address,
        latitude: lat,
        longitude: lon,
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
