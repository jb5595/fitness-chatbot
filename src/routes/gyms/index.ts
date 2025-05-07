import { RequestHandler, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { ROUTES } from '../routes';
import { GymController } from '../../controllers/GymController';



const router = Router();

router.get(ROUTES.GET_GYM,
    asyncHandler(GymController.getGym as RequestHandler));

export default router;