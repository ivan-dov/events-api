import { RequestHandler } from 'express';
import { NotFoundError } from './catalog/not-found-error.ts';

export const handleNotFound: RequestHandler = (req) => {
    throw new NotFoundError(
        `${req.method} ${req.path} does not match any existing endpoint.`,
    );
};
