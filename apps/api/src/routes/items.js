import { Router } from "express";
import * as itemsService from "../modules/items/items.service.js";
import {
  listItemsQuerySchema,
  itemIdParamSchema,
  createItemSchema,
  updateItemSchema,
} from "../modules/items/items.schemas.js";
import validate from "../middleware/validate.js";
import authenticate from "../middleware/authenticate.js";
import { createRequestSchema, itemIdParamSchema as requestItemIdParamSchema } from "../modules/requests/requests.schemas.js";
import * as requestsService from "../modules/requests/requests.service.js";
import { success, created, paginated } from "../core/response.js";

const router = Router();

router.post(
  "/:id/requests",
  authenticate,
  validate(requestItemIdParamSchema, "params"),
  validate(createRequestSchema),
  async (req, res, next) => {
    try {
      const borrowRequest = await requestsService.createRequest(req.params.id, req.user.id, req.body);
      created(res, borrowRequest);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/",
  authenticate,
  validate(createItemSchema),
  async (req, res, next) => {
    try {
      const item = await itemsService.createItem(req.user.id, req.body);
      created(res, item);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/:id/availability",
  validate(itemIdParamSchema, "params"),
  async (req, res, next) => {
    try {
      const availability = await itemsService.getItemAvailability(req.params.id);
      success(res, availability);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/:id",
  authenticate,
  validate(itemIdParamSchema, "params"),
  validate(updateItemSchema),
  async (req, res, next) => {
    try {
      const item = await itemsService.updateItem(req.params.id, req.user.id, req.body);
      success(res, item);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:id",
  authenticate,
  validate(itemIdParamSchema, "params"),
  async (req, res, next) => {
    try {
      const result = await itemsService.removeItem(req.params.id, req.user.id);
      success(res, result);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/",
  validate(listItemsQuerySchema, "query"),
  async (req, res, next) => {
    try {
      const { items, meta } = await itemsService.listItems(req.query);
      paginated(res, items, meta);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/:id",
  validate(itemIdParamSchema, "params"),
  async (req, res, next) => {
    try {
      const item = await itemsService.getItemById(req.params.id);
      success(res, item);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
