import { Router } from "express";
import * as recommendationsService from "../modules/recommendations/recommendations.service.js";
import { relatedItemsQuerySchema } from "../modules/recommendations/recommendations.schemas.js";
import validate from "../middleware/validate.js";
import { success } from "../core/response.js";

const router = Router();
router.get("/related", validate(relatedItemsQuerySchema, "query"), async (req, res, next) => {
  try { success(res, await recommendationsService.getRelatedItems(req.query)); } catch (error) { next(error); }
});
export default router;
