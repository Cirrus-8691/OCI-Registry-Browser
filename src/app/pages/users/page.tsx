"use client";

import React, { useEffect, useState } from "react";
import { UserInfo } from "@/app/api/user/entites/user.entity";
import styles from "../../page.module.css";
import Image from "next/image";

import Logo from "@/app/components/Logo";
import OrderByColumn, { OrderBy, sortRows, TableKeyOrder } from "@/app/components/Tables/OrderByColumn";
import UserCan from "@/app/components/UserCan";
import { ImageSrc, LinkHomeHref } from "@/tools/Homepage-BasePath";
import Link from "next/link";

import { Button, Dropdown, DropdownButton, Form, InputGroup, Table } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { DeleteApi, GetApi } from "@/tools/FetchApi";
import useApplicationContext, { UserIsNotConnected } from "@/app/ApplicationContext";
import ConfirmDeleteUser from "@/app/dialog/ConfirmDeleteUser";
import OffcanvasCreateUser from "@/app/dialog/OffcanvasCreateUser";
import { RegistryEntity } from "@/app/api/registry/registry.entity";
import OffcanvasUserRegisty, { UserRegistries } from "@/app/dialog/OffcanvasUserRegisty";
import { SchemaTables } from "@/model/SchemaTables";
import FilterRows, { TableKeyFilter } from "@/app/components/Tables/FilterRows";
import { useLocalStorage } from "@/app/hooks/useLocalstorage";
import { SmallIcone } from "@/app/components/const";

