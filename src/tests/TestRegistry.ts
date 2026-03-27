import assert from "assert";
import RegistryService from "../app/api/registry/registry.service";
import { Database } from "../model/Database";
import { SeedUserEmail } from "../seed/SeedUsers";
import { Log, TestNotAroute } from "../tools/Logger";

const serviceRegistry = new RegistryService();

const TestRegistry = async () => {
    const route0 = TestNotAroute(0, "TestRegistry");
    const registries = await Database.Registry.selectMany(route0, "");
    assert.ok(registries.length > 0, "No registry in Database");
    registries.forEach((registry) => Log.log(route0, JSON.stringify(registry)));

    const users = await Database.User.selectMany(route0, "", undefined, "ORDER BY profile");
    assert.ok(users.length > 0, "No users in Database");
    const seedUser = users.find((u) => u.email===SeedUserEmail);
    assert.ok(!!seedUser, "No users in Database");

    const registriesLoaded = await serviceRegistry.load(route0, seedUser);
    assert.ok(registriesLoaded.length > 0, "serviceRegistry.load");
    assert.equal(registriesLoaded[0].url, registries[0].url, "serviceRegistry.load");

    Log.log(route0, `✅ TestRegistry Ok!`);
}

export default TestRegistry;