import { Request, Response } from 'express';
import { prismaMock } from '../singleton';
import { createHousing, getHousing, updateHousing, deleteHousing, listHousing, isRecentHousing } from '../controllers/housingController';


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

test('should return true if housing was created in the past half hour', async () => {
  // Current time for the test
  const now = new Date();
  // Housing created 15 minutes ago
  const createdAt = new Date(now.getTime() - 15 * 60 * 1000);

  const req = {
    params: { id: '1' }
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.housing.findUnique.mockResolvedValue({
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
    available: true,
    createdAt: createdAt,
    updatedAt: createdAt,
  });

  await isRecentHousing(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(200);
  expect(mockResponse.json).toHaveBeenCalledWith({
    isRecent: true
  });
});

test('should return false if housing was created more than half hour ago', async () => {
  // Current time for the test
  const now = new Date();
  // Housing created 45 minutes ago
  const createdAt = new Date(now.getTime() - 45 * 60 * 1000);

  const req = {
    params: { id: '1' }
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.housing.findUnique.mockResolvedValue({
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
    available: true,
    createdAt: createdAt,
    updatedAt: createdAt,
  });

  await isRecentHousing(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(200);
  expect(mockResponse.json).toHaveBeenCalledWith({
    isRecent: false
  });
});

test('should return 404 if housing not found when checking if recent', async () => {
  const req = {
    params: { id: '999' }
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.housing.findUnique.mockResolvedValue(null);

  await isRecentHousing(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(404);
  expect(mockResponse.json).toHaveBeenCalledWith({
    message: 'Housing not found'
  });
});