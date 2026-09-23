import { ZodError } from 'zod';
import { NetworkError } from '../network-error';

export class ValidationError extends NetworkError {
    public statusCode = 400;

    constructor(zodError: ZodError) {
        super(
            'Input validation error',
            zodError.issues
                .map((issue) => `${issue.path.join('.')} (${issue.message})`)
                .join(', '),
            { cause: zodError },
        );
    }
}
