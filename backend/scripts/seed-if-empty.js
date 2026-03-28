const mongoose = require('mongoose');
const { execFileSync } = require('node:child_process');

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('[seed-if-empty] MONGODB_URI not set. Skipping seed check.');
    return;
  }

  let connection;
  try {
    connection = await mongoose.createConnection(mongoUri).asPromise();
    const simulationCount = await connection
      .collection('simulations')
      .countDocuments({});

    if (simulationCount > 0) {
      console.log(
        `[seed-if-empty] Seed skipped. Found ${simulationCount} simulation(s).`,
      );
      return;
    }

    console.log('[seed-if-empty] No simulations found. Running seed...');
    execFileSync('node', ['dist/db/seed.js'], {
      stdio: 'inherit',
      env: process.env,
    });
    console.log('[seed-if-empty] Seed completed.');
  } catch (error) {
    console.error('[seed-if-empty] Seed check failed:', error);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

void main();
