"use client";

import { DbRow } from "@/tools/Database/PostgreSql";
import { Button } from "react-bootstrap";

export type Order = "ASC" | "DESC";
export interface OrderBy {
    column: string;
    order: Order;
}

export const TableKeyOrder = (tableKey: string) => (`sort-${tableKey}`);

const sortByMe = (sortBy: OrderBy, column: string) => {
    if (sortBy.column === column) {
        return sortBy.order === "ASC" ? "⏶" : "⏷";
    }
    return " "; // &nbsp;
};
const orderBy = (sortBy: OrderBy, setSortBy: (sortBy: OrderBy) => void, column: string, tableKey?: string) => {
    let useSortBy: OrderBy;
    if (sortBy.column === column) {
        // change direction
        useSortBy = sortBy.order === "ASC" ? { column, order: "DESC" } : { column, order: "ASC" };
    } else {
        useSortBy = { column, order: "DESC" };
    }
    setSortBy(useSortBy);
    if (tableKey) {
        localStorage.setItem(TableKeyOrder(tableKey), JSON.stringify(useSortBy));
    }
};

const OrderByColumn = ({
    sortBy,
    setSortBy,
    title,
    column,
    tableKey,
}: {
    sortBy: OrderBy;
    setSortBy: (sortBy: OrderBy) => void;
    title: string;
    column: string;
    tableKey?: string;
}) => (
    <th>
        {title}{" "}
        <Button variant="light" onClick={() => orderBy(sortBy, setSortBy, column, tableKey)}>
            {sortByMe(sortBy, column)}
        </Button>
    </th>
);

export const sortRows = (sortByOrder: OrderBy, a: DbRow, b: DbRow) => {
    const aValue = a[sortByOrder.column];
    const bValue = b[sortByOrder.column];
    if (typeof aValue === "string" && typeof bValue === "string") {
        if (sortByOrder.order === "ASC") {
            return aValue.localeCompare(bValue);
        } else {
            return bValue.localeCompare(aValue);
        }
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
        if (sortByOrder.order === "ASC") {
            return aValue - bValue;
        } else {
            return bValue - aValue;
        }
    }
    return 0;
};

export default OrderByColumn;
