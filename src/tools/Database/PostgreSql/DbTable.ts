import { PoolClient, QueryConfigValues, QueryResult } from "pg";
import PostreSql, { DbRow, KnownColumnDataType } from "../PostgreSql";
import { Log, MergingObject } from "../../Logger";
import { Action, TraceChangeLenght, TraceEntity } from "../../../app/api/trace/trace.entity";

export interface Column {
    name: string;
    type: string;
    default?: string;
    notNull: boolean;
}
export interface Index {
    name: string;
    unique: boolean;
    on: string;
    forgetableColumn?: string;
}
export interface DbTableSchema {
    name: string;
    columns: Column[];
    indexes?: Index[];
    constraints?: string[];
}

export class DbTable<Entity extends DbRow> {
    constructor(protected readonly schema: DbTableSchema) {}

    public get Name() {
        return this.schema.name;
    }

    private tableExists = true;
    private cannotAcessTable = (error: unknown) => {
        this.tableExists = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorCode = (error as any).code;
        if (errorCode === "42P01") {
            Log.log(PostreSql.Route, "🔶 PostreSql: ✅ Missing table ...");
        } else {
            PostreSql.instance(PostreSql.Route).onError(error);
        }
    };
    public async exists(route: MergingObject) {
        PostreSql.close();
        PostreSql.Route = route;
        await PostreSql.instance(route, false, this.cannotAcessTable.bind(this)).using(async (client: PoolClient) => {
            return await client.query(`SELECT * FROM "${this.schema.name}"`);
        });
        PostreSql.close();
        if (this.tableExists) {
            Log.log({ ...route, table: this.Name }, `table exists ✅`);
        }
        return this.tableExists;
    }
    private createColumn(column: Column) {
        return `"${column.name}" ${column.type} ${column.notNull ? "NOT NULL" : ""} ${
            column.default ? "DEFAULT " + column.default : ""
        },\n`;
    }
    private createIndex(index: Index) {
        return `CREATE ${index.unique ? "UNIQUE " : ""}INDEX IF NOT EXISTS "${index.name}" ON ${index.on};`;
    }
    private createConstraint(constraint: string) {
        return `${constraint},\n`;
    }
    public async create(route: MergingObject) {
        Log.log({ ...route, table: this.Name }, `🔷 Create table`);
        await PostreSql.instance(route).using(async (client: PoolClient) => {
            let createTable = `CREATE TABLE IF NOT EXISTS "${this.schema.name}"\n(\n`;
            for (const column of this.schema.columns) {
                createTable += this.createColumn(column);
            }
            if (this.schema.constraints) {
                for (const constraint of this.schema.constraints) {
                    createTable += this.createConstraint(constraint);
                }
            }
            createTable = createTable.substring(0, createTable.length - 2);
            createTable += "\n);";
            Log.log({ ...route, table: this.Name }, createTable);
            const result = await client.query(createTable);
            if (this.schema.indexes) {
                for (const index of this.schema.indexes) {
                    const createIndex = this.createIndex(index);
                    Log.log({ ...route, table: this.Name, index: index.name }, createIndex);
                    await client.query(createIndex);
                }
            }
            return result;
        });
    }

    protected async _select(
        route: MergingObject,
        request: string,
        values?: QueryConfigValues<(KnownColumnDataType | KnownColumnDataType[])[]>,
        orderByLimit?: string,
        transactionPoolClient?: PoolClient
    ) {
        let result;
        if (orderByLimit) {
            request += orderByLimit;
        }
        if (transactionPoolClient) {
            result = await transactionPoolClient.query(request, values);
        } else {
            result = await PostreSql.instance(route).using(async (client: PoolClient) => {
                return await client.query(request, values);
            });
        }
        return result;
    }

    public async selectMany(
        route: MergingObject,
        request?: string,
        values?: QueryConfigValues<(KnownColumnDataType | KnownColumnDataType[])[]>,
        orderBy?: string,
        transactionPoolClient?: PoolClient
    ): Promise<Entity[]> {
        const selectQuery = `SELECT "${this.schema.name}".* FROM "${this.schema.name}" ${request ?? ""}`;
        const result = await this._select(route, selectQuery, values, orderBy, transactionPoolClient);
        return result ? [...result.rows] : [];
    }

