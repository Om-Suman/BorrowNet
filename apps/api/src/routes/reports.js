import { Router } from "express";
import * as reportsService from "../modules/reports/reports.service.js";
import { createReportSchema } from "../modules/reports/reports.schemas.js";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";
import { created } from "../core/response.js";

const router = Router();
router.post("/", authenticate, validate(createReportSchema), async (req, res, next) => {
  try { created(res, await reportsService.createReport(req.user.id, req.body)); } catch (error) { next(error); }
});
export default router;
