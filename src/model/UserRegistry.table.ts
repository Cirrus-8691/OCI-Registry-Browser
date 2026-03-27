import { MergingObject } from "../tools/Logger";
import { UserRegistryEntity } from "../app/api/user/entites/userRegistry.entity";
import { DbTable } from "../tools/Database/PostgreSql/DbTable";
import PostreSql from "../tools/Database/PostgreSql";
import { SchemaTables } from "./SchemaTables";

const sequenceName = "user_registry_seq";

export default class UserRegistry extends DbTable<UserRegistryEntity> {

    constructor() {
        super({
            name: SchemaTables.UserRegistry,
            columns: [{
                name: "id",
                type: "integer",
                default: `nextval('${sequenceName}'::regclass)`,
                notNull: true
            },
            {
                name: "userId",
                type: "integer",
                notNull: true
            },
            {
                name: "registryId",
                type: "integer",
                notNull: true
            }],
            constraints: [
                `CONSTRAINT user_registry_pkey PRIMARY KEY ("userId", "registryId")`,
                `CONSTRAINT user_registry_fkey_user FOREIGN KEY ("userId")
                    REFERENCES "user" (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE CASCADE`,
                `CONSTRAINT user_registry_fkey_registry FOREIGN KEY ("registryId")
                    REFERENCES "registry" (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE CASCADE`
            ],
            indexes: [
                {
                    name: "user_registry_idx_user",
                    unique: false,
                    on: `"user_registry" USING btree ("userId" ASC)`
                }
            ]
        });
    }

    public async create(route: MergingObject) {
        const seqCreate = `CREATE SEQUENCE IF NOT EXISTS ${sequenceName}
                INCREMENT 1
                START 1
                MINVALUE 1
                MAXVALUE 2147483647
                CACHE 1;`;
        await PostreSql.query(route, seqCreate);

        await super.create(route);

        const seqOwnedBy = `ALTER SEQUENCE ${sequenceName}
                OWNED BY user_registry.id;`;
        await PostreSql.query(route, seqOwnedBy);
    }
}