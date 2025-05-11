import { Location } from 'express-validator';

export type AppErrorBody = Record<string, AppErrorResponse> | { errorMessage: string };

export type AppErrorResponse = {
    messages: string[];
    isValid: boolean;
    value?: string;
    location: Location;
}

export class AppError {
    constructor(public statusCode: number, public errors: AppErrorBody) { }
}