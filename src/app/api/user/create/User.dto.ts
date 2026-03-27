import { Profile } from "../entites/user.entity";

export interface UserDto {
    email: string;
    desc?: string;
    password?: string;
    profile: Profile;
    mustChangePassword?: boolean;
}
