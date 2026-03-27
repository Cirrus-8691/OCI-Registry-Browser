import { Log, MergingObject, TestNotAroute } from "../tools/Logger";

let testOk = false;

const StringExpected = (route: MergingObject, name: string, regex?: RegExp): void => {
    const value = process.env[name];
    if (value) {
        let ok = true;
        if (regex) {
            ok = regex.test(value);
        }
        if (ok) {
            Log.log(route, `🛃 ${name} ✅`);
        } else {
            testOk = false;
            Log.log(route, `🛑 ${name} 🚫 expecting: ${regex?.source}`);
        }
    } else {
        testOk = false;
        Log.log(route, `🛑 ${name} 🚫 undefined!`);
    }
};
const StringOrUndefinedExpected = (route: MergingObject, name: string, regex?: RegExp): void => {
    const value = process.env[name];
    if (value) {
        let ok = true;
        if (regex) {
            ok = regex.test(value);
        }
        if (ok) {
            Log.log(route, `🛃 ${name} ✅`);
        } else {
            testOk = false;
            Log.log(route, `🛑 ${name} \t 🚫 expecting: ${regex?.source}`);
        }
    } else {
        Log.log(route, `🛃 ${name} ✅`);
    }
};

const IntegerExpected = (route: MergingObject, name: string): void => {
    const valueStr = process.env[name];
    if (valueStr) {
        const value = Number.parseInt(valueStr);
        if (Number.isInteger(value) && !Number.isNaN(value)) {
            Log.log(route, `🛃 ${name} ✅`);
        } else {
            testOk = false;
            Log.log(route, `🛑 ${name} 🚫 expecting: Integer`);
        }
    } else {
        testOk = false;
        Log.log(route, `🛑 ${name} 🚫 undefined!`);
    }
};

const regexLongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^*]).{32,}$/;
const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^*]).{8,}$/;

// const regexSimplePassword =
//     process.env.NODE_ENV === "production"
//         ? /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/
//         : /^(?=.*[a-z])(?=.*\d).{6,}$/;

const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regexLogLevels = /^$|^INF$|^WRN$|^ERR$/;
const regexSslModes = /^$|^enable$|^disable$/;
const regexDeploymentType = /^$|^ONPREMISES$|^KUBERNETES$/;

export const TestProductionEnvSettings = (route: MergingObject) => {
  StringOrUndefinedExpected(route, "LOG_LEVEL", regexLogLevels);

  StringExpected(route, "PG_HOST");
  IntegerExpected(route, "PG_PORT");
  StringExpected(route, "PG_NAME");
  StringExpected(route, "PG_USER");
  StringExpected(route, "PG_PASS", regexPassword); // $ is a mess in .env
  StringExpected(route, "PG_SSLMODE", regexSslModes);

  StringExpected(route, "REDIS_HOST");
  IntegerExpected(route, "REDIS_PORT");
  StringExpected(route, "REDIS_PWD", regexPassword); // $ is a mess in .env
  IntegerExpected(route, "REDIS_DB");

  StringExpected(route, "JWT_SECRET_KEY", regexLongPassword);
  StringExpected(route, "APPLICATION_DEPLOYMENT", regexDeploymentType);
}

const TestEnvSettings = () => {
    testOk = true;
    const route = TestNotAroute(0, "TestEnvSettings");
    TestProductionEnvSettings(route);

    // Admin user to seed
    StringExpected(route, "SEED_ADMIN_NAME", regexEmail);
    StringExpected(route, "SEED_ADMIN_PASS", regexPassword);

    if (!testOk) {
        throw new Error("Bad EnvSettings...");
    }
};

export default TestEnvSettings;