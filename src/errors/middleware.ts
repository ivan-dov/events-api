import type { NextFunction, Request, Response } from 'express';
import { inRange } from 'lodash-es';
import { ZodError } from 'zod';
import { env } from '../env.ts';
import { DependencyError } from './catalog/dependency-error.ts';
import { InternalError } from './catalog/internal-error.ts';
import { MalformedInputError } from './catalog/malformed-input-error.ts';
import { UniquenessError } from './catalog/uniqueness-error.ts';
import { ValidationError } from './catalog/validation-error.ts';
import { ConflictError } from './conflict.ts';
import { NetworkError } from './network-error.ts';

export const errorMiddleware = (
    error: unknown,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: NextFunction,
) => {
    if (env.NODE_ENV !== 'test') {
        console.error(error);
    }

    let networkError: NetworkError;

    if (error instanceof NetworkError) {
        networkError = error;
    } else if (error instanceof ZodError) {
        networkError = new ValidationError(error);
    } else if (error instanceof ConflictError && error.type === 'foreignKey') {
        networkError = new DependencyError(error);
    } else if (error instanceof ConflictError && error.type === 'unique') {
        networkError = new UniquenessError(error);
    } else if (
        error instanceof SyntaxError &&
        'type' in error &&
        error.type === 'entity.parse.failed'
    ) {
        networkError = new MalformedInputError(error.message, { cause: error });
    } else if (
        error instanceof Error &&
        'status' in error &&
        typeof error.status === 'number' &&
        inRange(error.status, 400, 600)
    ) {
        res.status(error.status).json({ message: error.message });
        return;
    } else {
        networkError = new InternalError(undefined, { cause: error });
    }

    res.status(networkError.statusCode).json({ message: networkError.message });

    // No next() invocation. This is the terminal step
};
