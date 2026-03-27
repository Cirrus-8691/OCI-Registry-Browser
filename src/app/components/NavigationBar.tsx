import { Button, Container, Form, Nav, Navbar, NavDropdown } from "react-bootstrap";
import Image from "next/image";
import LanguageSelect from "./LanguageSelect";
import useApplicationContext from "../ApplicationContext";
import Copyright from "@/tools/Copyright";
import { useTranslation } from "react-i18next";
import { DeleteApi, PostApi } from "@/tools/FetchApi";
import Link from "next/link";
import UserCan from "./UserCan";
import OffcanvasEditUser from "../dialog/OffcanvasEditUser";
import { useState } from "react";
import { UserInfo } from "../api/user/entites/user.entity";
import ConfirmForgetMe from "../dialog/ConfirmForgetMe";
import { SchemaTables } from "@/model/SchemaTables";
import { LinkHomeHref, ImageSrc, LinkPagesHref } from "@/tools/Homepage-BasePath";
import { SmallIcone } from "./const";

const NavigationBar = () => {
    const { userConnected, fetchContext, setUserConnected, editUser, setEditUser, setUpdatedUser } =
        useApplicationContext();
    const { t } = useTranslation();
    const logout = async () => {
        try {
            await PostApi(
                fetchContext,
                `user/signout`,
                { renewToken: userConnected.tokens.renew },
                t("Common.errors.identification")
            );
        } catch {
            /* token expired */
        }
        fetchContext.login();
    };
    const [userToForget, setUserToForget] = useState<UserInfo | undefined>(undefined);
    const confirmForgetRegistry = async (value: boolean) => {
        if (userToForget && value) {
            const userId = userToForget.id;
            const ok = await DeleteApi(fetchContext, `user?userId=${userId}`, t("Common.errors.delete"));
            if (ok) {
                fetchContext.login();
            }
        }
        setUserToForget(undefined);
    };

    const savedUser = (data: UserInfo) => {
        if (userConnected.user.email === data.email) {
            setUserConnected((prevUser) => ({
                ...prevUser,
                user: {
                    ...prevUser.user,
                    desc: data.desc,
                },
            }));
        }
        setUpdatedUser(data);
    };

    return (
        <Navbar bg="dark" data-bs-theme="dark">
            {editUser && (
                <OffcanvasEditUser
                    want={editUser.want}
                    data={editUser.user}
                    savedUser={savedUser}
                    hide={() => setEditUser(undefined)}
                />
            )}
            <ConfirmForgetMe confirm={confirmForgetRegistry} data={userToForget} />
            <Container>
                <Navbar.Brand
                    href={LinkHomeHref()}
                >{`${Copyright.logo} ${Copyright.name} vs ${Copyright.version}`}</Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Nav>
                        <Nav.Link disabled>{t("LanguageSelect.title")}</Nav.Link>
                    </Nav>
                    &nbsp;
                    <Form className="d-flex">
                        <LanguageSelect />
                    </Form>
                    &nbsp;
                    {userConnected.user.email ? (
                        <Nav>
                            <NavDropdown
                                title={
                                    <>
                                        <Image
                                            aria-hidden
                                            src={ImageSrc("globe.svg")}
                                            alt="globe"
                                            width={SmallIcone.width}
                                            height={SmallIcone.height}
                                        />
                                        &nbsp;
                                        {userConnected.user.email as string}
                                    </>
                                }
                            >
                                <NavDropdown.Item disabled>
                                    {t("Login.signedAs")} {userConnected.user.email as string}
                                </NavDropdown.Item>
                                <NavDropdown.Item disabled>
                                    {t("Login.profile")} {t(`Common.profiles.${userConnected.user.profile as string}`)}
                                </NavDropdown.Item>
                                {userConnected.user.active === "activated" && (
                                    <>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item
                                            onClick={() => {
                                                setEditUser({
                                                    want: "edit",
                                                    user: userConnected.user,
                                                });
                                            }}
                                        >
                                            {t("Account.edit")}
                                        </NavDropdown.Item>
                                        <NavDropdown.Item
                                            onClick={() => {
                                                setEditUser({
                                                    want: "changePassword",
                                                    user: userConnected.user,
                                                });
                                            }}
                                        >
                                            {t("Account.changePassword")}
                                        </NavDropdown.Item>
                                    </>
                                )}
                                <NavDropdown.Item onClick={() => setUserToForget(userConnected.user)}>
                                    {t("Account.delete")}
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                {userConnected.user.active === "activated" && (
                                    <>
                                        <UserCan action="list" table={SchemaTables.User}>
                                            <NavDropdown.Item href={LinkPagesHref("users")}>
                                                {t("Login.manageUsers")}
                                            </NavDropdown.Item>
                                        </UserCan>
                                        <UserCan action="select" table={SchemaTables.Trace}>
                                            <NavDropdown.Item href={LinkPagesHref("traces")}>
                                                {t("Trace.title")}
                                            </NavDropdown.Item>
                                            <NavDropdown.Divider />
                                        </UserCan>
                                    </>
                                )}
                                <NavDropdown.Item onClick={logout}>{t("Login.logout")}</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    ) : (
                        <Link href={LinkPagesHref("login")}>
                            <Button variant="outline-secondary">{t("Login.connect")}</Button>
                        </Link>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};
export default NavigationBar;
