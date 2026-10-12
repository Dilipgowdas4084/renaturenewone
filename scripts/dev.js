const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('\x1b[32m%s\x1b[0m', '🌱 Starting Renature backend and frontend development servers...');

const serverProc = spawn('node', ['server/server.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
});

const clientProc = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve(rootDir, 'client'),
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  try {
    if (serverProc && !serverProc.killed) {
      if (isWin) {
        spawn('taskkill', ['/pid', serverProc.pid.toString(), '/f', '/t']);
      } else {
        serverProc.kill('SIGTERM');
      }
    }
  } catch {}
  try {
    if (clientProc && !clientProc.killed) {
      if (isWin) {
        spawn('taskkill', ['/pid', clientProc.pid.toString(), '/f', '/t']);
      } else {
        clientProc.kill('SIGTERM');
      }
    }
  } catch {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
