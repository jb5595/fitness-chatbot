import { RequestHandler, Router } from 'express';

import { ROUTES } from '../routes';
import asyncHandler from 'express-async-handler';
import passport from 'passport';
import { AuthController } from '../../controllers/AuthController';

const router = Router();

router.post(ROUTES.SIGNUP, asyncHandler(AuthController.signUp));
router.post(ROUTES.LOGIN, asyncHandler(AuthController.login));
router.post(ROUTES.TOKEN, asyncHandler(AuthController.token));
router.get(ROUTES.LOGOUT, asyncHandler(
    passport.authenticate('jwt', { session: false }) as RequestHandler
), asyncHandler(
    AuthController.logout
));

export default router;
