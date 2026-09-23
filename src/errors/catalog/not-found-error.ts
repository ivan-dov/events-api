import { NetworkError } from '../network-error';

export class NotFoundError extends NetworkError {
    public statusCode = 404;

    constructor(message: string, options?: ErrorOptions) {
        super('Requested resource is not found', message, options);
    }
}
