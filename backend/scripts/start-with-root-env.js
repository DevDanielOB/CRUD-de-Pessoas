const path = require('path');
const { spawn } = require('child_process');
const dotenv = require('dotenv');

const rootEnvPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: rootEnvPath });

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: process.env,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Comando falhou: ${command} ${args.join(' ')} (exit ${code ?? 'null'})`));
    });
  });
}

async function start() {
  try {
    await run('npx', ['prisma', 'db', 'push']);
    await run('nest', ['start']);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

start();
