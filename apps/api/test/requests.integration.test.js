import { afterAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "../src/core/prisma.js";
import * as requestsService from "../src/modules/requests/requests.service.js";
import * as transactionsService from "../src/modules/transactions/transactions.service.js";
import * as reviewsService from "../src/modules/reviews/reviews.service.js";
import * as reportsService from "../src/modules/reports/reports.service.js";
import * as adminService from "../src/modules/admin/admin.service.js";

const fixtureIds = { userIds: [], requestIds: [], transactionIds: [], reportIds: [], itemId: null, categoryId: null };

async function createUser(prefix, role = "USER") {
  const user = await prisma.user.create({
    data: { email: `${prefix}-${randomUUID()}@example.test`, name: prefix, passwordHash: "integration-test-hash", role },
    select: { id: true },
  });
  fixtureIds.userIds.push(user.id);
  return user.id;
}

describe("Borrow request and transaction lifecycle (PostgreSQL)", () => {
  afterAll(async () => {
    if (fixtureIds.transactionIds.length) {
      await prisma.review.deleteMany({ where: { transactionId: { in: fixtureIds.transactionIds } } });
      await prisma.transaction.deleteMany({ where: { id: { in: fixtureIds.transactionIds } } });
    }
    if (fixtureIds.reportIds.length) await prisma.report.deleteMany({ where: { id: { in: fixtureIds.reportIds } } });
    if (fixtureIds.requestIds.length) await prisma.borrowRequest.deleteMany({ where: { id: { in: fixtureIds.requestIds } } });
    if (fixtureIds.itemId) await prisma.item.delete({ where: { id: fixtureIds.itemId } });
    if (fixtureIds.categoryId) await prisma.category.delete({ where: { id: fixtureIds.categoryId } });
    if (fixtureIds.userIds.length) await prisma.user.deleteMany({ where: { id: { in: fixtureIds.userIds } } });
  });

  it("serializes overlapping approvals and allows return, completion, and review", async () => {
    const suffix = randomUUID();
    const lenderId = await createUser("lender");
    const borrowerOneId = await createUser("borrower-one");
    const borrowerTwoId = await createUser("borrower-two");
    const category = await prisma.category.create({ data: { name: `Test ${suffix}`, slug: `test-${suffix}` } });
    fixtureIds.categoryId = category.id;
    const item = await prisma.item.create({
      data: {
        title: "Integration test item", description: "Temporary fixture used by a PostgreSQL integration test.",
        ownerId: lenderId, categoryId: category.id, pricePerDay: 10, depositValue: 20, minDays: 1, maxDays: 30,
      },
    });
    fixtureIds.itemId = item.id;
    const start = new Date();
    start.setUTCDate(start.getUTCDate() + 3);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 2);
    const range = { startDate: start.toISOString(), endDate: end.toISOString() };
    const first = await requestsService.createRequest(item.id, borrowerOneId, range);
    fixtureIds.requestIds.push(first.id);
    const second = await requestsService.createRequest(item.id, borrowerTwoId, range);
    fixtureIds.requestIds.push(second.id);

    const approvals = await Promise.allSettled([
      requestsService.approveRequest(first.id, lenderId),
      requestsService.approveRequest(second.id, lenderId),
    ]);
    expect(approvals.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(approvals.filter((result) => result.status === "rejected")).toHaveLength(1);

    const transaction = await prisma.transaction.findFirst({ where: { itemId: item.id } });
    expect(transaction).toBeTruthy();
    fixtureIds.transactionIds.push(transaction.id);
    expect(transaction.pickupHandoverSecret).toHaveLength(64);
    const returned = await transactionsService.markReturned(transaction.id, transaction.borrowerId);
    expect(returned.status).toBe("RETURNED");
    const completed = await transactionsService.completeTransaction(transaction.id, lenderId);
    expect(completed.status).toBe("COMPLETED");

    const reviewResult = await reviewsService.createReview(transaction.id, transaction.borrowerId, { rating: 5, comment: "Great item." });
    expect(reviewResult.newReputationScore).toBe(100);
    expect(reviewResult.review.revieweeId).toBe(lenderId);

    const report = await reportsService.createReport(borrowerOneId, { targetType: "ITEM", targetId: item.id, reason: "Test moderation report" });
    fixtureIds.reportIds.push(report.id);
    expect((await adminService.listReports()).some((entry) => entry.id === report.id)).toBe(true);
    expect((await adminService.updateReport(report.id, "RESOLVED")).status).toBe("RESOLVED");
    expect((await adminService.updateUserStatus(borrowerTwoId, true)).isSuspended).toBe(true);
    await adminService.updateUserStatus(borrowerTwoId, false);
    expect((await adminService.updateItemStatus(item.id, "PAUSED")).status).toBe("PAUSED");
    await adminService.updateItemStatus(item.id, "ACTIVE");
  }, 30000);
});
