import { Request, Response } from 'express';
import { prismaMock } from '../singleton';
import { createHousing, getHousing, updateHousing, deleteHousing, listHousing, isRecentHousing } from '../controllers/housingController';


test('should create a new housing if user is propietario', async () => {
  const housing = {
    body: {
      title: 'Test Housing',
      description: 'Test Description',
      address: 'Av. Vicuña Mackenna 4860',
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
    address: 'Av. Vicuña Mackenna 4860',
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
      address: 'Av. Vicuña Mackenna 4860',
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
      address: 'Av. Vicuña Mackenna 4860',
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
    address: 'Av. Vicuña Mackenna 4860',
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
    address: 'Av. Vicuña Mackenna 4860',
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

test('should not create a new housing if address is not valid', async () => {
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

  expect(mockResponse.status).toHaveBeenCalledWith(400);
  expect(mockResponse.json).toHaveBeenCalledWith({
    message: 'Dirección no válida o no encontrada'
  });
});

test('should get housing if it exists', async () => {
  const housing = {
    params: {
      id: 1
    },
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.housing.findUnique.mockResolvedValue({
    id: 1,
    title: 'Test Housing',
    description: 'Test Description',
    address: 'Av. Vicuña Mackenna 4860',
    price: 1000,
    rooms: 1,
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

  await getHousing(housing, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(200);
  expect(mockResponse.json).toHaveBeenCalledWith({
    housing: {
      id: 1,
      title: 'Test Housing',
      description: 'Test Description',
      address: 'Av. Vicuña Mackenna 4860',
      price: 1000,
      rooms: 1,
      bathrooms: 1,
      size: 100,
      images: ['test.jpg'],
      ownerId: 1,
      createdAt: expect.any(Date),
    },
  });
});

test('should not get housing if it does not exist', async () => {
  const housing = {
    params: {
      id: 2
    },
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  await getHousing(housing, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(404);
  expect(mockResponse.json).toHaveBeenCalledWith({
    message: 'Housing not found'
  });
});

test('should update housing if it exists', async () => {
  const housing = {
    body: {
      title: 'Test Housing',
      description: 'Test Description',
      address: 'Av. Vicuña Mackenna 4860',
      price: 1000,
      rooms: 2,
      bathrooms: 1,
      size: 100,
      images: ['test.jpg'],
      available: false,
      ownerId: 1,
    },
    params: {
      id: 1
    },
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.housing.findUnique.mockResolvedValue({
    id: 1,
    title: 'Test Housing',
    description: 'Test Description',
    address: 'Av. Vicuña Mackenna 4860',
    price: 1000,
    rooms: 2,
    bathrooms: 1,
    size: 100,
    images: ['test.jpg'],
    available: true,
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

  await updateHousing(housing, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(200);
});

test('should not update housing if it does not exist', async () => {
  const housing = {
    body: {
      title: 'Test Housing 2',
      description: 'Test Description 2',
      address: 'Av. Vicuña Mackenna 4860',
      price: 5000,
      rooms: 5,
      bathrooms: 1,
      size: 400,
      images: ['test2.jpg'],
      available: false,
      ownerId: 1,
    },
    params: {
      id: 2
    },
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  await updateHousing(housing, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(404);
  expect(mockResponse.json).toHaveBeenCalledWith({
    message: 'Housing not found'
  });
});

test('should not update housing if it does not belong to owner', async () => {
  const housing = {
    body: {
      title: 'Test Housing',
      description: 'Test Description',
      address: 'Av. Vicuña Mackenna 4860',
      price: 1000,
      rooms: 2,
      bathrooms: 1,
      size: 100,
      images: ['test.jpg'],
      available: false,
      ownerId: 2,
    },
    params: {
      id: 1
    },
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.housing.findUnique.mockResolvedValue({
    id: 1,
    title: 'Test Housing',
    description: 'Test Description',
    address: 'Av. Vicuña Mackenna 4860',
    price: 1000,
    rooms: 2,
    bathrooms: 1,
    size: 100,
    images: ['test.jpg'],
    available: true,
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

  await updateHousing(housing, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(403);
  expect(mockResponse.json).toHaveBeenCalledWith({
    message: 'Not authorized'
  });
});

test('should delete housing if it exists and user is propietario', async () => {
  const housing = {
    body: {
      title: 'Test Housing',
      description: 'Test Description',
      address: 'Av. Vicuña Mackenna 4860',
      price: 1000,
      rooms: 2,
      bathrooms: 1,
      size: 100,
      images: ['test.jpg'],
      ownerId: 1,
    },
    params: {
      id: 1
    }
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  } as unknown as Response;

  prismaMock.housing.findUnique.mockResolvedValue({
    id: 1,
    title: 'Test Housing',
    description: 'Test Description',
    address: 'Av. Vicuña Mackenna 4860',
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

  await deleteHousing(housing, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(204);
});

test('should not delete housing if user is not propietario', async () => {
  const housing = {
    body: {
      title: 'Test Housing',
      description: 'Test Description',
      address: 'Av. Vicuña Mackenna 4860',
      price: 1000,
      rooms: 2,
      bathrooms: 1,
      size: 100,
      images: ['test.jpg'],
      ownerId: 2,
    },
    params: {
      id: 1
    }
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.housing.findUnique.mockResolvedValue({
    id: 1,
    title: 'Test Housing',
    description: 'Test Description',
    address: 'Av. Vicuña Mackenna 4860',
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

  await deleteHousing(housing, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(403);
  expect(mockResponse.json).toHaveBeenCalledWith({
    message: 'Not authorized'
  });
});

test('should not delete housing if it does not exist', async () => {
  const housing = {
    body: {
      title: 'Test Housing',
      description: 'Test Description',
      address: 'Av. Vicuña Mackenna 4860',
      price: 1000,
      rooms: 2,
      bathrooms: 1,
      size: 100,
      images: ['test.jpg'],
      ownerId: 1,
    },
    params: {
      id: 1
    }
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  await deleteHousing(housing, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(404);
  expect(mockResponse.json).toHaveBeenCalledWith({
    message: 'Housing not found'
  });
});

test('should list all housing when no filter is applied', async () => {
  const req = {
    query: {},
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.housing.findMany.mockResolvedValue([
    {
      id: 1,
      title: 'Test House',
      available: true,
      createdAt: new Date(),
      owner: {
        id: 1,
        name: 'Test Owner',
        email: 'owner@example.com',
      },
    },
  ]);

  await listHousing(req, res);

  expect(prismaMock.housing.findMany).toHaveBeenCalledWith({
    where: {},
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    housing: expect.any(Array),
  });
});

test('should filter housing by available=true', async () => {
  const req = {
    query: {
      available: 'true',
    },
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.housing.findMany.mockResolvedValue([
    {
      id: 1,
      title: 'Available House',
      available: true,
      createdAt: new Date(),
      owner: {
        id: 1,
        name: 'Owner',
        email: 'owner@example.com',
      },
    },
  ]);

  await listHousing(req, res);

  expect(prismaMock.housing.findMany).toHaveBeenCalledWith({
    where: { available: true },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    housing: expect.any(Array),
  });
});
