import { MergingObject } from "../tools/Logger";
import { UserEntity } from "../app/api/user/entites/user.entity";
import PostreSql from "../tools/Database/PostgreSql";
import { DbForgetTable } from "../tools/Database/PostgreSql/DbForgetTable";
import { SchemaTables } from "./SchemaTables";

const sequenceName = "user_id_seq";

export default class User extends DbForgetTable<UserEntity> {
    constructor() {
        super({
            name: SchemaTables.User,
            columns: [
                {
                    name: "id",
                    type: "integer",
                    default: `nextval('${sequenceName}'::regclass)`,
                    notNull: true,
                },
                {
                    name: "email",
                    type: "character varying(128)",
                    notNull: true,
                },
                {
                    name: "desc",
                    type: "character varying(64)",
                    notNull: false,
                },
                {
                    name: "hashPwd",
                    type: "character varying(256)",
                    notNull: true,
                },
                {
                    name: "profile",
                    type: "character varying(12)",
                    notNull: true,
                },
                {
                    name: "active",
                    type: "character varying(16)",
                    notNull: true,
                },
            ],
            constraints: ["CONSTRAINT user_pkey PRIMARY KEY (id)"],
            indexes: [
                {
                    name: "user_idx_email",
                    unique: true,
                    on: `"${SchemaTables.User}" USING btree (email ASC)`,
                    forgetableColumn: "email",
                },
            ],
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
            OWNED BY "${SchemaTables.User}".id;`;
        await PostreSql.query(route, seqOwnedBy);
    }
}
