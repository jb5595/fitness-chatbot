import { DataSource, EntityManager } from 'typeorm';
import { signupUser, sleep, testSetup } from '../../test-utils.spec';
import { UserWithAuth } from '../../types/user';
import { agent as request } from 'supertest';
import app from '../../app';
import { ROUTES } from '../routes';
import { AuthTokenPair, UserJWTPayload } from '../../security';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {
    JWT_SECRET_KEY,
    REFRESH_SECRET_KEY,
    refreshTokenMessages,
} from '../../constants';
import '../../custom.d.ts';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
import crypto from 'crypto';
import { User } from '../../entity/User';
import { RefreshToken } from '../../entity/RefreshToken';

describe('/signup', () => {
    let dataSource: DataSource;
    let entityManager: EntityManager;

    beforeAll(async () => {
        await testSetup((testDataSource, em) => {
            dataSource = testDataSource;
            entityManager = em;
        });
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        await entityManager.delete(User, {});
    });

    describe('Success', () => {
        let userAndAuth: UserWithAuth;

        beforeEach(async () => {
            userAndAuth = await signupUser({
                username: 'charlieDay',
                email: 'charlie@paddyspub.com',
                password: 'pepeSilva!!!2',
            });
        });

        it('should return new tokens on refresh', async () => {
            const res = await request(app)
                .post(ROUTES.TOKEN)
                .send({ token: userAndAuth.tokens.refreshToken });

            expect(res.statusCode).toBe(200);

            const { tokens } = res.body as { tokens: AuthTokenPair };

            expect(tokens).toBeDefined();
            expect(tokens.authToken).toBeDefined();
            expect(tokens.refreshToken).toBeDefined();

            expect(tokens.authToken).not.toBe(userAndAuth.tokens.authToken);
            expect(tokens.refreshToken).not.toBe(userAndAuth.tokens.authToken);
        });
        it('should return valid tokens on refresh', async () => {
            const res = await request(app)
                .post(ROUTES.TOKEN)
                .send({ token: userAndAuth.tokens.refreshToken });

            expect(res.statusCode).toBe(200);

            const { tokens } = res.body as { tokens: AuthTokenPair };

            expect(tokens).toBeDefined();
            expect(tokens.authToken).toBeDefined();
            expect(tokens.refreshToken).toBeDefined();

            const { username, id, email, iat, exp, sub, aud } = jwt.verify(
                tokens.authToken,
                JWT_SECRET_KEY
            ) as UserJWTPayload & { exp: number; sub: string; aud: string };

            [username, id, email, iat, exp, sub, aud].forEach((property) =>
                expect(property).toBeDefined()
            );

            const { jti, iat: refreshiat } = jwt.verify(
                tokens.refreshToken,
                REFRESH_SECRET_KEY
            ) as JwtPayload;

            expect(jti).toBeDefined();
            expect(refreshiat).toBeDefined();
        });
        it('should delete the old refresh token from db on refresh', async () => {
            const { tokens } = userAndAuth;
            const { jti } = jwt.verify(
                tokens.refreshToken,
                REFRESH_SECRET_KEY
            ) as JwtPayload;

            const beforeRefreshEntity = await entityManager.findOne(
                RefreshToken,
                { where: { jti } }
            );
            expect(beforeRefreshEntity).toBeDefined();

            const res = await request(app)
                .post(ROUTES.TOKEN)
                .send({ token: userAndAuth.tokens.refreshToken });
            expect(res.statusCode).toBe(200);

            const afterRefreshEntity = await entityManager.findOne(
                RefreshToken,
                { where: { jti } }
            );
            expect(afterRefreshEntity).toBe(null);
        });
        it('should return auth token with the same claims as the previous auth token', async () => {
            const originalAuthTokenClaims = {
                username: 'Charlie',
                email: 'Charlie@paddyspub.com',
                isABirdLawyer: true,
            };
            const jwtid = crypto.randomUUID();

            await entityManager.save(
                RefreshToken.create({
                    jti: jwtid,
                    claims: originalAuthTokenClaims,
                    expiration: dayjs().add(10, 'minutes').toDate(),
                    user: userAndAuth.user,
                })
            );

            const refreshToken = jwt.sign({ jti: jwtid }, REFRESH_SECRET_KEY);

            const res = await request(app)
                .post(ROUTES.TOKEN)
                .send({ token: refreshToken });

            expect(res.statusCode).toBe(200);

            const { tokens } = res.body as { tokens: AuthTokenPair };
            const authTokenClaims = jwt.verify(
                tokens.authToken,
                JWT_SECRET_KEY
            ) as Omit<UserJWTPayload, 'id'> & { isABirdLawyer: boolean };

            expect(authTokenClaims.username).toBe(
                originalAuthTokenClaims.username
            );
            expect(authTokenClaims.email).toBe(originalAuthTokenClaims.email);
            expect(authTokenClaims.isABirdLawyer).toBe(
                originalAuthTokenClaims.isABirdLawyer
            );
        });
    });
    describe('fail', () => {
        let userAndAuth: UserWithAuth;

        beforeEach(async () => {
            userAndAuth = await signupUser({
                username: 'charlieDay',
                email: 'charlie@paddyspub.com',
                password: 'pepeSilva!!!2',
            });
        });

        it('should return 400 if no token is attached', async () => {
            const res = await request(app)
                .post(ROUTES.TOKEN)
                .send({ token: '' });

            expect(res.statusCode).toBe(400);
            expect(res.body.errorMessage).toBe(refreshTokenMessages.noToken);
        });
        it('should return 401 on invalid token', async () => {
            const jwtid = crypto.randomUUID();
            await entityManager.save(
                RefreshToken.create({
                    jti: jwtid,
                    claims: { somerandomclaim: 'thats right' },
                    expiration: dayjs().add(10, 'minutes').toDate(),
                    user: userAndAuth.user,
                })
            );

            const refreshToken = jwt.sign(
                { jti: jwtid },
                'someInvalidSigningKey',
                { expiresIn: dayjs.duration(10, 'minutes').asSeconds() }
            );

            const res = await request(app)
                .post(ROUTES.TOKEN)
                .send({ token: refreshToken });

            expect(res.statusCode).toBe(401);
            expect(res.body.errorMessage).toBe(
                refreshTokenMessages.invalidToken
            );
        });
        it('should return 401 on expired token', async () => {
            const jwtid = crypto.randomUUID();
            await entityManager.save(
                RefreshToken.create({
                    jti: jwtid,
                    claims: { somerandomclaim: 'thats right' },
                    expiration: dayjs().add(1, 'second').toDate(),
                    user: userAndAuth.user,
                })
            );

            const refreshToken = jwt.sign({ jti: jwtid }, REFRESH_SECRET_KEY, {
                expiresIn: 1,
            });

            // sleep 1.5 seconds so token expires
            await sleep(1500);

            const res = await request(app)
                .post(ROUTES.TOKEN)
                .send({ token: refreshToken });

            expect(res.statusCode).toBe(401);
            expect(res.body.errorMessage).toBe(
                refreshTokenMessages.expiredToken
            );
        });
        it('should return 401 on blacklisted token', async () => {
            const jwtid = crypto.randomUUID();

            await entityManager.save(
                RefreshToken.create({
                    jti: jwtid,
                    claims: { somerandomclaim: 'thats right' },
                    expiration: dayjs().add(10, 'minutes').toDate(),
                    user: userAndAuth.user,
                    isBlackListed: true,
                })
            );

            const refreshToken = jwt.sign({ jti: jwtid }, REFRESH_SECRET_KEY, {
                expiresIn: dayjs.duration(10, 'minutes').asSeconds(),
            });

            const res = await request(app)
                .post(ROUTES.TOKEN)
                .send({ token: refreshToken });

            expect(res.statusCode).toBe(401);
            expect(res.body.errorMessage).toBe(
                refreshTokenMessages.invalidToken
            );
        });
        it('should return 401 on non existent token', async () => {
            const jwtid = crypto.randomUUID();

            const refreshToken = jwt.sign({ jti: jwtid }, REFRESH_SECRET_KEY, {
                expiresIn: dayjs.duration(10, 'minutes').asSeconds(),
            });

            const res = await request(app)
                .post(ROUTES.TOKEN)
                .send({ token: refreshToken });

            expect(res.statusCode).toBe(401);
            expect(res.body.errorMessage).toBe(
                refreshTokenMessages.invalidToken
            );
        });
    });
});
