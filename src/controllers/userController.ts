import { Request, Response } from 'express';
import prisma from '../prisma';
import { UserType } from '../generated/prisma';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name, auth0Id, type } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { auth0Id }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    if (!email.endsWith('@uc.cl') && type !== 'propietario') {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        auth0Id,
        type: type as UserType
      }
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};


export const updateUser = async (req: Request, res: Response) => {
  try {
    const { auth0Id } = req.body;
    const { email, name, type } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { auth0Id }
    });

    if (!existingUser) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    const user = await prisma.user.update({
      where: { auth0Id },
      data: {
        email,
        name,
        type: type as UserType
      }
    });

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { auth0Id } = req.body;

    const user = await prisma.user.findUnique({
      where: { auth0Id }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};