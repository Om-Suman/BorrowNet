import { prisma } from "../../core/prisma.js";
import { ConflictException, NotFoundException } from "../../core/errors.js";

export async function listReports() {
  return prisma.report.findMany({
    where: { status: "PENDING" },
    include: { reporter: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function updateReport(reportId, status) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new NotFoundException("Report", reportId);
  if (report.status !== "PENDING") throw new ConflictException("This report has already been reviewed.", "REPORT_ALREADY_REVIEWED");
  return prisma.report.update({ where: { id: reportId }, data: { status }, include: { reporter: { select: { id: true, name: true } } } });
}

export async function updateUserStatus(userId, isSuspended) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!user) throw new NotFoundException("User", userId);
  if (user.role === "ADMIN" && isSuspended) throw new ConflictException("Administrator accounts cannot be suspended through this endpoint.");
  return prisma.user.update({ where: { id: userId }, data: { isSuspended }, select: { id: true, name: true, isSuspended: true, updatedAt: true } });
}

export async function updateItemStatus(itemId, status) {
  const item = await prisma.item.findUnique({ where: { id: itemId }, select: { id: true } });
  if (!item) throw new NotFoundException("Item", itemId);
  return prisma.item.update({ where: { id: itemId }, data: { status }, include: { category: true, images: { orderBy: { order: "asc" } } } });
}
