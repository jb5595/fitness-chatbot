import { DataSource, EntityManager, EntityTarget } from 'typeorm';
import app from './app';
import { AppDataSource } from './data-source';
import supertest, { agent as request } from 'supertest';
import { ROUTES } from './routes/routes';
import { UserWithAuth } from './types/user';
import { faker } from '@faker-js/faker';
import _ from 'lodash';
import { Pet } from './entity/Pet';
import { PetStay, PetStayStatus } from './entity/PetStay';
import { Provider } from './entity/Provider';
import { User } from './entity/User';

/**
 * Test setup
 * @param {any} dataSourceCallback: callback to setup the datasource and entityManager
 * @param {any} testAgentCallback: optional, if provided sets up a base user and authenticated test agent
 * @returns {Promise<void>}
 */
export const testSetup = async (
    dataSourceCallback: (
        dataSource: DataSource,
        entityManager: EntityManager
    ) => any,
    testAgentCallback?: (
        authenticatedAgent: supertest.SuperAgentTest,
        testUser: UserWithAuth
    ) => any
): Promise<void> => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    dataSourceCallback(AppDataSource, AppDataSource.manager);

    if (testAgentCallback) {
        await setUpTestAgent(AppDataSource.manager, testAgentCallback);
    }
};

export const setUpTestAgent = async (
    entityManager: EntityManager,
    callback: (
        authenticatedAgent: supertest.SuperAgentTest,
        testUser: UserWithAuth
    ) => any
) => {
    const username = faker.string.uuid();
    const password = 'teSt12345678!';
    const signupUserRes: UserWithAuth = await signupUser({
        username,
        password,
        email: 'test@test.com',
    });
    await entityManager.update(
        User,
        { id: signupUserRes.user.id },
        { isAdmin: true }
    );
    const testUser = await loginUser({
        username,
        password,
    });

    const authenticatedAgent = request(app);
    await authenticatedAgent.auth(testUser.tokens.authToken, {
        type: 'bearer',
    });

    callback(authenticatedAgent, testUser);
};

export const signupUser = async (signupPayload: {
    username: string;
    email: string;
    password: string;
}): Promise<UserWithAuth> => {
    const res: { body: UserWithAuth } = await request(app)
        .post(ROUTES.SIGNUP)
        .send(signupPayload);

    return res.body;
};

export const loginUser = async (loginPayload: {
    username: string;
    password: string;
}): Promise<UserWithAuth> => {
    const res: { body: UserWithAuth } = await request(app)
        .post(ROUTES.LOGIN)
        .send(loginPayload);

    return res.body;
};

/**
 * Clears specified tables in the database. Pass entityManager in first param and list of entity targets (tables) in the second.
 * Clears the user table by default
 * @param {EntityManager} entityManager:EntityManager
 * @param {Array<EntityTarget<{ name: string }>>} tablesToClear:Array<EntityTarget<{name:string}>>
 * @returns {Promise<void>}
 */
export const testCleanup = async (
    entityManager: EntityManager,
    tablesToClear: Array<EntityTarget<{ name: string }>>
): Promise<void> => {
    const tablesToClearAndDefaults = _.uniqBy(
        [...tablesToClear, User],
        (entity) => (entity as { name: string }).name
    );

    await Promise.all(
        tablesToClearAndDefaults.map((entity) => {
            return entityManager.delete(entity, {});
        })
    );
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function* entityGenerator<T>(
    amount = 1,
    createRandomEntity: (options?: Partial<T>) => T,
    options?: Partial<T>
): Generator<T> {
    let i = 0;
    while (i < amount) {
        yield createRandomEntity(options);
        i++;
    }
}

export const randomProvider = (options?: Partial<Provider>): Provider => {
    return Provider.create(
        Object.assign(
            {
                name: faker.person.fullName(),
                street_address_1: `${faker.location.buildingNumber()} ${faker.location.street()}`,
                street_address_2: null,
                city: faker.location.city(),
                state: faker.location.state(),
                zip: faker.location.zipCode(),
                acceptsSmallDogs: true,
                acceptsMediumDogs: true,
                acceptsLargeDogs: true,
                acceptsGiantDogs: true,
                capacity: 50,
                openMonday: true,
                openTuesday: true,
                openWednesday: true,
                openThursday: true,
                openFriday: true,
                openSaturday: true,
                openSunday: true,
                timezone: 'America/Denver',
            },
            options
        )
    );
};

export const randomPetStay = (options?: Partial<PetStay>) => {
    return PetStay.create(
        Object.assign(
            {
                startDate: faker.date.past(),
                endDate: faker.date.future(),
                status: PetStayStatus.PENDING,
            },
            options
        )
    );
};

export const randomPet = (options?: Partial<Pet>) => {
    return Pet.create(
        Object.assign(
            {
                name: faker.person.firstName(),
                breed: faker.animal.dog(),
                age: faker.number.int({ min: 1, max: 20 }),
                color: faker.color.human(),
                animal_type: 'dog',
                emergency_contact: faker.phone.number(),
                vet_name: faker.company.name(),
                vet_number: faker.phone.number(),
                temperament_tested: faker.datatype.boolean(),
                spayed_or_neutered: faker.datatype.boolean(),
            },
            options
        )
    );
};
