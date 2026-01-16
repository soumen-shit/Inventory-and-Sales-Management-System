import 'dotenv/config';
import { AppDataSource } from './data-source';
import { seedRoles } from './seeders/role.seed';

async function runSeed() {
  try {
    await AppDataSource.initialize();
    await seedRoles();
    await AppDataSource.destroy();
    process.exit(1);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

void runSeed();
