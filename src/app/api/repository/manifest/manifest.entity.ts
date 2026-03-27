import HeaderEntity from "../../registry/test/header.entity";

export type ManifertAccepted = "manifest" | "oci" | "v1" | "v2";

interface Ports {
    [port: string]: unknown;
}

export interface Config {
    [command: string]: string[];
}
export interface HistoryV1 {
    v1Compatibility: string;
}

export interface V1Compatibility {
    architecture?: string;
    config?: {
        ExposedPorts: Ports;
        Env: string[];
        Entrypointv: string[];
        Cmdv: string[];
        WorkingDir: string;
        ArgsEscaped: true;
        Labels: {
            [key: string]: string;
        };
    };
    created: string;
    id: string;
    os?: string;
    parent?: string;
    comment?: string;
    container_config?: Config;
    throwaway?: true;
}

export interface BaseManifest {
    schemaVersion?: number;
}
export interface ManifestV1 extends BaseManifest {
    name?: string;
    tag?: string;
    architecture?: string;
    // ... fsLayers,
    history?: HistoryV1[];
    signatures?: {
        header: {
            jwk: {
                crv: string;
                kid: string;
                kty: string;
                x: string;
                y: string;
            };
            alg: string;
        };
        signature: string;
        protected: string;
    }[];
}

/**
 *
 * https://edu.chainguard.dev/open-source/sigstore/cosign/how-to-install-cosign/
 *
 */

export const IsManfestV1 = (manifest: Manifest | undefined) => manifest && manifest.schemaVersion === 1;

export interface Layers {
    digest?: string;
    mediaType?: string;
    size?: number;
}
export interface ManifestV2 extends BaseManifest {
    mediaType?: string;
    config?: Layers;
    layers?: Layers[];
    annotations?: {
        [command: string]: string;
    };
}

export type Manifest = ManifestV1 | ManifestV2;

export interface ManifestEntity {
    manifest: Manifest;
    header: HeaderEntity;
    type: ManifertAccepted;
}

export type ConfigEntity = ConfigDocker | ConfigHelm;
export interface ConfigDocker {
    architecture: string;
    config: {
        ExposedPorts: Ports;
        Env: string[];
        Entrypointv: string[];
        Cmdv: string[];
        WorkingDir: string;
        ArgsEscaped: true;
        Labels: {
            [key: string]: string;
        };
    };
    created: string;
    os: string;
    history: {
        created: string;
        created_by: string;
        comment: string;
        empty_layer?: boolean;
    }[];
    rootfs: {
        type: string;
        diff_ids: string[];
    }
}
export interface ConfigHelm {
    name: string;
    home: string;
    sources: string[];
    version: string;
    description: string;
    maintainers: [
        {
            [key: string]: string;
        }
    ];
    icon: string;
    apiVersion: string;
    appVersion: string;
    annotations: {
        [key: string]: string;
    };
    type: string;
}
