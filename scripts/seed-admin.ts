import 'dotenv/config';
import { seedAdmin } from '../lib/seed-admin';

seedAdmin()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
