import { ConflictError } from '../conflict';
import { NetworkError } from '../network-error';

export class DependencyError extends NetworkError {
    public statusCode = 409;

    constructor(conflictError: ConflictError) {
        super('External dependency found', conflictError.message, {
            cause: conflictError,
        });
    }
}
