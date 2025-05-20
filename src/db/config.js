#! /usr/bin/env node

require('dotenv').config();
const { Client } = require('pg');

const DB_NAME = process.env.DB_NAME || 'wilds_data';

const PG_NAME = process.env.PG_NAME;
const PG_USER = process.env.PG_USER;
const PG_HOST = process.env.PG_HOST;
const PG_PASSWORD = process.env.PG_PASSWORD;
const PG_PORT = process.env.PG_PORT;

async function main() {
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev)
    return console.log(
      'In production environment - skipping database creation.'
    );

  const client = new Client({
    host: PG_HOST,
    user: PG_USER,
    password: PG_PASSWORD,
    database: PG_NAME,
    port: PG_PORT,
  });

  await client.connect();

  const res = await client.query(
    `SELECT datname FROM pg_catalog.pg_database WHERE datname = '${DB_NAME}'`
  );

  if (res.rowCount === 0) {
    console.log(`${DB_NAME} database not found, creating it.`);
    await client.query(`CREATE DATABASE "${DB_NAME}";`);
    console.log(`created database ${DB_NAME}.`);
  } else {
    console.log(`${DB_NAME} database already exists.`);
  }

  await client.end();
}

main();
