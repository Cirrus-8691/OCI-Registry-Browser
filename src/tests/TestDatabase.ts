import { Database } from "../model/Database";
import { Log, TestNotAroute } from "../tools/Logger";

const TestDatabase = async () => {
    const route0 = TestNotAroute(0, "TestDatabase");
    await Database.create(route0);
    Log.log(route0, `✅ TestDatabase Ok!`);
};

export default TestDatabase;