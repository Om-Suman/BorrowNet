import { z } from "zod";

export const transactionIdParamSchema = z.object({ id: z.string().uuid() });
export const listTransactionsQuerySchema = z.object({
  role: z.enum(["borrower", "lender"]).optional(),
  status: z.enum(["APPROVED", "HANDOVER_PENDING", "ACTIVE", "RETURN_PENDING", "RETURNED", "COMPLETED", "OVERDUE", "DISPUTED", "CANCELLED"]).optional(),
});
