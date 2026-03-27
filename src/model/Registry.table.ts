import { RegistryEntity, RegistryNameLenght } from "../app/api/registry/registry.entity";
import PostreSql from "../tools/Database/PostgreSql";
import { DbTable } from "../tools/Database/PostgreSql/DbTable";
import { MergingObject } from "../tools/Logger";
import { SchemaTables } from "./SchemaTables";

const sequenceName = "oci_id_seq";

export default class Registry extends DbTable<RegistryEntity> {
    constructor() {
        super({
            name: SchemaTables.Registry,
            columns: [{
                name: "id",
                type: "integer",
                default: `nextval('${sequenceName}'::regclass)`,
                notNull: true
            },
            {
                name: "name",
                type: `character varying(${RegistryNameLenght})`,
                notNull: true
            },
            {
                name: "type",
                type: `character varying(6)`,
                notNull: true
            },
            {
                name: "path",
                type: `character varying(128)`,
                notNull: false
            },
            {
                name: "excludePaths",
                type: `character varying(1024)`,
                notNull: false
            },
            {
                name: "url",
                type: "character varying(2048)",
                notNull: true
            },
            {
                name: "gnUrl",
                type: "character varying(2048)",
                notNull: false
            },
            {
                name: "timeout",
                type: "integer",
                notNull: false
            },
            {
                name: "user",
                type: "character varying(32)",
                notNull: false
            },
            {
                name: "iconUrl",
                type: "character varying(2048)",
                notNull: false
            },
            ],
            constraints: ["CONSTRAINT oci_pkey PRIMARY KEY (id)"],
            indexes: [
                {
                    name: "registry_idx_name",
                    unique: true,
                    on: `"registry" USING btree (name ASC)`
                }
            ]
        }
        );
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
            OWNED BY "${SchemaTables.Registry}".id;`;
        await PostreSql.query(route, seqOwnedBy);
    }
}