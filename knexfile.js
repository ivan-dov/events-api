/** @type {Omit<import("knex").Knex.Config, "connection">} */
const base = {
    client: 'pg',
    migrations: { directory: './migrations', extension: 'ts' },
    seeds: { directory: './seeds', extension: 'ts' },
};

module.exports = {
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
};
