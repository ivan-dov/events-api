import type { Knex } from 'knex';

const base: Omit<Knex.Config, 'connection'> = {
    client: 'pg',
    migrations: { directory: './migrations', extension: 'ts' },
    seeds: { directory: './seeds', extension: 'ts' },
};

export default {
    development: {
        ...base,
        connection:
            process.env.DATABASE_URL ??
            'postgres://postgres:pw@localhost:5432/events',
        debug: true,
    },
    test: {
        ...base,
        connection:
            process.env.TEST_DATABASE_URL ??
            'postgres://postgres:pw@localhost:5432/events_test',
    },
} satisfies Record<string, Knex.Config>;
