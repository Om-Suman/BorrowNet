import { prisma } from '../../core/prisma.js';
import { NotFoundException } from '../../core/errors.js';

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      bio: true,
      location: true,
      reputationScore: true,
      isVerified: true,
      isSuspended: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new NotFoundException('User', userId);
  }

  return user;
}

export async function updateProfile(userId, data) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      bio: true,
      location: true,
      reputationScore: true,
      isVerified: true,
      isSuspended: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return user;
}

export async function getPublicProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      bio: true,
      location: true,
      reputationScore: true,
      isVerified: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          items: { where: { status: 'ACTIVE' } },
          reviewsReceived: true
        }
      }
    }
  });

  if (!user) {
    throw new NotFoundException('User', userId);
  }

  return user;
}

export async function getUserItems(userId) {
  const items = await prisma.item.findMany({
    where: { ownerId: userId },
    include: {
      images: true,
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return {
    items,
    meta: { page: 1, limit: items.length, total: items.length, totalPages: 1 },
  };
}
