import assert from "assert";
import UserService from "../app/api/user/user.service";
import { Database } from "../model/Database";
import { Log, TestNotAroute } from "../tools/Logger";
import { SeedUserEmail, SeedUserPassword } from "../seed/SeedUsers";
import { UserConnected } from "@/app/api/user/entites/user.entity";

const serviceUser = new UserService();

const TestAccount = async () => {
    const route0 = TestNotAroute(0, "TestAccount");
    const users = await Database.User.selectMany(route0, "", undefined, "ORDER BY profile");
    assert.ok(users.length > 0, "No users in Database");
    users.forEach((user) => Log.log(route0, JSON.stringify(user)));
    assert.equal(users[2].email, SeedUserEmail, "No users in Database");

    const userInfo = await serviceUser.signin(route0, {
        email: SeedUserEmail,
        password: SeedUserPassword
    })
    if (!userInfo) {
        assert.fail("checkSignin failed");
    }
    assert.equal(userInfo.email, SeedUserEmail, "checkSignin failed");

    const tokens = await serviceUser.createTokens(route0, userInfo);
    if (!tokens) {
        assert.fail("createTokens failed");
    }
    assert.notEqual(tokens.auth, "", "tokens.auth failed");
    assert.notEqual(tokens.renew, "", "tokens.renew failed");

    const userFromToken = UserService.extractUserFromToken(tokens.auth);
    if (!userFromToken) {
        assert.fail("extractUserFromToken(userFromToken) failed");
    }
    assert.equal(userFromToken.email, SeedUserEmail, "checkToken(userFromToken) failed");

    const notAuser = UserService.extractUserFromToken("notAToken");
    if (notAuser) {
        assert.fail("extractUserFromToken(notAToken) failed");
    }
    const tokensUser: UserConnected = await serviceUser.renewToken(route0, tokens.renew);
    assert.notEqual(tokensUser.tokens.auth, "", "newTokens.auth failed");
    assert.notEqual(tokensUser.tokens.renew, "", "newTokens.renew failed");

    const newUserFromToken = UserService.extractUserFromToken(tokensUser.tokens.auth);
    if (!newUserFromToken) {
        assert.fail("checkToken(newUserFromToken) failed");
    }
    assert.equal(newUserFromToken.email, SeedUserEmail, "checkToken(newUserFromToken) failed");

    // assert.throws(async ()=> {
    //     await serviceAccount.renewToken("notAToken");
    // }, Error);

    await serviceUser.signout(route0, tokens.renew, userInfo);
    // assert.throws(async ()=> {
    //     await serviceAccount.signout(tokens.auth);
    // }, Error);

    Log.log(route0, `✅ TestAccount Ok!`);
};

export default TestAccount;