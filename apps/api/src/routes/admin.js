import { Router } from "express";
import * as adminService from "../modules/admin/admin.service.js";
import { adminIdParamSchema, adminItemStatusSchema, adminReportStatusSchema, adminUserStatusSchema } from "../modules/admin/admin.schemas.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { success } from "../core/response.js";

const router = Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/reports", async (req, res, next) => {
  try { success(res, await adminService.listReports()); } catch (error) { next(error); }
});
router.patch("/reports/:id", validate(adminIdParamSchema, "params"), validate(adminReportStatusSchema), async (req, res, next) => {
  try { success(res, await adminService.updateReport(req.params.id, req.body.status)); } catch (error) { next(error); }
});
router.patch("/users/:id/status", validate(adminIdParamSchema, "params"), validate(adminUserStatusSchema), async (req, res, next) => {
  try { success(res, await adminService.updateUserStatus(req.params.id, req.body.isSuspended)); } catch (error) { next(error); }
});
router.patch("/items/:id/status", validate(adminIdParamSchema, "params"), validate(adminItemStatusSchema), async (req, res, next) => {
  try { success(res, await adminService.updateItemStatus(req.params.id, req.body.status)); } catch (error) { next(error); }
});
export default router;
