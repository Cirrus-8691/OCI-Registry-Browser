import Copyright from "@/tools/Copyright";
import Image from "next/image";

import styles from "../page.module.css";
import { useState } from "react";
import DialogAbout from "../dialog/DialogAbout";
import { Button } from "react-bootstrap";
import { ImageSrc } from "@/tools/Homepage-BasePath";
import { SmallIcone } from "./const";

const Footer = () => {
    const [showAbout, setShowAbout] = useState(false);
    return (
        <>
            <DialogAbout show={showAbout} setShow={setShowAbout} />
            <footer className={styles.footer}>
                <Button variant="link" onClick={() => setShowAbout(true)}>
                    {Copyright.copyright}
                </Button>
                <a
                    href="https://specs.opencontainers.org/distribution-spec/detail/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button variant="link">
                        <Image
                            aria-hidden
                            src={ImageSrc("oci.svg")}
                            alt="oci"
                            width={SmallIcone.width}
                            height={SmallIcone.height}
                        />{" "}
                        Open Container Initiative →
                    </Button>
                </a>
            </footer>
        </>
    );
};

export default Footer;
