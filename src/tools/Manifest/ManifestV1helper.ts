import { HistoryV1, V1Compatibility, ManifestV1, Config } from "@/app/api/repository/manifest/manifest.entity";

export default class ManifestV1helper {
    static getFirst(container_config: Config | undefined, what: string): string {
        if (container_config) {
            return container_config[what]?.[0] || "";
        }
        return "";
    }

    static decode(history: HistoryV1 | undefined): V1Compatibility {
        return history && history.v1Compatibility
            ? (JSON.parse(history.v1Compatibility) as V1Compatibility)
            : {
                  id: "",
                  created: "",
                  os: undefined,
                  container_config: undefined,
              };
    }

    static getHistoryAt(manifest: ManifestV1, at: number) {
        return manifest.history && manifest.history.length > 0 ? manifest.history.at(at) : undefined;
    }

    static getSignatures0(manifest: ManifestV1) {
        return manifest.signatures && manifest.signatures.length > 0
            ? manifest.signatures[0]
            : {
                  signature: undefined,
                  protected: undefined,
              };
    }

    static extract(what: string, manifest: ManifestV1 | undefined): string {
        let value: string | undefined = undefined;
        if (manifest) {
            switch (what) {
                case "os":
                    value = ManifestV1helper.decode(ManifestV1helper.getHistoryAt(manifest, 0))?.os;
                    break;
                case "created":
                    value = ManifestV1helper.decode(ManifestV1helper.getHistoryAt(manifest, 0))?.created;
                    break;
                case "fromImage":
                    value = ManifestV1helper.getFirst(ManifestV1helper.decode(ManifestV1helper.getHistoryAt(manifest, -1))?.container_config, "Cmd");
                    break;
                case "signature":
                    value = ManifestV1helper.getSignatures0(manifest).signature;
                    break;
                case "protected":
                    value = ManifestV1helper.getSignatures0(manifest).protected;
                    break;
            }
        }
        return value ?? "";
    }
}
