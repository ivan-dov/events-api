import { NetworkError } from '../network-error.ts';

export class InternalError extends NetworkError {
    public statusCode = 500;

    constructor(message = 'Unknown error', options?: ErrorOptions) {
        super('Internal error occurred', message, options);
    }
}
