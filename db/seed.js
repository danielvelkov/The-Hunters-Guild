#! /usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { Client } = require('pg');

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

const client = new Client({
  connectionString: `postgresql://${DB_USER}:${encodeURIComponent(
    DB_PASSWORD
  )}@${DB_HOST}:${+DB_PORT}/${DB_NAME}`,
});

const loadCSVfunc = fs.readFileSync('db/utils/load-csv-file.sql').toString();

const csvDir = path.join(__dirname, '../data/csv');
const csvFiles = fs.readdirSync(csvDir);

// this dir holds the CSVs for postgres to access them because only there it has permission
const tempDir = path.join(os.tmpdir(), 'huntersguild-wilds-data');
console.log('tmp dir created:', tempDir);
fs.mkdirSync(tempDir, { recursive: true });

async function seed() {
  await client.connect();

  try {
    await client.query('BEGIN');
    await client.query(loadCSVfunc);

    console.log('seeding...');

    for (const csv of csvFiles) {
      const filePath = path.join(csvDir, csv);
      const tempFilePath = path.join(tempDir, csv);

      const firstLine = await getFirstLine(filePath);
      const columnCount = firstLine.split(',').length;
      const tableName = path.parse(filePath).name;

      fs.copyFileSync(filePath, tempFilePath);
      console.log('File copied to temp:', tempFilePath);

      await client.query('Select * from load_csv_file($1, $2, $3);', [
        tableName,
        tempFilePath,
        columnCount,
      ]);

      fs.unlinkSync(tempFilePath);
      console.log('Temp File deleted after use');
    }

    // no references for some icons anywhere, so they're manually added
    const setStatusIconsNamesSQL = fs.readFileSync(
      'manual-seed/updateStatusIconsNames.sql'
    );
    await client.query(setStatusIconsNamesSQL);

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

seed();
