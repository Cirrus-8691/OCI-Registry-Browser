import { MergingObject } from "../tools/Logger";
import { DbTable } from "../tools/Database/PostgreSql/DbTable";
import { SchemaTables } from "./SchemaTables";
import PostreSql from "../tools/Database/PostgreSql";
import { RepositoryEntity } from "@/app/api/repository/repository.entity";

const sequenceName = "repo_id_seq";

export default class RepositoryRegistry extends DbTable<RepositoryEntity> {
    constructor() {
        super({
            name: SchemaTables.Repository,
            columns: [
                {
                    name: "id",
                    type: "integer",
                    default: `nextval('${sequenceName}'::regclass)`,
                    notNull: true,
                },
                {
                    name: "registryId",
                    type: "integer",
                    notNull: true,
                },
                {
                    name: "name",
                    type: `character varying(256)`,
                    notNull: true,
                },
                {
                    name: "tag",
                    type: `character varying(256)`,
                    notNull: true,
                },
                {
                    name: "digestV2",
                    type: `character varying(92)`, // len for "sha256:b5b2b2c507a0944348e0303114d8d93aaa"... 71 caracteres
                    notNull: true,
                },
                {
                    name: "rating",
                    type: "integer",
                    notNull: false,
                },
                {
                    name: "description",
                    type: `character varying(256)`,
                    notNull: false,
                },
                {
                    name: "licenses",
                    type: `character varying(32)`, // [AFL-3.0, Apache-2.0, BSD-3-Clause-Clear, ... Unlicense]
                    notNull: false,
                },
                {
                    name: "os",
                    type: `character varying(32)`, // [linux,windows,freebsd]
                    notNull: false,
                },
                {
                    name: "architecture",
                    type: `character varying(16)`, // [arm,arm64,ppc64,s390x,ppc64le,386,amd64,loong64,riscv64]
                    notNull: false,
                },
                {
                    name: "created",
                    type: `character varying(36)`, // "2025-09-24T23:05:38+02:00" - 2025-11-24T09:22:33.118684314+01:00
                    notNull: false,
                },
                {
                    name: "size",
                    type: "integer",
                    notNull: false,
                },
            ],
            constraints: ["CONSTRAINT repo_pkey PRIMARY KEY (id)"],
            indexes: [
                {
                    name: "repo_idx_complex",
                    unique: true,
                    on: `"${SchemaTables.Repository}" USING btree ("registryId", name, tag)`,
                    forgetableColumn: "name",
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
            OWNED BY "${SchemaTables.Repository}".id;`;
        await PostreSql.query(route, seqOwnedBy);
    }
}
