import initKnex, { type Knex } from 'knex';
import { Client } from 'pg';
import configs from '../knexfile.js';

type AppEnv = keyof typeof configs;

// Creating a database requires a connection to a different one.
const ADMIN_URL =
    process.env.ADMIN_DATABASE_URL ??
    'postgres://postgres:pw@localhost:5432/postgres';

const dbNameFrom = (connection: string) =>
    new URL(connection).pathname.slice(1);

async function ensureDatabase(name: string) {
    const client = new Client({ connectionString: ADMIN_URL });
    await client.connect();

    try {
        const { rowCount } = await client.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [name],
        );

        if (rowCount) {
            console.log(`database ${name} already exists`);
            return;
        }

        // CREATE DATABASE takes no bindings and no transaction.
        await client.query(`CREATE DATABASE "${name}"`);
        console.log(`created database ${name}`);
    } finally {
        await client.end();
    }
}

async function migrate(config: Knex.Config & { connection: string }) {
    const knex = initKnex(config);

    try {
        const [, files] = await knex.migrate.latest();
        console.log(
            `migrated ${dbNameFrom(config.connection)}: ${files.length} file(s)`,
        );
    } finally {
        await knex.destroy();
    }
}

export async function setupDatabases() {
    const envs: AppEnv[] = ['development', 'test'];

    for (const env of envs) {
        const config = configs[env];
        await ensureDatabase(dbNameFrom(config.connection));
        await migrate(config);
    }
}
