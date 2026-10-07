import { Router } from "express";
import * as transactionsService from "../modules/transactions/transactions.service.js";
import { listTransactionsQuerySchema, transactionIdParamSchema } from "../modules/transactions/transactions.schemas.js";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";
import { success } from "../core/response.js";

const router = Router();
router.use(authenticate);
router.get("/", validate(listTransactionsQuerySchema, "query"), async (req, res, next) => {
  try { success(res, await transactionsService.listTransactions(req.user.id, req.query)); } catch (error) { next(error); }
});
router.get("/:id", validate(transactionIdParamSchema, "params"), async (req, res, next) => {
  try { success(res, await transactionsService.getTransaction(req.params.id, req.user.id)); } catch (error) { next(error); }
});
router.patch("/:id/return", validate(transactionIdParamSchema, "params"), async (req, res, next) => {
  try { success(res, await transactionsService.markReturned(req.params.id, req.user.id)); } catch (error) { next(error); }
});
router.patch("/:id/complete", validate(transactionIdParamSchema, "params"), async (req, res, next) => {
  try { success(res, await transactionsService.completeTransaction(req.params.id, req.user.id)); } catch (error) { next(error); }
});
export default router;
