import passport from 'passport';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { JWT_SECRET_KEY } from '../constants/environment';
import { UserJWTPayload } from './utils';
import createHttpError from 'http-errors';
import { SERVICE_NAME, errorMessages } from '../constants';

passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: JWT_SECRET_KEY,
        },
        (
            jwtPayload: UserJWTPayload & {
                exp: number;
                sub: string;
                aud: string;
            },
            done
        ) => {
            if (jwtPayload.aud !== SERVICE_NAME) {
                throw createHttpError(401, errorMessages.invalidAudience);
            }

            done(null, jwtPayload);
        }
    )
);
