import { prisma } from '../../core/prisma.js';
import { NotFoundException } from '../../core/errors.js';

let cachedCategories = null;
let cacheExpiresAt = 0;

export async function listCategories() {
  const now = Date.now();
  if (cachedCategories && now < cacheExpiresAt) {
    return cachedCategories;
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

  cachedCategories = categories;
  cacheExpiresAt = now + 5 * 60 * 1000; // 5 minutes cache

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
