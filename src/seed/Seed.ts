import * as dotenv from 'dotenv';

import { SeedUsers } from './SeedUsers';
import TestEnvSettings from '../tests/TestEnvSettings';
import PostreSql from '../tools/Database/PostgreSql';
import { SeedRegistries } from './SeedRegistries';
import { Log, TestNotAroute } from '../tools/Logger';
import { Database } from '../model/Database';
import { SeedUserRegistries } from './SeedUserRegistries';
import Redis from '../tools/Database/Redis';

export const Seed = async (): Promise<void> => {
  dotenv.config(({ path: ['.env.local', '.env'] }));
  try {
    const route0 = TestNotAroute(0, "seed");
    Log.log(route0, "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓");
    Log.log(route0, "┃                                     ┃");
    Log.log(route0, "┃      🌾 Seed Database Redis         ┃");
    Log.log(route0, "┃                                     ┃");
    Log.log(route0, "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛");
    
    TestEnvSettings();

    await Database.create(route0);

    const adminUserId = await SeedUsers();

    await SeedRegistries(adminUserId);
    await SeedUserRegistries(adminUserId);
    const route = TestNotAroute(adminUserId, "seed");
    Log.log(route, "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓");
    Log.log(route, "┃                                     ┃");
    Log.log(route, "┃    👋 Seed Database completed ✅    ┃");
    Log.log(route, "┃                                     ┃");
    Log.log(route, "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛");
  }
  catch (err: unknown) {
    console.error(err);
  }
  finally {
    PostreSql.close();
    Redis.close();
  }
}

Seed();


