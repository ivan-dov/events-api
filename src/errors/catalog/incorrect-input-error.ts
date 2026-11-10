import { NetworkError } from '../network-error.ts';

export class IncorrectInputError extends NetworkError {
    public statusCode = 400;

    constructor(message: string, options?: ErrorOptions) {
        super('Received incorrect input', message, options);
    }
}
