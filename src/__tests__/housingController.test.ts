import { Request, Response } from 'express';
import { prismaMock } from '../singleton';
import { createHousing, getHousing, updateHousing, deleteHousing, listHousing } from '../controllers/housingController';


test('should create a new housing if user is propietario', async () => {
  const housing = {
    body: {
      title: 'Test Housing',
      description: 'Test Description',
      address: 'Test Address',
      price: 1000,
      rooms: 2,
      bathrooms: 1,
      size: 100,
      images: ['test.jpg'],
      ownerId: 1,
    },
  } as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.housing.findUnique.mockResolvedValue(null);
  prismaMock.housing.create.mockResolvedValue({
    id: 1,
    title: 'Test Housing',
    description: 'Test Description',
    address: 'Test Address',
    price: 1000,
    rooms: 2,
    bathrooms: 1,
    size: 100,
    images: ['test.jpg'],
    ownerId: 1,
    createdAt: new Date(),
  });

  prismaMock.user.findUnique.mockResolvedValue({
    id: 1,
    name: 'Test User',
    email: 'test@uc.cl',
    auth0Id: 'auth0|123',
    type: 'propietario',
  });

  await createHousing(housing, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(201);
  expect(mockResponse.json).toHaveBeenCalledWith({
    housing: {
      id: 1,
      title: 'Test Housing',
      description: 'Test Description',
      address: 'Test Address',
      price: 1000,
      rooms: 2,
      bathrooms: 1,
      size: 100,
      images: ['test.jpg'],
      ownerId: 1,
      createdAt: expect.any(Date),
    },
  });
});

test('should return error if user is not propietario', async () => {
  const housing = {
    body: {
      title: 'Test Housing',
      description: 'Test Description',
      address: 'Test Address',
      price: 1000,
      rooms: 2,
      bathrooms: 1,
      size: 100,
      images: ['test.jpg'],
      ownerId: 1,
    },
  } as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.housing.findUnique.mockResolvedValue(null);
  prismaMock.user.findUnique.mockResolvedValue({
    id: 1,
    name: 'Test User',
    email: 'test@uc.cl',
    auth0Id: 'auth0|123',
    type: 'estudiante',
  });

  await createHousing(housing, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(400);
  expect(mockResponse.json).toHaveBeenCalledWith({
    message: 'Invalid owner',
  });
});