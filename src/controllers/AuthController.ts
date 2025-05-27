import { Request, Response } from 'express';

import createHttpError from 'http-errors';

import {
    logoutMessages,
    refreshTokenMessages,
    signupMessages,
    loginMessages
} from '../constants/strings';


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
import { AuthTokenPair, createAuthTokensFromUser, hashPassword, isValidPassword, renewAuthTokens } from '../security/utils';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { REFRESH_SECRET_KEY } from '../constants/env';
import { Controller } from './Controller';

export type UserWithAuth = {
    user: User
    tokens: AuthTokenPair
}
export class AuthController extends Controller {
    public static async signUp(
        request: Request<
            object,
            {},
            { email: string; password: string }
        >,
        response: Response
    ) {
        const { password, email } = request.body;

        validatePasswordInput(password);

        const hashedPassword = await hashPassword(password);
        
        try {
            const userToSave = await User.create({
                password: hashedPassword,
                email,
            });

            const tokens = await createAuthTokensFromUser(userToSave);

            response.send({
                user: userToSave,
                tokens,
            });
        } catch (e) {
            if (e.name === 'ValidationError') {
                throw createHttpError(409, 'User with email already exists');
            }
            throw e;
        }
    }

    public static async login(
        request: Request<
            object,
            UserWithAuth,
            { email: string; password: string }
        >,
        response: Response
    ) {
        const { password, email } = request.body;


        const user = await User.findOne( {email });

        if (!user || !(await isValidPassword(password, user.password))) {
            throw createHttpError(401, loginMessages.invalidInput);
        }

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


            const refreshToken = await RefreshToken.findOne(
                { jti }
            );

            AuthController.log("refresh token", refreshToken)
            if (!refreshToken){
                throw createHttpError(401, refreshTokenMessages.invalidToken);
            }

            validateTokenBlacklist(refreshToken);
            const tokens = await renewAuthTokens(refreshToken);

            response.send({
                tokens,
            });
        } catch (e) {
     

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

    public static async logout(request: any, response: Response) {
        const user = request['user'];

        try {
            await RefreshToken.deleteOne( { user });

            response.status(200).send(logoutMessages.logout);
        } catch (e) {

            throw createHttpError(500, logoutMessages.logoutError);
        }
    }
}

const validateTokenBlacklist = (token: RefreshToken) => {
    if (token.isBlackListed) {
        throw createHttpError(401, refreshTokenMessages.invalidToken);
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