import { CreateRegistryDto } from "./create/createRegistry.dto";

export interface UpdateRegistryDto extends CreateRegistryDto {
    id: number;
}
