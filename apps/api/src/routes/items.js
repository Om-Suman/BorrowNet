import { Router } from "express";
import * as itemsService from "../modules/items/items.service.js";
import {
  listItemsQuerySchema,
  itemIdParamSchema,
} from "../modules/items/items.schemas.js";
import validate from "../middleware/validate.js";
import { success, paginated } from "../core/response.js";

const router = Router();

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