export default function Users() {
    const { t } = useTranslation();
    const { fetchContext, userConnected, setEditUser, updatedUser } = useApplicationContext();

    const tableKey = "users";
    const [filter, setFilter] = useLocalStorage(TableKeyFilter(tableKey), "");
    const [sortBy, setSortBy] = useLocalStorage<OrderBy>(TableKeyOrder(tableKey), {
        column: "name",
        order: "ASC",
    });

    const [users, setUsers] = useState<UserInfo[]>([]);
    useEffect(() => {
        const getUsers = async () => {
            const result = await GetApi<UserInfo[]>(fetchContext, `user`, t("Common.errors.identification"));
            if (result) {
                setUsers(result);
            }
        };
        if (UserIsNotConnected(fetchContext)) {
            fetchContext.login();
        } else {
            getUsers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [userToDelete, setUserToDelete] = useState<UserInfo | undefined>(undefined);
    const confirmDeleteRegistry = async (value: boolean) => {
        if (userToDelete && value) {
            const userId = userToDelete.id;
            const ok = await DeleteApi(fetchContext, `user?userId=${userId}`, t("Common.errors.delete"));
            if (ok) {
                setUsers((prevData) => prevData.filter((prevUser) => prevUser.id !== userId));
            }
        }
        setUserToDelete(undefined);
    };
    useEffect(() => {
        if (updatedUser) {
            setUsers((prevData) =>
                prevData.map((prevRegistry) => (prevRegistry.id === updatedUser.id ? updatedUser : prevRegistry))
            );
        }
    }, [updatedUser]);

    const [userToCreate, setUserToCreate] = useState<UserInfo | undefined>(undefined);
    const createUser = async () => {
        setUserToCreate({
            email: "",
            password: "",
            profile: "user-view",
        });
    };
    const createdUser = (data: UserInfo) => {
        setUsers((prevData) => [...prevData, data]);
    };

    const [userRegisties, setUserRegisties] = useState<UserRegistries | undefined>(undefined);
    const loadUserRegisties = async (user: UserInfo) => {
        const registries = await GetApi<RegistryEntity[]>(
            fetchContext,
            `registry/user?userId=${user.id}`,
            t("Common.errors.identification")
        );
        if (registries) {
            setUserRegisties({
                registries,
                user,
            });
        }
    };

    return (
        <div className={styles.page}>
            <Link href={LinkHomeHref()}>
                <Button variant="link">{t("Common.GoHome")}</Button>
                &nbsp;/&nbsp;
                {t("User.title")}
            </Link>
            <OffcanvasCreateUser data={userToCreate} savedUser={createdUser} hide={() => setUserToCreate(undefined)} />
            <ConfirmDeleteUser confirm={confirmDeleteRegistry} data={userToDelete} />
            <OffcanvasUserRegisty data={userRegisties} setData={setUserRegisties} />
            <main className={styles.main}>
                <Logo image="users" />
                <UserCan action="list" table={SchemaTables.User}>
                    <Form>
                        <Form.Text style={{ fontSize: "1.25rem" }}>{t("User.title")}</Form.Text>
                        <InputGroup className="mb-1">
                            <Button variant="light" onClick={createUser}>
                                <Image
                                    aria-hidden
                                    src={ImageSrc("add.svg")}
                                    alt="add"
                                    width={SmallIcone.width}
                                    height={SmallIcone.height}
                                />
                                &nbsp;
                                {t("User.create")}
                            </Button>
                        </InputGroup>
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
                                        title={t("Common.email")}
                                        column="name"
                                    />
                                    <OrderByColumn
                                        tableKey={tableKey}
                                        sortBy={sortBy}
                                        setSortBy={setSortBy}
                                        title={t("Common.desc")}
                                        column="desc"
                                    />
                                    <OrderByColumn
                                        tableKey={tableKey}
                                        sortBy={sortBy}
                                        setSortBy={setSortBy}
                                        title={t("Common.profile")}
                                        column="profile"
                                    />
                                    <th>
                                        <Button variant="light" disabled>
                                            {t("User.registries")}
                                        </Button>
                                    </th>
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
                                {users
                                    .filter((user: UserInfo) => (user.email as string).includes(filter))
                                    .sort((a: UserInfo, b: UserInfo) =>
                                        sortRows(sortBy, { ...a, name: a.email }, { ...b, name: b.email })
                                    )
                                    .map((user: UserInfo) => (
                                        <tr key={user.email as string}>
                                            <td>{user.id as number}</td>
                                            <td>
                                                {user.email as string}&nbsp;
                                                {user.id === userConnected.user.id && <Trans i18nKey="User.me" />}
                                            </td>
                                            <td>{user.desc as string}</td>
                                            <td>{t(`Common.profiles.${user.profile as string}`)}</td>
                                            <td>
                                                <div
                                                    style={{
                                                        height: "100%",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <Button variant="light" onClick={() => loadUserRegisties(user)}>
                                                        <Image
                                                            aria-hidden
                                                            src={ImageSrc("window.svg")}
                                                            alt="window"
                                                            width={SmallIcone.width}
                                                            height={SmallIcone.height}
                                                        />
                                                    </Button>
                                                </div>
                                            </td>
                                            <td>
                                                <DropdownButton
                                                    size="sm"
                                                    variant="light"
                                                    title={
                                                        <Image
                                                            aria-hidden
                                                            src={ImageSrc("3dots.svg")}
                                                            alt="..."
                                                            width={SmallIcone.width}
                                                            height={SmallIcone.height}
                                                        />
                                                    }
                                                >
                                                    <Dropdown.Item onClick={() => setEditUser({ user, want: "edit" })}>
                                                        <Image
                                                            aria-hidden
                                                            src={ImageSrc("edit.svg")}
                                                            alt="edit"
                                                            width={SmallIcone.width}
                                                            height={SmallIcone.height}
                                                        />
                                                        &nbsp;{t("User.edit")}
                                                    </Dropdown.Item>
                                                    <Dropdown.Item
                                                        disabled={user.id === userConnected.user.id}
                                                        onClick={() => setUserToDelete(user)}
                                                    >
                                                        <Image
                                                            aria-hidden
                                                            src={ImageSrc("trash.svg")}
                                                            alt="trash"
                                                            width={SmallIcone.width}
                                                            height={SmallIcone.height}
                                                        />
                                                        &nbsp;{t("User.delete")}
                                                    </Dropdown.Item>
                                                </DropdownButton>
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
