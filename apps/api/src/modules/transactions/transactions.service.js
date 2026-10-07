import { prisma } from "../../core/prisma.js";
import { ConflictException, ForbiddenException, NotFoundException } from "../../core/errors.js";

const includeDetails = {
  item: { include: { images: { orderBy: { order: "asc" } }, category: true } },
  borrower: { select: { id: true, name: true, avatarUrl: true, reputationScore: true } },
  lender: { select: { id: true, name: true, avatarUrl: true, reputationScore: true } },
  request: { select: { id: true, startDate: true, endDate: true, totalDays: true, note: true } },
  reviews: { select: { id: true, reviewerId: true } },
};
const safeSelect = {
  id: true, requestId: true, itemId: true, lenderId: true, borrowerId: true, status: true,
  scheduledPickupAt: true, scheduledReturnAt: true, actualPickupAt: true, actualReturnAt: true,
  depositValue: true, rentTotal: true, createdAt: true, updatedAt: true,
};

export async function listTransactions(userId, { role, status } = {}) {
  const participant = role === "borrower" ? { borrowerId: userId } : role === "lender" ? { lenderId: userId } : { OR: [{ borrowerId: userId }, { lenderId: userId }] };
  return prisma.transaction.findMany({
    where: { ...participant, ...(status && { status }) },
    select: { ...safeSelect, item: { select: { id: true, title: true, images: { orderBy: { order: "asc" }, take: 1 } } }, borrower: { select: { id: true, name: true, avatarUrl: true } }, lender: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTransaction(transactionId, userId) {
  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId }, select: { ...safeSelect, item: includeDetails.item, borrower: includeDetails.borrower, lender: includeDetails.lender, request: includeDetails.request, reviews: includeDetails.reviews } });
  if (!transaction) throw new NotFoundException("Transaction", transactionId);
  if (transaction.borrowerId !== userId && transaction.lenderId !== userId) throw new ForbiddenException("Only transaction participants can view this transaction.");
  const { reviews, ...details } = transaction;
  return { ...details, reviewStatus: { submitted: reviews.some((review) => review.reviewerId === userId) } };
}

export async function markReturned(transactionId, userId) {
  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!transaction) throw new NotFoundException("Transaction", transactionId);
  if (transaction.borrowerId !== userId && transaction.lenderId !== userId) throw new ForbiddenException("Only transaction participants can confirm a return.");
  if (!["APPROVED", "HANDOVER_PENDING", "ACTIVE", "OVERDUE", "RETURN_PENDING"].includes(transaction.status)) {
    throw new ConflictException("This transaction cannot be marked returned in its current state.", "INVALID_TRANSACTION_STATE");
  }
  return prisma.transaction.update({ where: { id: transactionId }, data: { status: "RETURNED", actualReturnAt: new Date() }, select: safeSelect });
}

export async function completeTransaction(transactionId, lenderId) {
  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!transaction) throw new NotFoundException("Transaction", transactionId);
  if (transaction.lenderId !== lenderId) throw new ForbiddenException("Only the lender can complete this transaction.");
  if (transaction.status !== "RETURNED") throw new ConflictException("A transaction can only be completed after the return is confirmed.", "INVALID_TRANSACTION_STATE");
  return prisma.transaction.update({ where: { id: transactionId }, data: { status: "COMPLETED" }, select: safeSelect });
}
