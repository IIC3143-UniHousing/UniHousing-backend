import { Request, Response } from 'express';
import { prismaMock } from '../singleton';
import { createReview, getReview, updateReview, deleteReview, listReviews } from '../controllers/reviewController';

test('should create a new review with valid data', async () => {
  const req = {
    body: {
      userId: 1,
      housingId: 2,
      score: 4,
      comment: 'Great place to live!'
    },
  } as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  // Mock user and housing existence checks
  prismaMock.user.findUnique.mockResolvedValue({
    id: 1,
    name: 'Test User',
    email: 'user@test.com',
    auth0Id: 'auth0|123',
    type: 'estudiante',
    createdAt: new Date()
  });

  prismaMock.housing.findUnique.mockResolvedValue({
    id: 2,
    title: 'Test Housing',
    description: 'Nice place',
    address: 'Av. Vicuña Mackenna 4860',
    price: 1000,
    rooms: 2,
    bathrooms: 1,
    size: 100,
    images: ['image.jpg'],
    ownerId: 3,
    available: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // No existing review for this user/housing
  prismaMock.review.findFirst.mockResolvedValue(null);

  // Mock the create function
  prismaMock.review.create.mockResolvedValue({
    id: 1,
    userId: 1,
    housingId: 2,
    score: 4,
    comment: 'Great place to live!',
    date: new Date()
  });

  await createReview(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(201);
  expect(mockResponse.json).toHaveBeenCalledWith({
    review: {
      id: 1,
      userId: 1,
      housingId: 2,
      score: 4,
      comment: 'Great place to live!',
      date: expect.any(Date)
    },
  });
});

test('should reject review with invalid score', async () => {
  const req = {
    body: {
      userId: 1,
      housingId: 2,
      score: 6, // Invalid score (should be 1-5)
      comment: 'Great place to live!'
    },
  } as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  await createReview(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(400);
  expect(mockResponse.json).toHaveBeenCalledWith({
    message: 'Score must be between 1 and 5'
  });
});

test('should reject review if user already reviewed housing', async () => {
  const req = {
    body: {
      userId: 1,
      housingId: 2,
      score: 4,
      comment: 'Great place to live!'
    },
  } as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  // Mock user and housing existence checks
  prismaMock.user.findUnique.mockResolvedValue({
    id: 1,
    name: 'Test User',
    email: 'user@test.com',
    auth0Id: 'auth0|123',
    type: 'estudiante',
    createdAt: new Date()
  });

  prismaMock.housing.findUnique.mockResolvedValue({
    id: 2,
    title: 'Test Housing',
    description: 'Nice place',
    address: 'Av. Vicuña Mackenna 4860',
    price: 1000,
    rooms: 2,
    bathrooms: 1,
    size: 100,
    images: ['image.jpg'],
    ownerId: 3,
    available: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Existing review found
  prismaMock.review.findFirst.mockResolvedValue({
    id: 1,
    userId: 1,
    housingId: 2,
    score: 3,
    comment: 'Existing review',
    date: new Date()
  });

  await createReview(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(400);
  expect(mockResponse.json).toHaveBeenCalledWith({
    message: 'You have already reviewed this housing'
  });
});

test('should not create a new review with invalid user', async () => {
  const req = {
    body: {
      userId: 2,
      housingId: 2,
      score: 4,
      comment: 'Great place to live!'
    },
  } as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  // No existing user
  prismaMock.user.findUnique.mockResolvedValue(null);

  prismaMock.housing.findUnique.mockResolvedValue({
    id: 2,
    title: 'Test Housing',
    description: 'Nice place',
    address: 'Av. Vicuña Mackenna 4860',
    price: 1000,
    rooms: 2,
    bathrooms: 1,
    size: 100,
    images: ['image.jpg'],
    ownerId: 3,
    available: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // No existing review for this user/housing
  prismaMock.review.findFirst.mockResolvedValue(null);

  // Mock the create function
  prismaMock.review.create.mockResolvedValue({
    id: 1,
    userId: 2,
    housingId: 2,
    score: 4,
    comment: 'Great place to live!',
    date: new Date()
  });

  await createReview(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(400);
  expect(mockResponse.json).toHaveBeenCalledWith({
    message: 'Invalid user'
  });
});

test('should not create a review to a home that does not exist', async () => {
  const req = {
    body: {
      userId: 1,
      housingId: 3,
      score: 4,
      comment: 'Great place to live!'
    },
  } as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  // Mock user and housing existence checks
  prismaMock.user.findUnique.mockResolvedValue({
    id: 1,
    name: 'Test User',
    email: 'user@test.com',
    auth0Id: 'auth0|123',
    type: 'estudiante',
    createdAt: new Date()
  });

  prismaMock.housing.findUnique.mockResolvedValue(null);

  // No existing review for this user/housing
  prismaMock.review.findFirst.mockResolvedValue(null);

  // Mock the create function
  prismaMock.review.create.mockResolvedValue({
    id: 1,
    userId: 1,
    housingId: 3,
    score: 4,
    comment: 'Great place to live!',
    date: new Date()
  });

  await createReview(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(400);
  expect(mockResponse.json).toHaveBeenCalledWith({
    message: 'Invalid housing'
  });
});

test('should get a review by id', async () => {
  const req = {
    params: { id: '1' }
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const mockReview = {
    id: 1,
    userId: 1,
    housingId: 2,
    score: 4,
    comment: 'Great place to live!',
    date: new Date(),
    user: {
      id: 1,
      name: 'Test User',
      email: 'user@test.com'
    },
    housing: {
      id: 2,
      title: 'Test Housing',
      address: 'Av. Vicuña Mackenna 4860'
    }
  };

  prismaMock.review.findUnique.mockResolvedValue(mockReview);

  await getReview(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(200);
  expect(mockResponse.json).toHaveBeenCalledWith({ review: mockReview });
});

test('should return 404 when review not found', async () => {
  const req = {
    params: { id: '999' }
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.review.findUnique.mockResolvedValue(null);

  await getReview(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(404);
  expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Review not found' });
});

test('should update a review if user is the author', async () => {
  const req = {
    params: { id: '1' },
    body: {
      userId: 1,
      score: 5,
      comment: 'Updated comment'
    }
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  // Existing review with same userId
  prismaMock.review.findUnique.mockResolvedValue({
    id: 1,
    userId: 1,
    housingId: 2,
    score: 3,
    comment: 'Original comment',
    date: new Date()
  });

  // Updated review
  prismaMock.review.update.mockResolvedValue({
    id: 1,
    userId: 1,
    housingId: 2,
    score: 5,
    comment: 'Updated comment',
    date: new Date()
  });

  await updateReview(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(200);
  expect(mockResponse.json).toHaveBeenCalledWith({
    review: {
      id: 1,
      userId: 1,
      housingId: 2,
      score: 5,
      comment: 'Updated comment',
      date: expect.any(Date)
    }
  });
});

test('should reject update if user is not the author', async () => {
  const req = {
    params: { id: '1' },
    body: {
      userId: 2, // Different from the review author
      score: 5,
      comment: 'Updated comment'
    }
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  // Existing review with different userId
  prismaMock.review.findUnique.mockResolvedValue({
    id: 1,
    userId: 1, // Original author is user 1
    housingId: 2,
    score: 3,
    comment: 'Original comment',
    date: new Date()
  });

  await updateReview(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(403);
  expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized' });
});

test('should reject update if score is more than 5', async () => {
  const req = {
    params: { id: '1' },
    body: {
      userId: 1,
      score: 6,
      comment: 'Updated comment'
    }
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.review.findUnique.mockResolvedValue({
    id: 1,
    userId: 1,
    housingId: 2,
    score: 3,
    comment: 'Original comment',
    date: new Date()
  });

  await updateReview(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(400);
  expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Score must be between 1 and 5' });
});

test('should reject update to a review that does not exist', async () => {
  const req = {
    params: { id: '1' },
    body: {
      userId: 1,
      score: 5,
      comment: 'Updated comment'
    }
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.review.findUnique.mockResolvedValue(null);

  await updateReview(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(404);
  expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Review not found' });
});

test('should delete a review if user is the author', async () => {
  const req = {
    params: { id: '1' },
    body: {
      userId: 1
    }
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  } as unknown as Response;

  // Existing review with same userId
  prismaMock.review.findUnique.mockResolvedValue({
    id: 1,
    userId: 1,
    housingId: 2,
    score: 4,
    comment: 'Great review',
    date: new Date()
  });

  await deleteReview(req, mockResponse);

  expect(prismaMock.review.delete).toHaveBeenCalledWith({
    where: { id: 1 }
  });
  expect(mockResponse.status).toHaveBeenCalledWith(204);
});

test('should not delete a review that does not exist', async () => {
  const req = {
    params: { id: '1' },
    body: {
      userId: 1
    }
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.review.findUnique.mockResolvedValue(null);

  await deleteReview(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(404);
  expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Review not found' });
});

test('should not delete a review if user is not the author', async () => {
  const req = {
    params: { id: '1' },
    body: {
      userId: 2
    }
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  prismaMock.review.findUnique.mockResolvedValue({
    id: 1,
    userId: 1,
    housingId: 2,
    score: 4,
    comment: 'Great review',
    date: new Date()
  });

  await deleteReview(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(403);
  expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized' });
});

test('should list reviews filtered by housingId', async () => {
  const req = {
    query: {
      housingId: '2'
    }
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const mockReviews = [
    {
      id: 1,
      userId: 1,
      housingId: 2,
      score: 4,
      comment: 'Review 1',
      date: new Date(),
      user: {
        id: 1,
        name: 'User 1',
        email: 'user1@test.com'
      },
      housing: {
        id: 2,
        title: 'Housing 2',
        address: 'Address 2'
      }
    },
    {
      id: 2,
      userId: 3,
      housingId: 2,
      score: 5,
      comment: 'Review 2',
      date: new Date(),
      user: {
        id: 3,
        name: 'User 3',
        email: 'user3@test.com'
      },
      housing: {
        id: 2,
        title: 'Housing 2',
        address: 'Address 2'
      }
    }
  ];

  prismaMock.review.findMany.mockResolvedValue(mockReviews);

  await listReviews(req, mockResponse);

  expect(mockResponse.status).toHaveBeenCalledWith(200);
  expect(mockResponse.json).toHaveBeenCalledWith({ reviews: mockReviews });
  expect(prismaMock.review.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { housingId: 2 }
    })
  );
});
