import initKnex from 'knex';
import configs from '../knexfile.js';
import { setupDatabases } from './setup-db.ts';

export type Step = {
    name: string;
    // update skips satisfied steps, setup runs all of them.
    isNeeded: () => Promise<boolean>;
    run: () => Promise<void>;
};

async function withDevKnex<T>(
    fn: (knex: ReturnType<typeof initKnex>) => Promise<T>,
) {
    const knex = initKnex(configs.development);

    try {
        return await fn(knex);
    } finally {
        await knex.destroy();
    }
}

export const steps: Step[] = [
    {
        name: 'create databases and run migrations',
        // No-op when up to date.
        isNeeded: async () => true,
        run: setupDatabases,
    },
    {
        name: 'seed the development database',
        // Never overwrite existing data.
        isNeeded: () =>
            withDevKnex(async (knex) => !(await knex('events').first())),
        run: () => withDevKnex(async (knex) => void (await knex.seed.run())),
    },
];

export async function runSteps(
    selected: Step[],
    { skipUnneeded = false } = {},
) {
    for (const [index, step] of selected.entries()) {
        const label = `[${index + 1}/${selected.length}] ${step.name}`;

        if (skipUnneeded && !(await step.isNeeded())) {
            console.log(`\n${label} — already done, skipping`);
            continue;
        }

        console.log(`\n${label}`);
        await step.run();
    }

    console.log('\ndone');
}

export function main(options?: { skipUnneeded?: boolean }) {
    runSteps(steps, options).catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}
