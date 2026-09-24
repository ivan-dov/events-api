import type { Knex } from 'knex';

declare const config: Record<
    'development' | 'test',
    Knex.Config & { connection: string }
>;

export = config;
