import { ImageSrc } from "@/tools/Homepage-BasePath";
import { RegistryType } from "../api/registry/registry.entity";
import Image from "next/image";

const RegistryIcone = ({ type, size=28 }: { type: RegistryType; size?: number; }) => {
    switch (type) {
        case "docker":
            return <Image aria-hidden src={ImageSrc("docker.svg")} alt="arrowleft icone" width={size} height={size} />;
        case "helm":
            return <Image aria-hidden src={ImageSrc("helm.svg")} alt="arrowleft icone" width={size} height={size} />;
    }
    return <Image aria-hidden src={ImageSrc("oci-small.svg")} alt="arrowleft icone" width={size} height={size} />;
};

export default RegistryIcone;