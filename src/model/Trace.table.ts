import { MergingObject } from "../tools/Logger";
import PostreSql from "../tools/Database/PostgreSql";
import { DbTable } from "../tools/Database/PostgreSql/DbTable";
import { TraceChangeLenght, TraceEntity, TraceFunctionLenght, TraceItemIdLenght, TraceTableLenght } from "../app/api/trace/trace.entity";
import { SchemaTables } from "./SchemaTables";

export default class Trace extends DbTable<TraceEntity> {

    constructor() {
        super({
            name: SchemaTables.Trace,
            columns: [{
                name: "id",
                default: "nextval('trace_id_seq'::regclass)",
                type: "integer",
                notNull: true
            },
            {
                name: "date",
                type: "timestamp with time zone NOT NULL DEFAULT now()",
                notNull: true
            },
            {
                name: "userId",
                type: "integer",
                notNull: false
            },
            {
                name: "action",
                type: "character varying(6)", // "insert", "update", "delete", "forget"
                notNull: true
            },
            {
                name: "type",
                type: "character varying(4)", // "html", "sql"
                notNull: true
            },
            {
                name: "function",
                type: `character varying(${TraceFunctionLenght})`,
                notNull: true
            },
            {
                name: "table",
                type: `character varying(${TraceTableLenght})`,
                notNull: true
            },
            {
                name: "itemId",
                type: `character varying(${TraceItemIdLenght})`,
                notNull: true
            },
            {
                name: "change",
                type: `character varying(${TraceChangeLenght})`,
                notNull: true
            },
            ],
            constraints: ["CONSTRAINT trace_pkey PRIMARY KEY (id)",
                `CONSTRAINT trace_fkey_user FOREIGN KEY ("userId")
                    REFERENCES "user" (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE CASCADE`,
            ],
            indexes: [
                {
                    name: "trace_idx_user",
                    unique: false,
                    on: `"trace" USING btree ("userId" ASC)`
                }
            ]
        }
        );
    }

    public async create(route: MergingObject) {
        const seqCreate = `CREATE SEQUENCE IF NOT EXISTS trace_id_seq
            INCREMENT 1
            START 1
            MINVALUE 1
            MAXVALUE 2147483647
            CACHE 1;`;
        await PostreSql.query(route, seqCreate);

        await super.create(route);

        const seqOwnedBy = `ALTER SEQUENCE trace_id_seq
            OWNED BY "trace".id;`;
        await PostreSql.query(route, seqOwnedBy);
    }

}