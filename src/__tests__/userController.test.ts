import { Request, Response } from 'express';
import { createUser, updateUser } from '../controllers/userController';
import { prismaMock } from '../singleton';
import axios from 'axios';

jest.mock('axios');

test('should create a new user', async () => {
  process.env.AUTH0_DOMAIN = 'auth0.mockdomain.com';

  const user = {
    body: {
      email: 'test@uc.cl',
      name: 'Test User',
      auth0Id: 'auth0|123',
      type: 'estudiante',
    },
  } as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  (axios.post as jest.Mock).mockResolvedValue({
    data: {
      user_id: 'auth0|123',
    },
  });

  prismaMock.user.findUnique.mockResolvedValue(null);
  prismaMock.user.create.mockResolvedValue({
    id: 1,
    name: 'Test User',
    email: 'test@uc.cl',
    auth0Id: 'auth0|123',
    type: 'estudiante',
    createdAt: new Date(),
  });

  await createUser(user, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(201);
  expect(mockResponse.json).toHaveBeenCalledWith({
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@uc.cl',
      auth0Id: 'auth0|123',
      type: 'estudiante',
      createdAt: expect.any(Date),
    },
  });
});

// test('should return error if user exists', async () => {
//   const user = {
//     body: {
//       email: 'test@uc.cl',
//       name: 'Test User',
//       auth0Id: 'auth0|123',
//       type: 'estudiante',
//     },
//   } as Request;

//   const mockResponse = {
//     status: jest.fn().mockReturnThis(),
//     json: jest.fn(),
//   } as unknown as Response;

//   prismaMock.user.findUnique.mockResolvedValue({
//     id: 1,
//     name: 'Test User',
//     email: 'test@uc.cl',
//     auth0Id: 'auth0|123',
//     type: 'estudiante',
//   });

//   await createUser(user, mockResponse);

//   expect(mockResponse.status).toHaveBeenCalledWith(400);
//   expect(mockResponse.json).toHaveBeenCalledWith({
//     message: 'User already exists',
//   });
// });

test('should return error if email is not from uc.cl and user is student', async () => {
  const user = {
    body: {
      email: 'test@example.com',
      name: 'Test User',
      auth0Id: 'auth0|123',
      type: 'estudiante',
    },
  } as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  await createUser(user, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(400);
  expect(mockResponse.json).toHaveBeenCalledWith({
    error: 'Correo electrónico no autorizado para estudiante, debes ingresar un correo UC.', // userController.ts, line 18
  });
});

test('should update user', async () => {
  const user = {
    body: {
      auth0Id: 'auth0|123',
      email: 'test@uc.cl',
      name: 'Test User',
      type: 'estudiante',
    },
  } as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.user.findUnique.mockResolvedValue({
    id: 1,
    name: 'Test User',
    email: 'test@uc.cl',
    auth0Id: 'auth0|123',
    type: 'estudiante',
  });

  prismaMock.user.update.mockResolvedValue({
    id: 1,
    name: 'Test User',
    email: 'test@uc.cl',
    auth0Id: 'auth0|123',
    type: 'estudiante',
  });

  await updateUser(user, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(200);
  expect(mockResponse.json).toHaveBeenCalledWith({
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@uc.cl',
      auth0Id: 'auth0|123',
      type: 'estudiante',
    },
  });
});

test('should return error if user to update does not exist', async () => {
  const user = {
    body: {
      auth0Id: 'auth0|123',
      email: 'test@uc.cl',
      name: 'Test User',
      type: 'estudiante',
    },
  } as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.user.findUnique.mockResolvedValue(null);

  await updateUser(user, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(400);
  expect(mockResponse.json).toHaveBeenCalledWith({
    error: 'El usuario no existe.', // userController.ts, line 122
  });
});