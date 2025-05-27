import { Router } from 'express';
import messagingRoutes from './messaging';
import voiceCallRoutes from "./voiceCalls"
import gymRoutes from "./gyms"
import chatHistoryRoutes from "./chatHistory"
import authRoutes from "./auth"
import userRoutes from "./user"
const router = Router();


router.use(voiceCallRoutes)
router.use(messagingRoutes);
router.use(gymRoutes)
router.use(chatHistoryRoutes)
router.use(authRoutes)
router.use(userRoutes)

export default router;