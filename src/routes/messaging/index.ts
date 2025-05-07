import { RequestHandler, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { ROUTES } from '../routes';
import { MessagingController } from '../../controllers/MessagingController';



const router = Router();
router.post(ROUTES.SMS,
    asyncHandler(MessagingController.handleIncomingSMS as RequestHandler));

export default router;