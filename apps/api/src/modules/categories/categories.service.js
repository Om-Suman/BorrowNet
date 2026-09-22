import { prisma } from '../../core/prisma.js';
import { getRedis } from '../../core/redis.js';
import { NotFoundException } from '../../core/errors.js';

export async function listCategories() {
  const redis = getRedis();
  
  if (redis) {
    const cached = await redis.get('categories:all');
    if (cached) return JSON.parse(cached);
  }

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          items: { where: { status: 'ACTIVE' } }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  if (redis) {
    await redis.setex('categories:all', 300, JSON.stringify(categories));
  }

  return categories;
}

export async function getCategoryBySlug(slug) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);
  
  const category = await prisma.category.findFirst({
    where: isUuid ? { id: slug } : { slug },
    include: {
      _count: {
        select: {
          items: { where: { status: 'ACTIVE' } }
        }
      }
    }
  });

  if (!category) {
    throw new NotFoundException('Category', slug);
  }

  return category;
}
