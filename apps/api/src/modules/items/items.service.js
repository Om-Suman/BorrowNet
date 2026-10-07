import { prisma } from "../../core/prisma.js";
import { ForbiddenException, NotFoundException } from "../../core/errors.js";
import { refreshItemEmbedding, searchRecommendations } from "../recommendations/recommendations.client.js";

const itemDetails = {
  images: { orderBy: { order: "asc" } },
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
};

export async function createItem(ownerId, data) {
  const category = await prisma.category.findUnique({ where: { id: data.categoryId }, select: { id: true } });
  if (!category) throw new NotFoundException("Category", data.categoryId);

  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      condition: data.condition,
      pricePerDay: data.pricePerDay,
      rules: data.rules ?? null,
      location: data.location ?? null,
      ownerId,
      images: {
        create: data.images.map((url, order) => ({ url, order })),
      },
    },
    include: itemDetails,
  });
  await refreshEmbedding(item);
  return item;
}

async function refreshEmbedding(item) {
  const text = [item.title, item.description, item.category?.name, item.rules, item.location]
    .filter(Boolean)
    .join(". ");
  try {
    await refreshItemEmbedding(item.id, text);
  } catch {
    // Listing writes remain available while the optional model service starts or recovers.
  }
}

async function findOwnedItem(itemId, ownerId) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item || item.status === "REMOVED") {
    throw new NotFoundException("Item", itemId);
  }
  if (item.ownerId !== ownerId) {
    throw new ForbiddenException("You can only manage your own listings.");
  }
  return item;
}

export async function updateItem(itemId, ownerId, data) {
  await findOwnedItem(itemId, ownerId);
  const { images, ...fields } = data;
  if (fields.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: fields.categoryId }, select: { id: true } });
    if (!category) throw new NotFoundException("Category", fields.categoryId);
  }
  const item = await prisma.item.update({
    where: { id: itemId },
    data: {
      ...fields,
      ...(images !== undefined && {
        images: {
          deleteMany: {},
          create: images.map((url, order) => ({ url, order })),
        },
      }),
    },
    include: itemDetails,
  });
  if (["title", "description", "categoryId", "rules", "location"].some((field) => Object.hasOwn(fields, field)) || images !== undefined) {
    await refreshEmbedding(item);
  }
  return item;
}

export async function removeItem(itemId, ownerId) {
  await findOwnedItem(itemId, ownerId);
  await prisma.item.update({ where: { id: itemId }, data: { status: "REMOVED" } });
  return { message: "Item removed" };
}

export async function getItemAvailability(itemId) {
  const item = await prisma.item.findUnique({ where: { id: itemId }, select: { id: true, status: true } });
  if (!item || item.status === "REMOVED") {
    throw new NotFoundException("Item", itemId);
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      itemId,
      status: { notIn: ["CANCELLED", "COMPLETED"] },
    },
    select: { scheduledPickupAt: true, scheduledReturnAt: true },
    orderBy: { scheduledPickupAt: "asc" },
  });

  return {
    bookedRanges: transactions.map(({ scheduledPickupAt, scheduledReturnAt }) => ({
      startDate: scheduledPickupAt,
      endDate: scheduledReturnAt,
    })),
  };
}

export async function listItems({
  q,
  category,
  condition,
  page = 1,
  limit = 20,
} = {}) {
  if (q) {
    try {
      const result = await searchRecommendations({
        q,
        categorySlug: category,
        condition,
        offset: (page - 1) * limit,
        limit,
      });
      const ids = result.items.map(({ id }) => id);
      const foundItems = ids.length
        ? await prisma.item.findMany({ where: { id: { in: ids }, status: "ACTIVE" }, include: itemDetails })
        : [];
      const byId = new Map(foundItems.map((item) => [item.id, item]));
      return {
        items: ids.map((id) => byId.get(id)).filter(Boolean),
        meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) || 1 },
      };
    } catch (error) {
      if (error.status !== 503) throw error;
      // Preserve ordinary text search when the optional semantic service is unavailable.
    }
  }

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
