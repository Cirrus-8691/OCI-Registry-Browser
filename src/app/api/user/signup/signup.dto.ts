import { CreateRegistryDto } from "../../registry/create/createRegistry.dto";

export interface SignupDto {
    user: {
        email: string;
        password: string;
    },
    registry: CreateRegistryDto;
}