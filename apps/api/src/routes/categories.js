import { Router } from 'express';
import * as categoriesService from '../modules/categories/categories.service.js';
import { categorySlugSchema } from '../modules/categories/categories.schemas.js';
import validate from '../middleware/validate.js';
import { success } from '../core/response.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const categories = await categoriesService.listCategories();
    success(res, categories);
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', validate(categorySlugSchema, 'params'), async (req, res, next) => {
  try {
    const category = await categoriesService.getCategoryBySlug(req.params.slug);
    success(res, category);
  } catch (error) {
    next(error);
  }
});

export default router;
