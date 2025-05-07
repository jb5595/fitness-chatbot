import { Router } from 'express';
import messaging from './messaging';
import voiceCalls from "./voiceCalls"
import gyms from "./gyms"
import chatHistory from "./chatHistory"

const router = Router();


router.use(voiceCalls)
router.use(messaging);
router.use(gyms)
router.use(chatHistory)

export default router;