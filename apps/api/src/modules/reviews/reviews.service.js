import { Prisma } from "@prisma/client";
import { prisma } from "../../core/prisma.js";
import { ConflictException, ForbiddenException, NotFoundException } from "../../core/errors.js";

export async function createReview(transactionId, reviewerId, data) {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) throw new NotFoundException("Transaction", transactionId);
    if (transaction.status !== "COMPLETED") throw new ConflictException("Reviews are available after transaction completion.", "TRANSACTION_NOT_COMPLETED");
    const revieweeId = transaction.borrowerId === reviewerId ? transaction.lenderId : transaction.lenderId === reviewerId ? transaction.borrowerId : null;
    if (!revieweeId) throw new ForbiddenException("Only transaction participants can review each other.");

    await tx.$queryRaw(Prisma.sql`WITH lock AS MATERIALIZED (SELECT pg_advisory_xact_lock(hashtext(${`reputation:${revieweeId}`}))) SELECT 1 FROM lock`);
    const review = await tx.review.create({
      data: { transactionId, reviewerId, revieweeId, rating: data.rating, comment: data.comment || null },
      include: { reviewer: { select: { id: true, name: true, avatarUrl: true } } },
    });
    const aggregate = await tx.review.aggregate({ where: { revieweeId }, _avg: { rating: true } });
    const newReputationScore = Math.round((aggregate._avg.rating || 0) * 20);
    await tx.user.update({ where: { id: revieweeId }, data: { reputationScore: newReputationScore } });
    return { review, newReputationScore };
  }).catch((error) => {
    if (error.code === "P2002") throw new ConflictException("You have already reviewed this transaction.", "REVIEW_ALREADY_EXISTS");
    throw error;
  });
}

export async function listUserReviews(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw new NotFoundException("User", userId);
  return prisma.review.findMany({
    where: { revieweeId: userId },
    select: { id: true, rating: true, punctualityScore: true, careScore: true, comment: true, createdAt: true, reviewer: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
  });
}
