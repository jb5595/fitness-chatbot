import { RequestHandler, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { ROUTES } from '../routes';
import { VoiceCallController } from '../../controllers/VoiceCallController';

const router = Router();

router.post(ROUTES.VOICE_CALL,
    asyncHandler(VoiceCallController.handleIncomingCall as RequestHandler));


router.post(ROUTES.VOICE_CALL_INPUT,
    asyncHandler(VoiceCallController.handleVoiceCallInput as RequestHandler));

export default router;