import { prisma } from "../../core/prisma.js";
import { NotFoundException } from "../../core/errors.js";
import { relatedRecommendations } from "./recommendations.client.js";

const cardInclude = {
  images: { orderBy: { order: "asc" }, take: 1 },
  category: true,
  owner: { select: { id: true, name: true, avatarUrl: true, reputationScore: true, location: true } },
};

export async function getRelatedItems({ itemId, q, limit = 6 }) {
  if (itemId) {
    const anchor = await prisma.item.findUnique({ where: { id: itemId }, select: { id: true, status: true } });
    if (!anchor || anchor.status === "REMOVED") throw new NotFoundException("Item", itemId);
  }
  const result = await relatedRecommendations({ itemId, q, limit });
  const ids = result.items.map(({ id }) => id);
  if (ids.length === 0) return [];
  const items = await prisma.item.findMany({ where: { id: { in: ids }, status: "ACTIVE" }, include: cardInclude });
  const byId = new Map(items.map((item) => [item.id, item]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}
