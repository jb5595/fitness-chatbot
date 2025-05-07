import { RequestHandler, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { ROUTES } from '../routes';

import { ChatHistoryController } from '../../controllers/ChatHistoryController';



const router = Router();

router.get(ROUTES.CHAT_HISTORY_GYM_MESSENGERS,
    asyncHandler(ChatHistoryController.getGymMessengers as RequestHandler));

router.get(ROUTES.CHAT_HISTORY_GYM_MESSENGER_MESSAGES,
    asyncHandler(ChatHistoryController.getGymMessengerMessages as RequestHandler));


export default router;