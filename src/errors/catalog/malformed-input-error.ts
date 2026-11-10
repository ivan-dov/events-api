import { NetworkError } from '../network-error.ts';

export class MalformedInputError extends NetworkError {
    public statusCode = 400;

    constructor(message: string, options?: ErrorOptions) {
        super('Received malformed input', message, options);
    }
}
