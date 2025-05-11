import { Router } from 'express';
import messaging from './messaging';
import voiceCalls from "./voiceCalls"
import gyms from "./gyms"
import chatHistory from "./chatHistory"
import auth from './auth';

const router = Router();


router.use(voiceCalls)
router.use(messaging);
router.use(gyms)
router.use(chatHistory)
router.use(auth)

export default router;