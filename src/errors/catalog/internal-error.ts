import { NetworkError } from '../network-error';

export class InternalError extends NetworkError {
    public statusCode = 500;

    constructor(message = 'Unknown error', options?: ErrorOptions) {
        super('Internal error occurred', message, options);
    }
}
