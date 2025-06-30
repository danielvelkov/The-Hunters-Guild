#! /usr/bin/env node

import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import os from 'os';
import readline from 'readline';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import { pipeline } from 'node:stream/promises';
const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getFirstLine(pathToFile) {
  const readable = fs.createReadStream(pathToFile);
  const reader = readline.createInterface({ input: readable });
  const line = await new Promise((resolve) => {
    reader.on('line', (line) => {
      reader.close();
      resolve(line);
    });
  });
  readable.close();
  return line;
}

const DB_NAME = process.env.DB_NAME || 'wilds_data';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
const DB_PORT = process.env.DB_PORT || 5432;
const isLocal = DB_HOST === 'localhost';

const client = new Client({
  connectionString: `postgresql://${DB_USER}:${encodeURIComponent(
    DB_PASSWORD
  )}@${DB_HOST}:${+DB_PORT}/${DB_NAME}`,
  ssl: isLocal ? false : { rejectUnauthorized: false }, // if using something like Neon serverless PG
});

const loadCSVfunc = fs.readFileSync('db/utils/load-csv-file.sql').toString();
const hex2decFunc = fs.readFileSync('db/utils/hex-to-dec.sql').toString();
const huntingQuestSchemaQuery = fs.readFileSync('db/schema.sql').toString();
const setStatusIconsNamesSQL = fs
  .readFileSync(path.join(__dirname, 'manual-seed/updateStatusIconsNames.sql'))
  .toString();
const setTablesPrimaryKeys = fs
  .readFileSync(path.join(__dirname, 'manual-seed/setTablesPrimaryKeys.sql'))
  .toString();
const triggersSetupQuery = fs
  .readFileSync(path.join(__dirname, 'triggers.sql'))
  .toString();

const csvDir = path.join(__dirname, '../data/csv');
const csvFiles = fs.readdirSync(csvDir);

// this dir holds the CSVs for postgres to access them because only there it has permission
const tempDir = path.join(os.tmpdir(), 'hunters-guild-wilds-data');
console.log('tmp dir created:', tempDir);
fs.mkdirSync(tempDir, { recursive: true });

async function seed() {
  await client.connect();

  try {
    await client.query('BEGIN');
    await client.query(loadCSVfunc);
    await client.query(hex2decFunc);

    console.log('adding game data...');

    for (const csv of csvFiles) {
      const filePath = path.join(csvDir, csv);
      const tempFilePath = path.join(tempDir, csv);

      const firstLine = await getFirstLine(filePath);
      const columnCount = firstLine.split(',').length;
      const tableName = path.parse(filePath).name;

      fs.copyFileSync(filePath, tempFilePath);
      console.log('File copied to temp:', tempFilePath);

      if (isLocal)
        await client.query('Select * from load_csv_file($1, $2, $3);', [
          tableName,
          tempFilePath,
          columnCount,
        ]);
      else await streamCSVtoDB(client, tempFilePath, tableName);

      fs.unlinkSync(tempFilePath);
      console.log('Temp File deleted after use');
    }

    console.log('setting primary keys to some imported tables...');
    await client.query(setTablesPrimaryKeys);

    // no references for some icons anywhere, so they're manually added
    await client.query(setStatusIconsNamesSQL);

    console.log('adding web app tables/enums related to hunting quest');
    await client.query(huntingQuestSchemaQuery);

    console.log('adding triggers functions');
    const triggerDir = path.join(__dirname, 'triggers');
    const files = await fsp.readdir(triggerDir, { withFileTypes: true });

    for (const file of files) {
      if (file.isFile()) {
        const sql = await fsp.readFile(
          path.join(triggerDir, file.name),
          'utf-8'
        );
        await client.query(sql);
      }
    }

    await client.query(triggersSetupQuery);

    await client.query('COMMIT');
    console.log('done');
  } catch (err) {
    console.error('seed failed:', err);
    // An error occurred somewhere so try to rollback
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('ROLLBACK Error: %s', rollbackErr);
    }
    throw err;
  } finally {
    await client.end();
  }
}

async function streamCSVtoDB(client, csvFilePath, tableName) {
  const updatedTableName = tableName.toLowerCase().trim().replace(/ /g, '_');

  // Read the first few lines of CSV to infer column structure
  const csvContent = fs.readFileSync(csvFilePath, 'utf8');
  const lines = csvContent.split('\n');
  const headers = lines[0]
    .split(',')
    .map((header) => header.trim().replace(/"/g, ''));

  const reservedKeywords = ['window'];

  // Create table with generic columns
  const columnDefinitions = headers
    .map((header) => {
      // Clean column name to be SQL-safe
      const cleanName = header
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_');
      return `${
        reservedKeywords.includes(cleanName) || cleanName.includes('&')
          ? `"${cleanName}"`
          : cleanName
      } TEXT`;
    })
    .join(', ');

  const createTableQuery = `
      DROP TABLE IF EXISTS ${
        updatedTableName.includes('&')
          ? `"${updatedTableName}"`
          : updatedTableName
      };
      CREATE TABLE ${
        updatedTableName.includes('&')
          ? `"${updatedTableName}"`
          : updatedTableName
      } (
        ${columnDefinitions}
      );
    `;

  console.log(`Creating table ${updatedTableName}`);
  await client.query(createTableQuery);

  console.log('Starting CSV import...');

  const copyQuery = `COPY ${
    updatedTableName.includes('&') ? `"${updatedTableName}"` : updatedTableName
  }(${headers
    .map((h) => {
      const cleanName = h
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_');
      return `${
        reservedKeywords.includes(cleanName) || cleanName.includes('&')
          ? `"${cleanName}"`
          : cleanName
      }`;
    })
    .join(', ')}) FROM STDIN WITH (FORMAT csv, HEADER true, DELIMITER ',')`;

  const ingestStream = client.query(copyFrom(copyQuery));
  const sourceStream = fs.createReadStream(csvFilePath);

  return pipeline(sourceStream, ingestStream);
}

seed();
