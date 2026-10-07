import { Router } from "express";
import * as requestsService from "../modules/requests/requests.service.js";
import { listRequestsQuerySchema, rejectRequestSchema, requestIdParamSchema } from "../modules/requests/requests.schemas.js";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";
import { success } from "../core/response.js";

const router = Router();
router.use(authenticate);

router.get("/", validate(listRequestsQuerySchema, "query"), async (req, res, next) => {
  try { success(res, await requestsService.listRequests(req.user.id, req.query)); } catch (error) { next(error); }
});
router.get("/:id", validate(requestIdParamSchema, "params"), async (req, res, next) => {
  try { success(res, await requestsService.getRequest(req.params.id, req.user.id)); } catch (error) { next(error); }
});
router.patch("/:id/approve", validate(requestIdParamSchema, "params"), async (req, res, next) => {
  try { success(res, await requestsService.approveRequest(req.params.id, req.user.id)); } catch (error) { next(error); }
});
router.patch("/:id/reject", validate(requestIdParamSchema, "params"), validate(rejectRequestSchema), async (req, res, next) => {
  try { success(res, await requestsService.rejectRequest(req.params.id, req.user.id, req.body.reason)); } catch (error) { next(error); }
});
router.patch("/:id/cancel", validate(requestIdParamSchema, "params"), async (req, res, next) => {
  try { success(res, await requestsService.cancelRequest(req.params.id, req.user.id)); } catch (error) { next(error); }
});
export default router;
