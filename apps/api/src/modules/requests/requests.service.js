import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../../core/prisma.js";
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "../../core/errors.js";

const requestInclude = {
  item: { include: { images: { orderBy: { order: "asc" } }, category: true } },
  borrower: { select: { id: true, name: true, avatarUrl: true, reputationScore: true } },
};

function durationInDays(startDate, endDate) {
  return Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
}

async function assertAvailable(tx, itemId, startDate, endDate) {
  const [blocked, conflict] = await Promise.all([
    tx.availability.findFirst({
      where: { itemId, isBlocked: true, startDate: { lt: endDate }, endDate: { gt: startDate } },
      select: { id: true },
    }),
    tx.transaction.findFirst({
      where: {
        itemId,
        status: { notIn: ["CANCELLED", "COMPLETED"] },
        scheduledPickupAt: { lt: endDate },
        scheduledReturnAt: { gt: startDate },
      },
      select: { id: true },
    }),
  ]);
  if (blocked || conflict) {
    throw new ConflictException("The item is unavailable for the selected dates.", "DATES_UNAVAILABLE");
  }
}

export async function createRequest(itemId, borrowerId, data) {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (startDate < today) throw new BadRequestException("startDate cannot be in the past.");

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item || item.status !== "ACTIVE") throw new NotFoundException("Item", itemId);
  if (item.ownerId === borrowerId) throw new BadRequestException("You cannot request your own item.");
  const totalDays = durationInDays(startDate, endDate);
  if (totalDays < item.minDays || totalDays > item.maxDays) {
    throw new BadRequestException(`Rental duration must be between ${item.minDays} and ${item.maxDays} days.`);
  }
  await assertAvailable(prisma, itemId, startDate, endDate);

  const request = await prisma.borrowRequest.create({
    data: {
      itemId,
      borrowerId,
      startDate,
      endDate,
      totalDays,
      rentTotal: Number(item.pricePerDay) * totalDays,
      estimatedDeposit: item.depositValue,
      note: data.note || null,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
    include: requestInclude,
  });
  return request;
}

export async function listRequests(userId, { role = "borrower", status } = {}) {
  const where = role === "lender"
    ? { item: { ownerId: userId }, ...(status && { status }) }
    : { borrowerId: userId, ...(status && { status }) };
  return prisma.borrowRequest.findMany({ where, include: requestInclude, orderBy: { createdAt: "desc" } });
}

export async function getRequest(requestId, userId) {
  const request = await prisma.borrowRequest.findUnique({ where: { id: requestId }, include: requestInclude });
  if (!request) throw new NotFoundException("Request", requestId);
  if (request.borrowerId !== userId && request.item.ownerId !== userId) {
    throw new ForbiddenException("Only request participants can view this request.");
  }
  return request;
}

async function ownedPendingRequest(tx, requestId, lenderId) {
  const request = await tx.borrowRequest.findUnique({ where: { id: requestId }, include: { item: true } });
  if (!request) throw new NotFoundException("Request", requestId);
  if (request.item.ownerId !== lenderId) throw new ForbiddenException("Only the item owner can manage this request.");
  if (request.status !== "PENDING") throw new ConflictException("This request is no longer pending.", "REQUEST_NOT_PENDING");
  return request;
}

export async function approveRequest(requestId, lenderId) {
  const result = await prisma.$transaction(async (tx) => {
    const request = await tx.borrowRequest.findUnique({ where: { id: requestId }, select: { itemId: true } });
    if (!request) throw new NotFoundException("Request", requestId);
    // All approvals for an item take this PostgreSQL transaction-scoped lock before checking dates.
    await tx.$queryRaw(Prisma.sql`WITH lock AS MATERIALIZED (SELECT pg_advisory_xact_lock(hashtext(${request.itemId}))) SELECT 1 FROM lock`);
    const pending = await ownedPendingRequest(tx, requestId, lenderId);
    if (pending.expiresAt <= new Date()) {
      await tx.borrowRequest.update({ where: { id: requestId }, data: { status: "EXPIRED" } });
      return { expired: true };
    }
    const item = await tx.item.findUnique({ where: { id: pending.itemId } });
    if (!item || item.status !== "ACTIVE") throw new ConflictException("This item is no longer available.", "ITEM_UNAVAILABLE");
    await assertAvailable(tx, pending.itemId, pending.startDate, pending.endDate);

    const claimed = await tx.borrowRequest.updateMany({ where: { id: requestId, status: "PENDING" }, data: { status: "APPROVED" } });
    if (claimed.count !== 1) throw new ConflictException("This request is no longer pending.", "REQUEST_NOT_PENDING");
    const approved = await tx.borrowRequest.findUnique({ where: { id: requestId }, include: requestInclude });
    const transaction = await tx.transaction.create({
      data: {
        requestId,
        itemId: pending.itemId,
        lenderId,
        borrowerId: pending.borrowerId,
        status: "APPROVED",
        pickupHandoverSecret: crypto.randomBytes(32).toString("hex"),
        returnHandoverSecret: crypto.randomBytes(32).toString("hex"),
        scheduledPickupAt: pending.startDate,
        scheduledReturnAt: pending.endDate,
        depositValue: pending.estimatedDeposit,
        rentTotal: pending.rentTotal,
      },
    });
    await tx.borrowRequest.updateMany({
      where: {
        itemId: pending.itemId,
        id: { not: requestId },
        status: "PENDING",
        startDate: { lt: pending.endDate },
        endDate: { gt: pending.startDate },
      },
      data: { status: "REJECTED" },
    });
    return { request: approved, transaction: { ...transaction, pickupHandoverSecret: undefined, returnHandoverSecret: undefined } };
  });
  if (result.expired) throw new ConflictException("This request has expired.", "REQUEST_EXPIRED");
  return result;
}

export async function rejectRequest(requestId, lenderId, reason) {
  return prisma.$transaction(async (tx) => {
    const request = await ownedPendingRequest(tx, requestId, lenderId);
    const claimed = await tx.borrowRequest.updateMany({ where: { id: request.id, status: "PENDING" }, data: { status: "REJECTED", rejectionReason: reason || null } });
    if (claimed.count !== 1) throw new ConflictException("This request is no longer pending.", "REQUEST_NOT_PENDING");
    return tx.borrowRequest.findUnique({ where: { id: request.id }, include: requestInclude });
  });
}

export async function cancelRequest(requestId, borrowerId) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.borrowRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException("Request", requestId);
    if (request.borrowerId !== borrowerId) throw new ForbiddenException("Only the borrower can cancel this request.");
    if (request.status !== "PENDING") throw new ConflictException("Only pending requests can be cancelled.", "REQUEST_NOT_PENDING");
    const claimed = await tx.borrowRequest.updateMany({ where: { id: requestId, status: "PENDING" }, data: { status: "CANCELLED" } });
    if (claimed.count !== 1) throw new ConflictException("Only pending requests can be cancelled.", "REQUEST_NOT_PENDING");
    return tx.borrowRequest.findUnique({ where: { id: requestId }, include: requestInclude });
  });
}
