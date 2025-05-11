import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
    JWT_SECRET_KEY,
    JWT_TTL_MINUTES,
    REFRESH_SECRET_KEY,
    REFRESH_TOKEN_TTL_MINUTES,
} from '../constants/environment';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { SERVICE_NAME } from '../constants';
import { entityManager } from '../data-source';
import crypto from 'crypto';
import { RefreshToken } from '@Entity/RefreshToken';
import { User } from '@Entity/User';
dayjs.extend(duration);

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string) => {
    return await hash(password, SALT_ROUNDS);
};

export const isValidPassword = async (
    passwordInput: string,
    dbPassword: string
): Promise<boolean> => {
    return await compare(passwordInput, dbPassword);
};

export type UserJWTPayload = Express.User;

export type AuthTokenPair = {
    authToken: string;
    refreshToken: string;
};

export const createAuthTokensFromUser = async (
    user: User
): Promise<AuthTokenPair> => {
    const userJWTPayload: Omit<UserJWTPayload, 'iat'> = {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        providerRoles: user.providerRoles,
    };
    const jwtid = crypto.randomUUID();

    await entityManager.save(
        RefreshToken.create({
            jti: jwtid,
            claims: userJWTPayload,
            // since expiration here is mainly used for clearing db rather than validation,
            // add 1 min buffer to be sure that it doesn't expire before token
            expiration: dayjs()
                .add(REFRESH_TOKEN_TTL_MINUTES + 1, 'minutes')
                .toDate(),
            user,
        })
    );

    return {
        authToken: jwt.sign(userJWTPayload, JWT_SECRET_KEY, {
            expiresIn: dayjs.duration(JWT_TTL_MINUTES, 'minutes').asSeconds(),
            subject: user.username,
            audience: SERVICE_NAME,
        }),
        refreshToken: jwt.sign(
            {
                jti: jwtid,
            },
            REFRESH_SECRET_KEY,
            {
                expiresIn: dayjs
                    .duration(REFRESH_TOKEN_TTL_MINUTES, 'minutes')
                    .asSeconds(),
            }
        ),
    };
};

export const renewAuthTokens = async (
    refreshToken: RefreshToken
): Promise<AuthTokenPair> => {
    const jwtid = crypto.randomUUID();

    await entityManager.save(
        RefreshToken.create({
            jti: jwtid,
            claims: refreshToken.claims as object,
            // since expiration here is mainly used for clearing db rather than validation,
            // add 1 min buffer to be sure that it doesn't expire before token
            expiration: dayjs()
                .add(REFRESH_TOKEN_TTL_MINUTES + 1, 'minutes')
                .toDate(),
            user: refreshToken.user,
        })
    );

    await entityManager.delete(RefreshToken, { jti: refreshToken.jti });

    return {
        authToken: jwt.sign(refreshToken.claims as object, JWT_SECRET_KEY, {
            expiresIn: dayjs.duration(JWT_TTL_MINUTES, 'minutes').asSeconds(),
            subject: refreshToken.claims.username
                ? (refreshToken.claims.username as string)
                : undefined,
            audience: SERVICE_NAME,
        }),
        refreshToken: jwt.sign(
            {
                jti: jwtid,
            },
            REFRESH_SECRET_KEY,
            {
                expiresIn: dayjs
                    .duration(REFRESH_TOKEN_TTL_MINUTES, 'minutes')
                    .asSeconds(),
            }
        ),
    };
};