    public async select(
        route: MergingObject,
        option: {
            select?: {
                columns: string[];
                distinct?: boolean;
            };
            request?: string;
            values?: QueryConfigValues<(KnownColumnDataType | KnownColumnDataType[])[]>;
            // limit?: number;
            orderBy?: string;
        },
        transactionPoolClient?: PoolClient
    ): Promise<Entity[]> {
        const columns = option.select?.columns
            ? `"${this.schema.name}".` + option.select?.columns.join(`, "${this.schema.name}".`)
            : `"${this.schema.name}".*`;
        const selectQuery = `SELECT ${option.select?.distinct ? "distinct" : ""} ${columns} FROM "${
            this.schema.name
        }" ${option.request ?? ""}`;
        const result = await this._select(route, selectQuery, option.values, option.orderBy, transactionPoolClient);
        return result ? [...result.rows] : [];
    }

    public async selectDistinct(
        route: MergingObject,
        request?: string,
        values?: QueryConfigValues<(KnownColumnDataType | KnownColumnDataType[])[]>,
        orderBy?: string,
        transactionPoolClient?: PoolClient
    ): Promise<Entity[]> {
        const selectQuery = `SELECT distinct "${this.schema.name}".id, "${this.schema.name}".* FROM "${
            this.schema.name
        }" ${request ?? ""}`;
        const result = await this._select(route, selectQuery, values, orderBy, transactionPoolClient);
        return result ? [...result.rows] : [];
    }

    public async selectOne(
        route: MergingObject,
        request?: string,
        values?: QueryConfigValues<(KnownColumnDataType | KnownColumnDataType[])[]>,
        orderBy?: string,
        transactionPoolClient?: PoolClient
    ): Promise<Entity | undefined> {
        const selectQuery = `SELECT "${this.schema.name}".* FROM "${this.schema.name}" ${request ?? ""}`;
        const result = await this._select(
            route,
            selectQuery,
            values,
            (orderBy ?? "") + " LIMIT 1",
            transactionPoolClient
        );
        return result && result.rowCount ? { ...result.rows[0] } : undefined;
    }

    protected prepareTrace(route: MergingObject, action: Action, entity: Entity): TraceEntity {
        return {
            userId: route.userId ? parseInt(route.userId) : undefined,
            function: route.function ?? "?",
            action,
            type: "sql",
            table: this.schema.name,
            itemId: entity.id ? entity.id.toString() : "?",
            change: JSON.stringify(entity).substring(0, TraceChangeLenght),
        };
    }
    private trace:
        | undefined
        | ((
              route: MergingObject,
              transactionPoolClient: PoolClient,
              trace: TraceEntity
          ) => Promise<TraceEntity | undefined>) = undefined;
    public inject(
        trace: (
            route: MergingObject,
            transactionPoolClient: PoolClient,
            trace: TraceEntity
        ) => Promise<TraceEntity | undefined>
    ) {
        this.trace = trace;
    }
    protected saveTrace(route: MergingObject, transactionPoolClient: PoolClient, trace: TraceEntity) {
        if (this.trace) {
            return this.trace(route, transactionPoolClient, trace);
        }
    }

    public async insert(
        route: MergingObject,
        entity: Entity,
        transactionPoolClient?: PoolClient
    ): Promise<Entity | undefined> {
        let insertQuery = `INSERT INTO "${this.schema.name}"\n`;
        insertQuery += "(" + Object.keys(entity).map((column) => `"${column}"`) + ")\n";
        insertQuery += "VALUES(" + Object.keys(entity).map((column, index) => `\$${index + 1}`) + ")\n";
        insertQuery += "RETURNING " + this.schema.columns.map((column) => `"${column.name}"`);
        const values = [...Object.values(entity)];

        const traceEntity = this.prepareTrace(route, "insert", entity);
        let result;
        if (transactionPoolClient) {
            result = await transactionPoolClient.query(insertQuery, values);
            traceEntity.itemId = result && result.rowCount ? result.rows[0].id.toString() : "0";
            this.saveTrace(route, transactionPoolClient, traceEntity);
        } else {
            // create transaction and trace also
            result = await PostreSql.instance(route).transaction<QueryResult>(
                async (transactionPoolClient: PoolClient) => {
                    const result = await transactionPoolClient.query(insertQuery, values);
                    traceEntity.itemId = result && result.rowCount ? result.rows[0].id.toString() : "0";
                    this.saveTrace(route, transactionPoolClient, traceEntity);
                    return result;
                }
            );
        }
        return result && result.rowCount ? { ...result.rows[0] } : undefined;
    }

