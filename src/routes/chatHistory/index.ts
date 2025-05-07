import { RequestHandler, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { ROUTES } from '../routes';

import { ChatHistoryController } from '../../controllers/ChatHistoryController';



const router = Router();
router.get(ROUTES.CHAT_HISTORY_GYM_CLIENTS,
    asyncHandler(ChatHistoryController.getGymClients as RequestHandler));

router.get(ROUTES.CHAT_HISTORY_GYM_CLIENT_MESSAGES,
    asyncHandler(ChatHistoryController.getGymClientMessages as RequestHandler));


export default router;