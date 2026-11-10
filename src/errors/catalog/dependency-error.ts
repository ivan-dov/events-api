import { ConflictError } from '../conflict.ts';
import { NetworkError } from '../network-error.ts';

export class DependencyError extends NetworkError {
    public statusCode = 409;

    constructor(conflictError: ConflictError) {
        super('External dependency found', conflictError.message, {
            cause: conflictError,
        });
    }
}