    public async update(
        route: MergingObject,
        entity: Entity,
        transactionPoolClient?: PoolClient
    ): Promise<Entity | undefined> {
        if (!entity.id) {
            return undefined;
        }
        let updateQuery = `UPDATE "${this.schema.name}"\n`;
        updateQuery += "SET " + Object.keys(entity).map((column, index) => `"${column}"=\$${index + 2}`) + "\n";
        updateQuery += `WHERE id=$1\n`;
        updateQuery += "RETURNING " + this.schema.columns.map((column) => `"${column.name}"`);
        const values = [entity.id, ...Object.values(entity)];
        let result;
        const traceEntity = this.prepareTrace(route, "update", entity);
        if (transactionPoolClient) {
            result = await transactionPoolClient.query(updateQuery, values);
            this.saveTrace(route, transactionPoolClient, traceEntity);
        } else {
            result = await PostreSql.instance(route).transaction<QueryResult>(
                async (transactionPoolClient: PoolClient) => {
                    const result = await transactionPoolClient.query(updateQuery, values);
                    this.saveTrace(route, transactionPoolClient, traceEntity);
                    return result;
                }
            );
        }
        return result && result.rowCount ? { ...result.rows[0] } : undefined;
    }

    public async delete(route: MergingObject, entity: Entity, transactionPoolClient?: PoolClient): Promise<void> {
        if (!entity.id) {
            return undefined;
        }
        const deleteQuery = `DELETE FROM "${this.schema.name}" WHERE id=$1`;
        const values = [entity.id];
        const traceEntity = this.prepareTrace(route, "delete", entity);
        if (transactionPoolClient) {
            await transactionPoolClient.query(deleteQuery, values);
            this.saveTrace(route, transactionPoolClient, traceEntity);
        } else {
            await PostreSql.instance(route).transaction<QueryResult>(async (transactionPoolClient: PoolClient) => {
                await transactionPoolClient.query(deleteQuery, values);
                this.saveTrace(route, transactionPoolClient, traceEntity);
            });
        }
    }

    public async deleteById(
        route: MergingObject,
        id: string | number,
        transactionPoolClient?: PoolClient
    ): Promise<void> {
        const deleteQuery = `DELETE FROM "${this.schema.name}" WHERE id=$1`;
        const values = [id];
        const traceEntity = this.prepareTrace(route, "delete", { id } as Entity);
        if (transactionPoolClient) {
            await transactionPoolClient.query(deleteQuery, values);
            this.saveTrace(route, transactionPoolClient, traceEntity);
        } else {
            await PostreSql.instance(route).transaction<QueryResult>(async (transactionPoolClient: PoolClient) => {
                await transactionPoolClient.query(deleteQuery, values);
                this.saveTrace(route, transactionPoolClient, traceEntity);
            });
        }
    }

    public async deletedWhere(
        route: MergingObject,
        requestEnd: string,
        values?: QueryConfigValues<(KnownColumnDataType | KnownColumnDataType[])[]>,
        transactionPoolClient?: PoolClient
    ): Promise<void> {
        const deleteQuery = `DELETE FROM "${this.schema.name}" ${requestEnd}`;
        const traceEntity = this.prepareTrace(route, "delete", { request: requestEnd } as unknown as Entity);
        if (transactionPoolClient) {
            await transactionPoolClient.query(deleteQuery, values);
            this.saveTrace(route, transactionPoolClient, traceEntity);
        } else {
            await PostreSql.instance(route).transaction<QueryResult>(async (transactionPoolClient: PoolClient) => {
                await transactionPoolClient.query(deleteQuery, values);
                this.saveTrace(route, transactionPoolClient, traceEntity);
            });
        }
    }
}
