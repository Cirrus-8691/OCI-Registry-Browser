"use client";

import React, { useEffect, useState } from "react";
import styles from "../../page.module.css";
import Image from "next/image";

import Logo from "@/app/components/Logo";
import OrderByColumn, { OrderBy, sortRows, TableKeyOrder } from "@/app/components/Tables/OrderByColumn";
import UserCan from "@/app/components/UserCan";
import { ImageSrc, LinkHomeHref } from "@/tools/Homepage-BasePath";
import Link from "next/link";

import { Button, Form, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { GetApi } from "@/tools/FetchApi";
import useApplicationContext, { UserIsNotConnected } from "@/app/ApplicationContext";
import { SchemaTables } from "@/model/SchemaTables";
import FilterRows, { TableKeyFilter } from "@/app/components/Tables/FilterRows";
import { useLocalStorage } from "@/app/hooks/useLocalstorage";
import { TraceEntity } from "@/app/api/trace/trace.entity";
import OffcanvasDetailTraceChange from "@/app/dialog/OffcanvasDetailTraceChange";
import { SmallIcone } from "@/app/components/const";

export default function Traces() {
    const { t } = useTranslation();
    const { fetchContext } = useApplicationContext();

    const tableKey = "traces";
    const [filter, setFilter] = useLocalStorage(TableKeyFilter(tableKey), "");
    const [sortBy, setSortBy] = useLocalStorage<OrderBy>(TableKeyOrder(tableKey), {
        column: "id",
        order: "DESC",
    });

    const [traces, setTraces] = useState<TraceEntity[]>([]);
    useEffect(() => {
        const getUsers = async () => {
            const result = await GetApi<TraceEntity[]>(fetchContext, `trace`, t("Common.errors.identification"));
            if (result) {
                setTraces(result);
            }
        };
        if (UserIsNotConnected(fetchContext)) {
            fetchContext.login();
        } else {
            getUsers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [traceToDetail, setTraceToDetail] = useState<TraceEntity | undefined>(undefined);

    return (
        <div className={styles.page}>
            <OffcanvasDetailTraceChange trace={traceToDetail} hide={() => setTraceToDetail(undefined)} />
            <Link href={LinkHomeHref()}>
                <Button variant="link">{t("Common.GoHome")}</Button>
                &nbsp;/&nbsp;
                {t("Trace.title")}
            </Link>
            <main className={styles.main}>
                <Logo image="traces" />
                <UserCan action="select" table={SchemaTables.Trace}>
                    <Form>
                        <Form.Text style={{ fontSize: "1.25rem" }}>{t("Trace.title")}</Form.Text>
                        <FilterRows tableKey={tableKey} setFilter={setFilter} filter={filter} />
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <OrderByColumn
                                        tableKey={tableKey}
                                        sortBy={sortBy}
                                        setSortBy={setSortBy}
                                        title="#"
                                        column="id"
                                    />
                                    <OrderByColumn
                                        tableKey={tableKey}
                                        sortBy={sortBy}
                                        setSortBy={setSortBy}
                                        title={t("Common.date")}
                                        column="date"
                                    />
                                    <OrderByColumn
                                        tableKey={tableKey}
                                        sortBy={sortBy}
                                        setSortBy={setSortBy}
                                        title={t("Common.user")}
                                        column="userId"
                                    />
                                    <OrderByColumn
                                        tableKey={tableKey}
                                        sortBy={sortBy}
                                        setSortBy={setSortBy}
                                        title={t("Common.function")}
                                        column="function"
                                    />
                                    <OrderByColumn
                                        tableKey={tableKey}
                                        sortBy={sortBy}
                                        setSortBy={setSortBy}
                                        title={t("Common.type")}
                                        column="type"
                                    />
                                    <OrderByColumn
                                        tableKey={tableKey}
                                        sortBy={sortBy}
                                        setSortBy={setSortBy}
                                        title={t("Common.action")}
                                        column="action"
                                    />
                                    <OrderByColumn
                                        tableKey={tableKey}
                                        sortBy={sortBy}
                                        setSortBy={setSortBy}
                                        title={t("Common.table")}
                                        column="table"
                                    />
                                    <OrderByColumn
                                        tableKey={tableKey}
                                        sortBy={sortBy}
                                        setSortBy={setSortBy}
                                        title={t("Common.itemId")}
                                        column="itemId"
                                    />
                                    <OrderByColumn
                                        tableKey={tableKey}
                                        sortBy={sortBy}
                                        setSortBy={setSortBy}
                                        title={t("Common.change")}
                                        column="change"
                                    />
                                    <th>
                                        <Button variant="light" disabled>
                                            <Image
                                                aria-hidden
                                                src={ImageSrc("3dots.svg")}
                                                alt="file"
                                                width={SmallIcone.width}
                                                height={SmallIcone.height}
                                            />
                                        </Button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {traces
                                    .filter((trace: TraceEntity) => (trace.function as string).includes(filter))
                                    .sort((a: TraceEntity, b: TraceEntity) => sortRows(sortBy, a, b))
                                    .map((trace: TraceEntity) => (
                                        <tr key={trace.id?.toString()}>
                                            <td>{trace.id?.toString()}</td>
                                            <td>{trace.date ? trace.date.toString() : ""}</td>
                                            <td>{trace.userId ? (trace.userId as number) : ""}</td>
                                            <td>{trace.function}</td>
                                            <td>{trace.type as string}</td>
                                            <td>{trace.action as string}</td>
                                            <td>{trace.table}</td>
                                            <td>{trace.itemId}</td>
                                            <td>{trace.change.substring(0, 64)}</td>
                                            <td>
                                                <Button
                                                    variant="light"
                                                    onClick={() => {
                                                        setTraceToDetail(trace);
                                                    }}
                                                    style={{ height: "100%" }}
                                                >
                                                    <Image
                                                        aria-hidden
                                                        src={ImageSrc("window.svg")}
                                                        alt="window"
                                                        width={SmallIcone.width}
                                                        height={SmallIcone.height}
                                                    />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                    </Form>
                </UserCan>
            </main>
        </div>
    );
}
