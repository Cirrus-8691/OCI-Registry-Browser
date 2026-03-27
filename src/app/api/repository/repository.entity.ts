import { DbRow } from "@/tools/Database/PostgreSql";
import { RegistryEntity } from "../registry/registry.entity";
import HeaderEntity from "../registry/test/header.entity";

export interface RepositoryEntity extends DbRow {
  id?: number;
  registryId: number;
  name: string;
  tag: string;

  digestV2: string;
  rating: number;
  description: string; // "org.opencontainers.image.description"
  licenses: string; // "org.opencontainers.image.licenses"
  created: string; // "org.opencontainers.image.created
  os: string;
  architecture: string;
  size: number; // manifestV2 somme des sizes des layers
}

export interface Repository {
  repository : string;
  rating: number;
  description: string;
}
/*
  curl -X GET http://localhost:32000/v2/_catalog
  {"repositories":["emoji","helm-chart/emoji"]}
 */
export interface CatalogEntity {
  repositories: Repository[];
}
export interface ExtendedCatalogEntity extends CatalogEntity {
  registry: RegistryEntity;
  header: HeaderEntity | undefined;
}
