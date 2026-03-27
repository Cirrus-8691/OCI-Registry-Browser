import { RegistryType } from "../../registry/registry.entity";
import HeaderEntity from "../../registry/test/header.entity";
import { Repository } from "../repository.entity";
/*
curl -X GET http://localhost:32000/v2/emoji/tags/list
{"name":"emoji","tags":["0.1.0"]}
*/
export interface TagsEntity {
    registry: {
        name: string;
        url: string;
        gnUrl?: string;
        user?: string;
        type: RegistryType;
    };
    name: string;
    tags: string[];
}

export interface TagDetails {
    tag: string;
    header: HeaderEntity;
    rating: number;
    size: number | undefined;
    desc: string | undefined;
    os: string | undefined;
    architecture: string | undefined;
    created: string | undefined;
}

export interface TagsHeaderEntity extends Omit<TagsEntity, "tags"> {
    repository: Repository;
    tags: TagDetails[];
}
