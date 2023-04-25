const { Pool } = require('pg');
const { configservices } = require('../config/config');
require("dotenv").config();


// create a connection pool to the PostgreSQL database
const pool = new Pool({
    user: configservices.DB_USER,
    host: configservices.DB_HOST,
    database: configservices.DB_DATABASE,
    password: configservices.DB_PASSWORD,
    port: configservices.DB_PORT,
});

module.exports = pool;
