import { Router } from 'express';
import * as usersService from '../modules/users/users.service.js';
import { updateProfileSchema, paramsIdSchema } from '../modules/users/users.schemas.js';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import { success, paginated } from '../core/response.js';

const router = Router();

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const profile = await usersService.getProfile(req.user.id);
    success(res, profile);
  } catch (error) {
    next(error);
  }
});

router.patch('/me', authenticate, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const profile = await usersService.updateProfile(req.user.id, req.body);
    success(res, profile);
  } catch (error) {
    next(error);
  }
});

router.get('/me/items', authenticate, async (req, res, next) => {
  try {
    const result = await usersService.getUserItems(req.user.id);
    paginated(res, result.items, result.meta);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validate(paramsIdSchema, 'params'), async (req, res, next) => {
  try {
    const profile = await usersService.getPublicProfile(req.params.id);
    success(res, profile);
  } catch (error) {
    next(error);
  }
});

export default router;
