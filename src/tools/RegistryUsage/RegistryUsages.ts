import { Cosign } from "./Cosign";
import { Curl } from "./Curl";
import { Docker } from "./Docker";
import { Helm } from "./Helm";
import { Kubectl } from "./Kubectl";
import { ImageMeta } from "./RegistryUsage";

export type Usage = Docker | Curl | Kubectl | Helm | Cosign;
export const RegistryUsages = (infos: ImageMeta | undefined) : Usage[]=> {
    switch (infos?.registry.type) {
        case "oci": return [new Docker(), new Curl(), new Kubectl(), new Helm(), new Cosign()];
        case "helm": return [new Helm(), new Cosign()];
    }
    // Docker
    return [new Docker(), new Kubectl(), new Cosign()];
};
