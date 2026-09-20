import initKnex from 'knex';
import config from '../knexfile.js';
import { types } from 'pg';

types.setTypeParser(types.builtins.DATE, (value) => value);

export const knex = initKnex(config);
