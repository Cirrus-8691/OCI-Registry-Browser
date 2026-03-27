import UserAbility, { UserHaveAbility } from "@/model/UserAbility";
import useApplicationContext from "../ApplicationContext";
import { SchemaTables } from "@/model/SchemaTables";

const UserCan = ({
    action,
    table,
    userCant = false,
    children,
}: Readonly<{
    action: UserAbility;
    table: SchemaTables
    userCant?: boolean;
    children: React.ReactNode;
}>) => {
    const { userConnected } = useApplicationContext();
    return (
        <>
            {!userCant && UserHaveAbility(userConnected.user, action, table) && children}
            {userCant && !UserHaveAbility(userConnected.user, action, table) && children}
        </>
    );
};

export default UserCan;
