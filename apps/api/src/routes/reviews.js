import { Router } from "express";
import * as reviewsService from "../modules/reviews/reviews.service.js";
import { createReviewSchema, reviewTransactionIdParamSchema, reviewUserIdParamSchema } from "../modules/reviews/reviews.schemas.js";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";
import { created, success } from "../core/response.js";

const router = Router();
router.post("/transactions/:id/reviews", authenticate, validate(reviewTransactionIdParamSchema, "params"), validate(createReviewSchema), async (req, res, next) => {
  try { created(res, await reviewsService.createReview(req.params.id, req.user.id, req.body)); } catch (error) { next(error); }
});
router.get("/users/:id/reviews", validate(reviewUserIdParamSchema, "params"), async (req, res, next) => {
  try { success(res, await reviewsService.listUserReviews(req.params.id)); } catch (error) { next(error); }
});
export default router;
