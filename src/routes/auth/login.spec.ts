import { DataSource, EntityManager } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';
import { signupUser, testSetup } from '../../test-utils.spec';
import { agent as request } from 'supertest';
import { ROUTES } from '../routes';
import app from '../../app';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../../constants/environment';
import { UserJWTPayload } from '../../security/utils';
import { loginMessages } from '../../constants/strings/login';
import { UserWithAuth } from '../../types/user';
import '../../custom.d.ts';
import { Provider } from '../../entity/Provider';
import { ProviderRole } from '../../entity/ProviderRole';

describe('/login', () => {
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

    describe('success', () => {
        const username = 'unitTester';
        const password = 'testPassword1!';
        const email = 'unitTester@test.com';
        let dbUser: User;

        beforeEach(async () => {
            const res = await signupUser({ username, password, email });
            dbUser = res.user;
        });

        it('should log a user in correctly and return user', async () => {
            const res = await request(app)
                .post(ROUTES.LOGIN)
                .send({ username, password });

            expect(res.statusCode).toBe(200);
            const { user } = res.body as UserWithAuth;

            expect(user).toBeDefined();
            Object.keys(user)
                .filter((key) => key !== 'providerRoles')
                .forEach((key) => {
                    expect(user[key as keyof User]).toBe(
                        dbUser[key as keyof User]
                    );
                });
        });

        it('should log in a user, but not return the hashed password with user', async () => {
            const res = await request(app)
                .post(ROUTES.LOGIN)
                .send({ username, password });

            expect(res.statusCode).toBe(200);
            const { user } = res.body as UserWithAuth;

            expect(user).toBeDefined();
            expect(user.password).toBeUndefined();
        });

        it('should log in a user, and return a token with userJwtPayload', async () => {
            const res = await request(app)
                .post(ROUTES.LOGIN)
                .send({ username, password });

            expect(res.statusCode).toBe(200);
            const {
                tokens: { authToken: token },
            } = res.body as UserWithAuth;

            const jwtPayload = jwt.verify(
                token,
                JWT_SECRET_KEY
            ) as UserJWTPayload;

            expect(jwtPayload.email).toBe(dbUser.email);
            expect(jwtPayload.id).toBe(dbUser.id);
            expect(jwtPayload.username).toBe(dbUser.username);
        });
        it('should log in a user, and return their provider roles in jwtPayload', async () => {
            const user = await entityManager.findOneOrFail(User, {
                where: { username },
            });
            const provider = await entityManager.save(
                Provider.create({
                    name: 'testProvider',
                    street_address_1: '1234 test street',
                    city: 'test city',
                    state: 'DC',
                    zip: '12345',
                    acceptsSmallDogs: true,
                    acceptsMediumDogs: true,
                    acceptsLargeDogs: true,
                    acceptsGiantDogs: true,
                    capacity: 50,
                    openMonday: true,
                    openTuesday: true,
                    openWednesday: false,
                    openThursday: true,
                    openFriday: false,
                    openSaturday: true,
                    openSunday: true,
                    timezone: 'America/Denver',
                })
            );
            user.providerRoles = [
                ProviderRole.create({
                    user,
                    provider,
                    role: 'admin',
                }),
            ];

            await entityManager.save(user);

            const res = await request(app)
                .post(ROUTES.LOGIN)
                .send({ username, password });
            const {
                tokens: { authToken: token },
            } = res.body as UserWithAuth;
            const jwtPayload = jwt.verify(
                token,
                JWT_SECRET_KEY
            ) as UserJWTPayload;

            expect(jwtPayload.providerRoles).toBeDefined();
            expect(jwtPayload.providerRoles.length).toBe(1);
            expect(jwtPayload.providerRoles[0].role).toBe('admin');
            expect(jwtPayload.providerRoles[0].providerId).toBe(provider.id);
        });
    });

    describe('fail', () => {
        it('should return 401 if the user doesnt exist', async () => {
            const res = await request(app)
                .post(ROUTES.LOGIN)
                .send({ username: 'Spiderman', password: 'doesntExist!' });

            expect(res.statusCode).toBe(401);
            expect(res.body.errorMessage).toBe(loginMessages.invalidInput);
        });
        it('should return 401 if the user exists but the password is incorrect', async () => {
            await signupUser({
                username: 'Spiderman',
                password: 'MJParker12345',
                email: 'peterparker@dailybugle.com',
            });

            const res = await request(app)
                .post(ROUTES.LOGIN)
                .send({ username: 'Spiderman', password: 'doesntExist!' });

            expect(res.statusCode).toBe(401);
            expect(res.body.errorMessage).toBe(loginMessages.invalidInput);
        });
        it('should return the same message and error code for either invalid username or password', async () => {
            const res1 = await request(app)
                .post(ROUTES.LOGIN)
                .send({ username: 'Spiderman', password: 'doesntExist!' });

            expect(res1.statusCode).toBe(401);
            const errorMessageInvalidUsername = res1.body.errorMessage;
            expect(errorMessageInvalidUsername).toBe(
                loginMessages.invalidInput
            );

            await signupUser({
                username: 'Spiderman',
                password: 'MJParker12345',
                email: 'peterparker@dailybugle.com',
            });

            const res2 = await request(app)
                .post(ROUTES.LOGIN)
                .send({ username: 'Spiderman', password: 'doesntExist!' });

            const errorMessageInvalidPassword = res2.body.errorMessage;
            expect(res2.statusCode).toBe(res1.statusCode);
            expect(errorMessageInvalidPassword).toBe(
                errorMessageInvalidUsername
            );
        });
    });
});
