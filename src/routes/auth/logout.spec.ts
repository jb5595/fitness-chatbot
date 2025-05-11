import { DataSource, EntityManager } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { setUpTestAgent, signupUser, testSetup } from '../../test-utils.spec';
import supertest from 'supertest';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { ROUTES } from '../routes';
import { logoutMessages } from '../../constants';
import { agent as request } from 'supertest';
import app from '../../app';
import { User } from '../../entity/User';
import { RefreshToken } from '../../entity/RefreshToken';

describe('logout', () => {
    let dataSource: DataSource;
    let entityManager: EntityManager;

    beforeAll(async () => {
        entityManager = AppDataSource.manager;
        await testSetup((testDataSource, em) => {
            dataSource = testDataSource;
            entityManager = em;
        });
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    afterEach(async () => {
        await entityManager.delete(User, {});
    });

    describe('success', () => {
        let authenticatedAgent: supertest.SuperAgentTest;
        let authenticatedUser: User;

        beforeEach(async () => {
            await setUpTestAgent(entityManager, (agent, userWithAuth) => {
                authenticatedAgent = agent;
                authenticatedUser = userWithAuth.user;
            });
        });

        it('should clear all of the users refresh tokens from the db', async () => {
            const additionalRefreshTokens = Array.from({ length: 4 }).map(() =>
                RefreshToken.create({
                    jti: faker.string.uuid(),
                    claims: { amAClaim: true },
                    expiration: dayjs().add(7, 'days').toDate(),
                    user: authenticatedUser,
                })
            );
            await entityManager.save(additionalRefreshTokens);

            const res = await authenticatedAgent.get(ROUTES.LOGOUT);

            expect(res.statusCode).toBe(200);
            expect(res.text).toBe(logoutMessages.logout);

            const refreshTokensInDbCountForUser = await entityManager.count(
                RefreshToken,
                { where: { user: authenticatedUser } } as any
            );

            expect(refreshTokensInDbCountForUser).toBe(0);
        });
        it('shouldnt clear unrelated refresh tokens from the db', async () => {
            const originalRefreshTokenCount = await entityManager.count(
                RefreshToken
            );

            const {
                user: otherUser,
                tokens: { authToken },
            } = await signupUser({
                username: 'Omar',
                email: 'omar@westside.com',
                password: '2comeAtTheKing%',
            });

            const amountOfAdditionalTokens = 4;
            const additionalRefreshTokens = Array.from({
                length: amountOfAdditionalTokens,
            }).map(() =>
                RefreshToken.create({
                    jti: faker.string.uuid(),
                    claims: { amAClaim: true },
                    expiration: dayjs().add(7, 'days').toDate(),
                    user: otherUser,
                })
            );
            await entityManager.save(additionalRefreshTokens);

            const refreshTokensInDbCountForUser = await entityManager.count(
                RefreshToken,
                { where: { user: otherUser } } as any
            );

            // The number of extra tokens we saved + original signup token
            expect(refreshTokensInDbCountForUser).toBe(
                amountOfAdditionalTokens + 1
            );

            const res = await request(app)
                .get(ROUTES.LOGOUT)
                .auth(authToken, { type: 'bearer' });
            expect(res.statusCode).toBe(200);

            const newCount = await entityManager.count(RefreshToken);
            expect(newCount).toBe(originalRefreshTokenCount);
        });
    });
});
