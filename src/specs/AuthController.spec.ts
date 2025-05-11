import { HttpError } from 'http-errors';
import { validatePasswordInput } from '../controllers/AuthController';
import { signupMessages } from '../constants/strings';

describe('password validation', () => {
    it('should error if password is too short', () => {
        expect.assertions(2);
        try {
            validatePasswordInput('a$1');
        } catch (e: any) {
            expect((e as HttpError).statusCode).toBe(400);
            expect((e as HttpError).message).toBe(
                signupMessages.passwordLengthError
            );
        }
    });
    it('should error if password contains whitespace', () => {
        expect.assertions(2);
        try {
            validatePasswordInput('long enougH!');
        } catch (e: any) {
            expect((e as HttpError).statusCode).toBe(400);
            expect((e as HttpError).message).toBe(
                signupMessages.passwordNoWhiteSpaceError
            );
        }
    });
    it('should error if password doesn\'t contain a uppercase letter', () => {
        expect.assertions(2);
        try {
            validatePasswordInput('longenough1!');
        } catch (e: any) {
            expect((e as HttpError).statusCode).toBe(400);
            expect((e as HttpError).message).toBe(
                signupMessages.passwordUpperCaseError
            );
        }
    });
    it('should error if password doesn\'t contain a lowercase letter', () => {
        expect.assertions(2);
        try {
            validatePasswordInput('LONGENOUGH1!');
        } catch (e: any) {
            expect((e as HttpError).statusCode).toBe(400);
            expect((e as HttpError).message).toBe(
                signupMessages.passwordLowerCaseError
            );
        }
    });
    it('should error if password doesn\'t contain a numeric character', () => {
        expect.assertions(2);
        try {
            validatePasswordInput('LONGeNOUGH$!');
        } catch (e: any) {
            expect((e as HttpError).statusCode).toBe(400);
            expect((e as HttpError).message).toBe(
                signupMessages.passwordNumericError
            );
        }
    });
    it('should error if password doesn\'t contain a special character', () => {
        expect.assertions(2);
        try {
            validatePasswordInput('LONGeNOUGH314');
        } catch (e: any) {
            expect((e as HttpError).statusCode).toBe(400);
            expect((e as HttpError).message).toBe(
                signupMessages.passwordSpecialCharError
            );
        }
    });
});
