import { User } from '@Entity/User';
import { AuthTokenPair } from '../security';

export type UserWithAuth = {
    user: User;
    tokens: AuthTokenPair;
};
