export abstract class NetworkError extends Error {
    public abstract statusCode: number;

    constructor(
        type: string,
        message = 'Unknown error',
        options?: ErrorOptions,
    ) {
        super(`${type}: ${message}`, options);
    }
}
