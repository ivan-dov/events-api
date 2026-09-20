import initKnex from "knex";
import config from "../knexfile.js";

export const knex = initKnex(config);
