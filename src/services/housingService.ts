import prisma from '../prisma';

interface HousingFilter {
    available: boolean;
    minPrice?: number;
    maxPrice?: number;
    minRooms?: number;
    maxRooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    address?: string
}

export const filterHousing = async (filters: HousingFilter) => {
    const {
        available,
        minPrice,
        maxPrice,
        minRooms,
        maxRooms,
        minBathrooms,
        maxBathrooms,
        address
    } = filters;

    const where: any = {};

    if (available !== undefined) {
      where.available = available;
    }

    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice && { gte: minPrice }),
        ...(maxPrice && { lte: maxPrice }),
      };
    }

    if (minRooms || maxRooms) {
      where.rooms = {
        ...(minRooms && { gte: minRooms }),
        ...(maxRooms && { lte: maxRooms }),
      };
    }

    if (minBathrooms || maxBathrooms) {
      where.bathrooms = {
        ...(minBathrooms && { gte: minBathrooms }),
        ...(maxBathrooms && { lte: maxBathrooms }),
      };
    }

    if (address) {
        where.address = {
            contains: address,
            mode: 'insensitive'
        };
    }

    return prisma.housing.findMany({
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
};

export default {
    filterHousing,
};