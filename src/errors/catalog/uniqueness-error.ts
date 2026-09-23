import { ConflictError } from '../conflict';
import { NetworkError } from '../network-error';

export class UniquenessError extends NetworkError {
    public statusCode = 409;

    constructor(conflictError: ConflictError) {
        super('Matching record already exists', conflictError.message, {
            cause: conflictError,
        });
    }
}
