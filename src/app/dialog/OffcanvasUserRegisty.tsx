import { Button, Form, InputGroup, Offcanvas, Table } from "react-bootstrap";
import Image from "next/image";
import OrderByColumn, { OrderBy, sortRows, TableKeyOrder } from "../components/Tables/OrderByColumn";
import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RegistryEntity } from "../api/registry/registry.entity";
import { UserInfo } from "../api/user/entites/user.entity";
import { DeleteApi, GetApi, PostApi } from "@/tools/FetchApi";
import useApplicationContext, { UserIsNotConnected } from "../ApplicationContext";
import { CreateAlert } from "../components/FlyingAlert";
import { ImageSrc } from "@/tools/Homepage-BasePath";
import FilterRows, { TableKeyFilter } from "../components/Tables/FilterRows";
import { useLocalStorage } from "../hooks/useLocalstorage";
import { SmallIcone } from "../components/const";

export interface UserRegistries {
    registries: RegistryEntity[];
    user: UserInfo;
}

const OffcanvasUserRegisty = ({
    data,
    setData,
}: {
    data: UserRegistries | undefined;
    setData: React.Dispatch<React.SetStateAction<UserRegistries | undefined>>;
}) => {
    const { t } = useTranslation();
    const { fetchContext, userConnected, setAlert } = useApplicationContext();

    const tableKey = "home"; // Use same key as home page.
    const [filter, setFilter] = useLocalStorage(TableKeyFilter(tableKey), "");
    const [sortBy, setSortBy] = useLocalStorage<OrderBy>(TableKeyOrder(tableKey), {
        column: "name",
        order: "ASC",
    });
    const [addRegistry, setAddRegistry] = useState<RegistryEntity | undefined>(undefined);
    const selectRegistry = (event: ChangeEvent<HTMLSelectElement>) => {
        const registryId = parseInt(event.target.value);
        if (registryId) {
            const registryEntity = adminRegistries.find((r) => r.id === registryId);
            if (registryEntity) {
                setAddRegistry(registryEntity);
            }
        } else {
            setAddRegistry(undefined);
        }
    };
    const addUserRegistry = async () => {
        if (addRegistry && data) {
            const updatedUser = await PostApi<UserInfo>(
                fetchContext,
                `user/registry?registryId=${addRegistry.id}&userId=${data.user.id}`,
                undefined,
                t("Common.errors.identification")
            );
            if (updatedUser) {
                setData((prevData) => {
                    if (prevData) {
                        return {
                            user: prevData.user,
                            registries: [...prevData.registries, addRegistry],
                        };
                    }
                });
            }
        }
    };
    const removeUserRegisty = async (registry: RegistryEntity) => {
        if (data) {
            if (data.registries.length <= 1) {
                setAlert(CreateAlert.warning(t("UserRegisty.cannotDeleteAll")));
            } else {
                const updatedUser = await DeleteApi<UserInfo>(
                    fetchContext,
                    `user/registry?registryId=${registry.id}&userId=${data.user.id}`,
                    t("Common.errors.identification")
                );
                if (updatedUser) {
                    setData((prevData) => {
                        if (prevData) {
                            return {
                                user: prevData.user,
                                registries: prevData.registries.filter(
                                    (prevRegistry) => prevRegistry.id !== registry.id
                                ),
                            };
                        }
                    });
                }
            }
        }
    };

    const [adminRegistries, setAdminRegistries] = useState<RegistryEntity[]>([]);
    useEffect(() => {
        const getRegistries = async () => {
            const result = await GetApi<RegistryEntity[]>(fetchContext, `registry`, t("Common.errors.identification"));
            if (result) {
                setAdminRegistries(result);
            }
        };
        if (UserIsNotConnected(fetchContext)) {
            fetchContext.login();
        } else {
            getRegistries();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const disableDelete = (registry: RegistryEntity) =>
        !adminRegistries.map((r) => r.id).includes(registry.id) ||
        (userConnected.user?.profile === "admin" 
            && userConnected.user?.email === data?.user.email);
    return (
        <Offcanvas style={{ minWidth: "50%" }} show={!!data} onHide={() => setData(undefined)} placement="end">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>{t("UserRegisty.title", data?.user)}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <FilterRows tableKey={tableKey} setFilter={setFilter} filter={filter} />
                <InputGroup className="mb-3">
                    <Form.Select size="sm" onChange={selectRegistry}>
                        <option value="0"></option>
                        {adminRegistries.map((registry) => (
                            <option key={registry.id} value={registry.id}>
                                {registry.name?.padEnd(24, " .")} {registry.url}
                            </option>
                        ))}
                    </Form.Select>
                    <Button disabled={!addRegistry} variant="light" onClick={addUserRegistry}>
                        <Image
                            aria-hidden
                            src={ImageSrc("add.svg")}
                            alt="add"
                            width={SmallIcone.width}
                            height={SmallIcone.height}
                        />
                        &nbsp;
                        {t("UserRegisty.add")}
                    </Button>
                </InputGroup>
                <Table striped bordered hover size="sm">
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
                                title={t("Home.registry.name")}
                                column="name"
                            />
                            <OrderByColumn
                                tableKey={tableKey}
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                title={t("Home.registry.url")}
                                column="url"
                            />
                            <OrderByColumn
                                tableKey={tableKey}
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                title={t("Home.registry.user")}
                                column="user"
                            />
                            <th style={{ maxWidth: "96px" }}>
                                <Button variant="light" disabled>
                                    {t("UserRegisty.remove")}
                                </Button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.registries
                            ?.filter((registry: RegistryEntity) => registry.name?.includes(filter) || registry.url.includes(filter))
                            .sort((a, b) => sortRows(sortBy, a, b))
                            .map((registry: RegistryEntity) => (
                                <tr key={registry.id}>
                                    <td>{registry.id}</td>
                                    <td>{registry.name}</td>
                                    <td>{registry.url}</td>
                                    <td>{registry.user}</td>
                                    <td
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Button
                                            variant={"light"}
                                            disabled={disableDelete(registry)}
                                            onClick={() => removeUserRegisty(registry)}
                                        >
                                            {disableDelete(registry) ? (
                                                t("UserRegisty.noRight")
                                            ) : (
                                                <Image
                                                    aria-hidden
                                                    src={ImageSrc(`danger.svg`)}
                                                    alt="danger"
                                                    width={SmallIcone.width}
                                                    height={SmallIcone.height}
                                                />
                                            )}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </Table>
            </Offcanvas.Body>
        </Offcanvas>
    );
};
export default OffcanvasUserRegisty;
