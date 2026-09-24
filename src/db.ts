import initKnex from 'knex';
import { types } from 'pg';
import config from '../knexfile.js';
import { env } from './env';

types.setTypeParser(types.builtins.DATE, (value) => value);

export const knex = initKnex(config[env.NODE_ENV]);
