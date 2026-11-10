import initKnex from 'knex';
import { types } from 'pg';
import config from '../knexfile.ts';
import { env } from './env.ts';

types.setTypeParser(types.builtins.DATE, (value) => value);

export const knex = initKnex(config[env.NODE_ENV]);
