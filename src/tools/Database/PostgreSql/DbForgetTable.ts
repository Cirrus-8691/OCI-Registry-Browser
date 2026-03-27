import { MergingObject } from "../../Logger";
import { DbTable, Index } from "./DbTable";
import { PoolClient, QueryConfigValues, QueryResult } from "pg";
import PostreSql, { DbRow, KnownColumnDataType } from "../PostgreSql";
import { randomUUID } from "crypto";

export interface DbForgetRow extends DbRow {
    forgetAt?: Date | undefined;
}

export class DbForgetTable<Entity extends DbForgetRow> extends DbTable<Entity> {

    public async create(route: MergingObject) {
        this.schema.columns.push({
            name: "forgetAt",
            type: "timestamp with time zone",
            notNull: false
        });
        await super.create(route);
    }

    public async forget(route: MergingObject, entity: Entity, transactionPoolClient?: PoolClient): Promise<Entity | undefined> {
        if (!entity.id) {
            return undefined;
        }
        let updateQuery = `UPDATE "${this.schema.name}"\n`;
        updateQuery += `SET "forgetAt"=now(), ` + 
        this.schema.indexes?.filter((index: Index) => index.forgetableColumn)
            .map((index: Index) => `"${index.forgetableColumn}"='${randomUUID()}'`) + "\n"
        updateQuery += `WHERE id=$1\n`
        const values = [entity.id];
        let result;
        const traceEntity = this.prepareTrace(route, "forget", entity);
        if (transactionPoolClient) {
            result = await transactionPoolClient.query(updateQuery, values);
            this.saveTrace(route, transactionPoolClient, traceEntity);
        }
        else {
            result = await PostreSql.instance(route).transaction<QueryResult>(async (transactionPoolClient: PoolClient) => {
                const result = await transactionPoolClient.query(updateQuery, values);
                this.saveTrace(route, transactionPoolClient, traceEntity);
                return result;
            });
        }
        return result && result.rowCount ? { ...result.rows[0] } : undefined;
    }

    protected async _select(route: MergingObject, request: string, values?: QueryConfigValues<(KnownColumnDataType | (KnownColumnDataType[]))[]>, orderByLimit?: string, transactionPoolClient?: PoolClient) {
        if (request.toUpperCase().includes(" WHERE ")) {
            request += ` AND "${this.schema.name}"."forgetAt" is NULL `
        }
        else {
            request += ` WHERE "${this.schema.name}"."forgetAt" is NULL `
        }
        return await super._select(route, request, values, orderByLimit, transactionPoolClient);
    }
}