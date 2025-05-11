import { config } from 'dotenv';

if (process.env.NODE_ENV !== 'prod') {
    config({ path: `${__dirname}/../../${process.env.NODE_ENV}.env` });
}

export const getEnvVar = (key: string) => {
    const val = process.env[key];

    if (!val) {
        throw new Error(`Expected env variable ${key} to be defined`);
    }

    return val;
};

export const JWT_SECRET_KEY = getEnvVar('JWT_SECRET_KEY');
export const REFRESH_SECRET_KEY = getEnvVar('REFRESH_SECRET_KEY');
export const JWT_TTL_MINUTES = Number(getEnvVar('JWT_TTL_MINUTES'));
export const REFRESH_TOKEN_TTL_MINUTES = Number(
    getEnvVar('REFRESH_TOKEN_TTL_MINUTES')
);
export const SERVICE_NAME = 'App-Server';
