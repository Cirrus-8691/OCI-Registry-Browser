import { MergingObject } from "@/tools/Logger";
import { TraceEntity } from "./trace.entity";
import TraceTable from "@/model/Trace.table";
import { UserInfo } from "../user/entites/user.entity";

export default class TraceService {

    /**
     * Select all users traces
     */
    async load(route: MergingObject, users: UserInfo[]): Promise<TraceEntity[]> {
        const traceTable = new TraceTable();
        const request = 'WHERE "userId" = ANY($1)';
        const traces = await traceTable.selectMany(route, request, [users.map((u) => u.id)] );
    // filtrer hashPwd
    return traces.map((trace) =>
      trace.table === "user"
        ? (() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { hashPwd, ...change } = JSON.parse(trace.change);
            return { ...trace, change: JSON.stringify(change) };
          })()
        : trace
    );
    }
}
