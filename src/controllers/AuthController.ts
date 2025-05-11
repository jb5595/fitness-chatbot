import { Request, Response } from 'express';
import { entityManager } from '../data-source';
import createHttpError from 'http-errors';
import {
    createAuthTokensFromUser,
    hashPassword,
    isValidPassword,
    renewAuthTokens,
} from '../security/utils';
import { validate } from 'class-validator';
import {
    logoutMessages,
    refreshTokenMessages,
    signupMessages,
} from '../constants/strings';
import { loginMessages } from '../constants/strings/login';
import { UserWithAuth } from '../types/user';
import {
    containsWhiteSpace,
    containsUpperCaseLetter,
    containsLowerCaseLetter,
    containsSpecialCharacter,
    containsNumeric,
} from '../utils/strings';
import jwt, {
    JsonWebTokenError,
    JwtPayload,
    TokenExpiredError,
} from 'jsonwebtoken';
import { REFRESH_SECRET_KEY } from '../constants';
import { EntityNotFoundError } from 'typeorm';
import { DenLogger } from '../utils';
import { RefreshToken } from '@Entity/RefreshToken';
import { User } from '@Entity/User';

export class AuthController {
    public static async signUp(
        request: Request<
            object,
            UserWithAuth,
            { email: string; username: string; password: string }
        >,
        response: Response
    ) {
        const { password, username, email } = request.body;

        await validateUsernameInput(username);
        validatePasswordInput(password);

        const hashedPassword = await hashPassword(password);
        const userToSave = User.create({
            username,
            password: hashedPassword,
            email,
        });

        const validationErrors = await validate(userToSave);

        if (validationErrors.length > 0) {
            throw createHttpError(
                400,
                `${signupMessages.invalidInput}: ${validationErrors
                    .map((e) => e.property)
                    .concat()}`
            );
        }

        try {
            const savedUser = await entityManager.save(userToSave);
            // delete password due to open issue https://github.com/typeorm/typeorm/issues/4591
            delete savedUser.password;

            const tokens = await createAuthTokensFromUser(savedUser);

            response.send({
                user: savedUser,
                tokens,
            });
        } catch (e) {
            throw createHttpError(500, signupMessages.errorSaving);
        }
    }

    public static async login(
        request: Request<
            object,
            UserWithAuth,
            { username: string; password: string }
        >,
        response: Response
    ) {
        const { password, username } = request.body;

        const user = await entityManager.findOne(User, {
            where: { username },
            select: {
                username: true,
                password: true,
                id: true,
                email: true,
                isAdmin: true,
            },
            relations: ['providerRoles'],
        });

        if (!user || !(await isValidPassword(password, user.password))) {
            throw createHttpError(401, loginMessages.invalidInput);
        }

        delete user.password;
        const tokens = await createAuthTokensFromUser(user);

        response.send({
            user,
            tokens,
        });
    }

    public static async token(
        request: Request<object, UserWithAuth, { token: string }>,
        response: Response
    ) {
        const { token } = request.body;

        if (!token) {
            throw createHttpError(400, refreshTokenMessages.noToken);
        }

        try {
            const { jti } = jwt.verify(token, REFRESH_SECRET_KEY) as JwtPayload;

            const refreshToken = await entityManager.findOneOrFail(
                RefreshToken,
                { where: { jti } }
            );
            validateTokenBlacklist(refreshToken);
            const tokens = await renewAuthTokens(refreshToken);

            response.send({
                tokens,
            });
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                throw createHttpError(401, refreshTokenMessages.invalidToken);
            }

            if (e instanceof JsonWebTokenError) {
                if (e instanceof TokenExpiredError) {
                    throw createHttpError(
                        401,
                        refreshTokenMessages.expiredToken
                    );
                }

                throw createHttpError(401, refreshTokenMessages.invalidToken);
            }

            throw e;
        }
    }

    public static async logout(request: Request, response: Response) {
        const user = request.user;

        try {
            await entityManager.delete(RefreshToken, { user });

            response.status(200).send(logoutMessages.logout);
        } catch (e) {
            DenLogger.error(
                `Unable to logout user, failed with error: \n ${
                    (e as Error).message
                }`
            );
            throw createHttpError(500, logoutMessages.logoutError);
        }
    }
}

const validateTokenBlacklist = (token: RefreshToken) => {
    if (token.isBlackListed) {
        DenLogger.warn(`Received blacklisted token ${JSON.stringify(token)}`);
        throw createHttpError(401, refreshTokenMessages.invalidToken);
    }
};

const validateUsernameInput = async (username: string) => {
    if (typeof username !== 'string') {
        throw createHttpError(400, signupMessages.usernameType);
    }

    if (containsWhiteSpace(username)) {
        throw createHttpError(400, signupMessages.noWhitespace);
    }

    if (username.length < 3) {
        throw createHttpError(400, signupMessages.usernameLengthError);
    }

    // TODO (task #41) replace spaces with underscores

    const existingUser = await entityManager.findOne(User, {
        where: { username },
    });

    if (existingUser) {
        throw createHttpError(400, signupMessages.usernameUnavailable);
    }
};

export const validatePasswordInput = (password: string) => {
    if (typeof password !== 'string') {
        throw createHttpError(400, signupMessages.passwordType);
    }

    if (password.length < 8) {
        throw createHttpError(400, signupMessages.passwordLengthError);
    }

    if (containsWhiteSpace(password)) {
        throw createHttpError(400, signupMessages.passwordNoWhiteSpaceError);
    }

    if (!containsUpperCaseLetter(password)) {
        throw createHttpError(400, signupMessages.passwordUpperCaseError);
    }

    if (!containsLowerCaseLetter(password)) {
        throw createHttpError(400, signupMessages.passwordLowerCaseError);
    }

    if (!containsNumeric(password)) {
        throw createHttpError(400, signupMessages.passwordNumericError);
    }

    if (!containsSpecialCharacter(password)) {
        throw createHttpError(400, signupMessages.passwordSpecialCharError);
    }
};
