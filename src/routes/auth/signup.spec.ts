import { agent as request } from 'supertest';
import app from '../../app';
import { ROUTES } from '../routes';
import { User } from '../../entity/User';
import { DataSource, EntityManager, QueryBuilder } from 'typeorm';
import { UserJWTPayload, isValidPassword } from '../../security/utils';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../../constants/environment';
import { signupMessages } from '../../constants/strings';
import { testSetup } from '../../test-utils.spec';
import { UserWithAuth } from '../../types/user';
import '../../custom.d.ts';

describe('/signup', () => {
    let dataSource: DataSource;
    let entityManager: EntityManager;
    let queryBuilder: QueryBuilder<User>;

    beforeAll(async () => {
        await testSetup((testDataSource, em) => {
            dataSource = testDataSource;
            entityManager = em;
            queryBuilder = testDataSource.createQueryBuilder();
        });
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    beforeEach(async () => {
        await entityManager.delete(User, {});
    });

    describe('success', () => {
        const signupPayload = {
            username: 'frank',
            password: 'rumHam222!',
            email: 'frank@paddyspub.com',
        };

        it('should create a new user on signup', async () => {
            const res = await request(app)
                .post(ROUTES.SIGNUP)
                .send(signupPayload);
            expect(res.statusCode).toBe(200);

            const { user } = res.body as UserWithAuth;
            expect(user).toBeDefined();

            const savedUser = await entityManager.findOneOrFail(User, {
                where: { username: signupPayload.username },
            });

            Object.keys(signupPayload)
                .filter((key) => key !== 'password')
                .forEach((key) => {
                    expect(user[key as keyof User]).toBe(
                        signupPayload[key as keyof typeof signupPayload]
                    );
                    expect(savedUser[key as keyof User]).toBe(
                        signupPayload[key as keyof typeof signupPayload]
                    );
                });

            expect(user.password).toBeUndefined();
        });
        it('should create a hashed password for user on signup', async () => {
            const res = await request(app)
                .post(ROUTES.SIGNUP)
                .send(signupPayload);
            expect(res.statusCode).toBe(200);

            const { user } = res.body as UserWithAuth;
            expect(user).toBeDefined();

            // Use querybuilder to get password since we told typeorm it's not selectable
            const queryResult: { password?: string } | undefined =
                await queryBuilder
                    .select(['password'])
                    .from(User, 'user')
                    .where('user.username= :username', {
                        username: user.username,
                    })
                    .getRawOne();

            expect(queryResult).toBeDefined();
            expect(queryResult!.password).toBeDefined();
            expect(queryResult!.password).not.toBe(signupPayload.password);

            const isPasswordMatch = await isValidPassword(
                signupPayload.password,
                queryResult!.password!
            );

            expect(isPasswordMatch).toBeTruthy();
        });
        it('should return a jwt token containing username, email, and id', async () => {
            const res = await request(app)
                .post(ROUTES.SIGNUP)
                .send(signupPayload);
            expect(res.statusCode).toBe(200);

            const {
                tokens: { authToken: token },
            } = res.body as UserWithAuth;
            expect(token).toBeDefined();

            const savedUser = await entityManager.findOneOrFail(User, {
                where: { username: signupPayload.username },
            });

            const jwtPayload = jwt.verify(
                token,
                JWT_SECRET_KEY
            ) as UserJWTPayload;

            expect(jwtPayload.email).toBe(savedUser.email);
            expect(jwtPayload.id).toBe(savedUser.id);
            expect(jwtPayload.username).toBe(savedUser.username);
        });
    });
    describe('fail', () => {
        beforeEach(async () => {
            await entityManager.delete(User, {});
        });

        it('should error when password is less than 8 characters', async () => {
            const res = await request(app).post(ROUTES.SIGNUP).send({
                username: 'charlie',
                password: 'birdLaw',
                email: 'charlie@paddiesPub.com',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errorMessage).toBe(
                signupMessages.passwordLengthError
            );
        });
        it('should error when username already exists', async () => {
            const signupPayload = {
                username: 'charlie',
                password: 'birdLaw2222',
                email: 'charlie@paddiesPub.com',
            };
            const charlie = User.create(signupPayload);
            await entityManager.save(charlie);

            const res = await request(app)
                .post(ROUTES.SIGNUP)
                .send(signupPayload);

            expect(res.statusCode).toBe(400);
            expect(res.body.errorMessage).toBe(
                signupMessages.usernameUnavailable
            );
        });
        it('should error when username is less than 3 characters', async () => {
            const res = await request(app).post(ROUTES.SIGNUP).send({
                username: 'd',
                password: 'IamBird1111',
                email: 'd@paddiesPub.com',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errorMessage).toBe(
                signupMessages.usernameLengthError
            );
        });
        it('should error when email isnt valid', async () => {
            const res = await request(app).post(ROUTES.SIGNUP).send({
                username: 'charlie',
                password: 'birdLaw1111!',
                email: 'pepeSilvia',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errorMessage).toBe(
                `${signupMessages.invalidInput}: email`
            );
        });
        it('should error when email is null', async () => {
            const res = await request(app).post(ROUTES.SIGNUP).send({
                username: 'charlie',
                password: 'birdLaw1111!',
                email: null,
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errorMessage).toBe(
                `${signupMessages.invalidInput}: email`
            );
        });
        it('should error when password isn\'t a string', async () => {
            const res = await request(app).post(ROUTES.SIGNUP).send({
                username: 'charlie',
                password: 568124836,
                email: 'charlie@paddiesPub.com',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errorMessage).toBe(signupMessages.passwordType);
        });
        it('should error when username isn\'t a string', async () => {
            const res = await request(app).post(ROUTES.SIGNUP).send({
                username: 4564841351,
                password: 'birdLaw1111!',
                email: 'charlie@paddiesPub.com',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errorMessage).toBe(signupMessages.usernameType);
        });
        it('should error when username contains whitespace', async () => {
            const res = await request(app).post(ROUTES.SIGNUP).send({
                username: 'charlie knows how to spell',
                password: 'birdLaw1111!',
                email: 'charlie@paddiesPub.com',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errorMessage).toBe(signupMessages.noWhitespace);
        });
    });
});
