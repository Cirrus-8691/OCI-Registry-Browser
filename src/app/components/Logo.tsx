import Copyright from "@/tools/Copyright";
import { ImageSrc } from "@/tools/Homepage-BasePath";
import Image from "next/image";

const Logo = ({ image = "library" }: { image?: string }) => (
    <>
        {Copyright.name} {Copyright.version}
        <p>
            <Image src={ImageSrc("oci.svg")} alt="OCI logo" width={180} height={180} priority />
            &nbsp;&nbsp;&nbsp;&nbsp;
            <Image src={ImageSrc(`${image}.svg`)} unoptimized alt={image} width={180} height={180} priority />
        </p>
    </>
);

export default Logo;
