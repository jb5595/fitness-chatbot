import { Router } from "express";
import { ROUTES } from "../routes";
import passport from "passport";
import { UserController } from "../../controllers/UserController";


const router = Router();

router.get(ROUTES.ME, passport.authenticate('jwt', {session: false}), UserController.me);

export default router;