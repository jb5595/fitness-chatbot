import { agent as request } from 'supertest';
import { DataSource, EntityManager } from 'typeorm';
import app from '../app';
import { AppDataSource } from '../data-source';
import { ROUTES } from '../routes/routes';
import { signupUser, sleep, testSetup } from '../test-utils.spec';
import { UserWithAuth } from '../types/user';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../constants/environment';
import { SERVICE_NAME, errorMessages } from '../constants';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { User } from '../entity/User';
dayjs.extend(duration);

describe('auth', () => {
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

    beforeEach(async () => {
        await entityManager.delete(User, {});
    });

    it('should return 401 when no valid auth token is included', async () => {
        const res = await request(app).get(ROUTES.ME);

        expect(res.statusCode).toBe(401);
    });

    it('should return 401 when auth token is invalid', async () => {
        const signupRes = await request(app).post(ROUTES.SIGNUP).send({
            username: 'Omar',
            password: 'dontScare1234$!',
            email: 'omar@westside.com',
        });
        const {
            tokens: { authToken: token },
        } = signupRes.body as UserWithAuth;

        // change the token so it's no longer valid
        const res = await request(app)
            .get(ROUTES.ME)
            .auth(token.slice(0, token.length - 2).concat('aaa'), {
                type: 'bearer',
            });

        expect(res.statusCode).toBe(401);
    });

    it('should return 401 when auth token is expired', async () => {
        await request(app).post(ROUTES.SIGNUP).send({
            username: 'Omar',
            password: 'dontScare1234%$',
            email: 'omar@westside.com',
        });

        const user = await entityManager.findOneOrFail(User, {
            where: { username: 'Omar' },
        });

        const expiredToken = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            JWT_SECRET_KEY,
            { expiresIn: 1, subject: user.username, audience: SERVICE_NAME }
        );

        // sleep 1.5 seconds so token expires
        await sleep(1500);

        const res = await request(app)
            .get(ROUTES.ME)
            .auth(expiredToken, { type: 'bearer' });

        expect(res.statusCode).toBe(401);
    });
    it('should return 401 when audience isnt this service for token', async () => {
        const { user } = await signupUser({
            username: 'Omar',
            password: 'dontScare1234%$',
            email: 'omar@westside.com',
        });

        const authToken = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            JWT_SECRET_KEY,
            {
                expiresIn: dayjs.duration(10, 'minutes').asSeconds(),
                subject: user.username,
                audience: 'The corner dealer',
            }
        );

        const res = await request(app)
            .get(ROUTES.ME)
            .auth(authToken, { type: 'bearer' });

        expect(res.statusCode).toBe(401);
        expect(res.body.errorMessage).toBe(errorMessages.invalidAudience);
    });
});
