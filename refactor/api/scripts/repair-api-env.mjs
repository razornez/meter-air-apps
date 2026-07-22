import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const API_ENV = path.resolve(process.cwd(), '.env');
const LARAVEL_ENV = '/var/www/meter-air/.env';

function parseEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const result = {};
  const text = fs.readFileSync(file, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).replace(/^export\s+/, '').trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function serializeEnv(env) {
  const preferred = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'PORT',
    'NODE_ENV',
    'CORS_ORIGIN',
    'THROTTLE_LIMIT',
    'THROTTLE_TTL',
    'UPLOAD_DIR',
    'AUTH_UPGRADE_PLAINTEXT',
    'WATER_PRODUCT_BARCODE',
    'DEMO_TENANT_CODE',
    'DEMO_SOURCE_TENANT_CODE',
    'MIDTRANS_MERCHANT_ID',
    'MIDTRANS_SERVER_KEY',
    'MIDTRANS_CLIENT_KEY',
    'MIDTRANS_IS_PRODUCTION',
    'SEED_SECRET',
  ];
  const keys = [...preferred, ...Object.keys(env).filter((key) => !preferred.includes(key)).sort()];
  return keys
    .filter((key) => Object.prototype.hasOwnProperty.call(env, key))
    .map((key) => `${key}=${env[key] ?? ''}`)
    .join('\n') + '\n';
}

const api = parseEnvFile(API_ENV);
const laravel = parseEnvFile(LARAVEL_ENV);

const changed = [];
function setFromLaravel(apiKey, laravelKey = apiKey, fallback = '') {
  const next = laravel[laravelKey] || fallback;
  if (!next) return;
  if (api[apiKey] !== next) {
    api[apiKey] = next;
    changed.push(apiKey);
  }
}

setFromLaravel('DB_HOST', 'DB_HOST', '127.0.0.1');
setFromLaravel('DB_PORT', 'DB_PORT', '3306');
setFromLaravel('DB_DATABASE', 'DB_DATABASE', 'meterair');
setFromLaravel('DB_USERNAME', 'DB_USERNAME', laravel.DB_USER || 'meterair_user');
setFromLaravel('DB_PASSWORD', 'DB_PASSWORD');

if (!api.JWT_SECRET || api.JWT_SECRET.includes('GANTI') || api.JWT_SECRET.includes('ganti')) {
  api.JWT_SECRET = crypto.randomBytes(48).toString('base64');
  changed.push('JWT_SECRET');
}
if (!api.JWT_EXPIRES_IN) api.JWT_EXPIRES_IN = '12h';
api.PORT = '4010';
api.NODE_ENV = 'production';
if (!api.AUTH_UPGRADE_PLAINTEXT) api.AUTH_UPGRADE_PLAINTEXT = 'true';
if (!api.WATER_PRODUCT_BARCODE) api.WATER_PRODUCT_BARCODE = 'B1502200001';
if (!api.DEMO_TENANT_CODE) api.DEMO_TENANT_CODE = 'DEMO';
if (!api.DEMO_SOURCE_TENANT_CODE) api.DEMO_SOURCE_TENANT_CODE = 'BUMDES-KRK';

fs.writeFileSync(API_ENV, serializeEnv(api), { mode: 0o600 });
try {
  fs.chownSync(API_ENV, 33, 33);
} catch {
  // www-data is uid/gid 33 on Ubuntu/Debian; keep current owner if unavailable.
}

console.log(`API env repaired; updated keys: ${changed.length ? changed.join(',') : 'none'}`);
