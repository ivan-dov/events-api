import { NetworkError } from '../network-error';

export class IncorrectInputError extends NetworkError {
    public statusCode = 400;

    constructor(message: string, options?: ErrorOptions) {
        super('Received incorrect input', message, options);
    }
}
