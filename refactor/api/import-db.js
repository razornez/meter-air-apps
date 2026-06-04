const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const [,, host, port, user, password, database] = process.argv;

async function run() {
  console.log('Connecting to Railway MySQL...');
  const conn = await mysql.createConnection({
    host, port: Number(port), user, password, database,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true,
  });

  console.log('Reading backup file...');
  let sql = fs.readFileSync(path.join(__dirname, 'meterair_backup.sql'), 'utf8');

  // Fix MariaDB → MySQL 8.0 syntax incompatibilities
  sql = sql
    .replace(/DEFAULT curdate\(\)/gi, 'DEFAULT NULL')
    .replace(/DEFAULT current_timestamp\(\)/gi, 'DEFAULT CURRENT_TIMESTAMP')
    .replace(/ON UPDATE current_timestamp\(\)/gi, 'ON UPDATE CURRENT_TIMESTAMP')
    .replace(/DEFAULT current_time\(\)/gi, 'DEFAULT NULL')
    .replace(/DEFAULT current_date\(\)/gi, 'DEFAULT NULL')
    .replace(/`ENGINE=InnoDB[^;]*ROW_FORMAT=DYNAMIC/gi, match => match)
    .replace(/\bVISIBLE\b/gi, '')
    .replace(/\bINVISIBLE\b/gi, '');

  console.log('Importing... (tunggu ~30 detik)');
  await conn.query(sql);
  await conn.end();
  console.log('SELESAI! Database berhasil diimport ke Railway.');
}

run().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
