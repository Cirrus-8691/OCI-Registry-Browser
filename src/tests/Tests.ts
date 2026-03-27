import * as dotenv from 'dotenv';
import PostreSql from '../tools/Database/PostgreSql';
import Redis from '../tools/Database/Redis';

import TestEnvSettings from './TestEnvSettings';
import TestDatabase from './TestDatabase';
import TestUser from './TestUser';
import TestRegistry from './TestRegistry';
import { Log, TestNotAroute } from '../tools/Logger';

const Tests = async (): Promise<void> => {

  dotenv.config(({ path: ['.env.local', '.env'] }));

  const route0 = TestNotAroute(0, "Tests");
  Log.log(route0, `🚀 Starting all tests...`);

  TestEnvSettings();

  await TestDatabase();
  await TestUser();
  await TestRegistry();

  // Finaly
  PostreSql.close();
  Redis.close();

  
  Log.log(route0, `✅ All Ok!`);
}

Tests();

