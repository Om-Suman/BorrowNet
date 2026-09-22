import { prisma } from "../../core/prisma.js";
import { NotFoundException } from "../../core/errors.js";

export async function listItems({
  q,
  category,
  condition,
  page = 1,
  limit = 20,
} = {}) {
  const where = {
    status: "ACTIVE",
  };

  if (category) {
    where.category = {
      slug: category,
    };
  }

  if (condition) {
    where.condition = condition;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      skip,
      take: limit,
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            reputationScore: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.item.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getItemById(id) {
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
      category: true,
      owner: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          bio: true,
          location: true,
          reputationScore: true,
          isVerified: true,
          createdAt: true,
        },
      },
    },
  });

  if (!item || item.status === "REMOVED") {
    throw new NotFoundException("Item", id);
  }

  return item;
}
