import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { DependencyError } from './catalog/dependency-error';
import { InternalError } from './catalog/internal-error';
import { MalformedInputError } from './catalog/malformed-input-error';
import { UniquenessError } from './catalog/uniqueness-error';
import { ValidationError } from './catalog/validation-error';
import { ConflictError } from './conflict';
import { NetworkError } from './network-error';

export const errorMiddleware = (
    error: unknown,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
) => {
    console.error(error);

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
    } else {
        networkError = new InternalError(undefined, { cause: error });
    }

    res.status(networkError.statusCode).json({ message: networkError.message });

    // No next() invocation. This is the terminal step
};
