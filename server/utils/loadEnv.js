const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

/**
 * Loads environment variables from local configuration files.
 * Priority (highest to lowest):
 * 1. Pre-existing process.env variables (deployment/system variables are never overwritten)
 * 2. .env.local (local developer overrides)
 * 3. .env (standard environment file)
 *
 * Supports running from repository root or server subdirectory.
 */
function loadEnv() {
  const rootDir = path.resolve(__dirname, '../..');
  const serverDir = path.resolve(__dirname, '..');
  const cwd = process.cwd();

  const candidatePaths = [
    path.join(rootDir, '.env.local'),
    path.join(serverDir, '.env.local'),
    path.join(cwd, '.env.local'),
    path.join(rootDir, '.env'),
    path.join(serverDir, '.env'),
    path.join(cwd, '.env'),
  ];

  const loadedPaths = new Set();

  for (const envPath of candidatePaths) {
    const normalized = path.normalize(envPath);
    if (!loadedPaths.has(normalized) && fs.existsSync(normalized)) {
      dotenv.config({ path: normalized });
      loadedPaths.add(normalized);
    }
  }
}

// Execute immediately when required
loadEnv();

module.exports = { loadEnv };
