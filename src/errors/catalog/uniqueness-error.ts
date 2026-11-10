import { ConflictError } from '../conflict.ts';
import { NetworkError } from '../network-error.ts';

export class UniquenessError extends NetworkError {
    public statusCode = 409;

    constructor(conflictError: ConflictError) {
        super('Matching record already exists', conflictError.message, {
            cause: conflictError,
        });
    }
}
