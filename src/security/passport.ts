import passport from "passport";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { UserJWTPayload } from "./utils";
import { JWT_SECRET_KEY } from "../constants/env";

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey   : JWT_SECRET_KEY
},(jwtPayload: UserJWTPayload & { iat: number }, done) => {
    // TODO (task #44) enforce ttl of jwt
    done(null, jwtPayload);
}));