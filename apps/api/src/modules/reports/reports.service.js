import { prisma } from "../../core/prisma.js";
import { NotFoundException } from "../../core/errors.js";

export async function createReport(reporterId, data) {
  const target = data.targetType === "ITEM"
    ? await prisma.item.findUnique({ where: { id: data.targetId }, select: { id: true } })
    : await prisma.user.findUnique({ where: { id: data.targetId }, select: { id: true } });
  if (!target) throw new NotFoundException(data.targetType === "ITEM" ? "Item" : "User", data.targetId);
  return prisma.report.create({ data: { reporterId, ...data }, include: { reporter: { select: { id: true, name: true } } } });
}
