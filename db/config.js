#! /usr/bin/env node

require('dotenv').config();
const { Client } = require('pg');

const DB_NAME = process.env.DB_NAME || 'wilds_data';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
const DB_PORT = process.env.DB_PORT || 5432;

async function main() {
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev)
    return console.log(
      'In production environment - skipping database creation.'
    );

  // NOTE: change this to match your default postgres db cluster config settings
  const client = new Client({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: 'postgres',
    port: 5432,
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
