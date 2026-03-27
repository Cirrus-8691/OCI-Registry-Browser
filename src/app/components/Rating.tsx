"use client";
import Image from "next/image";
import { ImageSrc } from "@/tools/Homepage-BasePath";
import { FC, useState } from "react";
import { Button, InputGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { SmallIcone } from "./const";

interface RatingProps {
    id?: string;
    value: number | undefined;
    updateValue?: (newValue: number) => void;
}

export const Rating: FC<RatingProps> = ({ id, value, updateValue }) => {
    const [hoverAt, setHoverAt] = useState<number | null>(null);
    const { t } = useTranslation();
    return (
        <>
            {updateValue && <InputGroup.Text>{t("Repository.rating")}</InputGroup.Text>}
            <div
                style={{
                    cursor: updateValue ? "pointer" : undefined,
                    fontSize: "24px",
                    color: "#ffe022",
                    border: updateValue ? "1px solid lightgrey" : undefined,
                    backgroundColor: updateValue ? "#5dafe6" : undefined,
                }}
            >
                {[0, 1, 2, 3, 4].map((i) => {
                    const fullStars = hoverAt ?? value ?? 0;
                    return (
                        <span
                            onMouseOver={updateValue ? () => setHoverAt(i + 1) : undefined}
                            onMouseOut={updateValue ? () => setHoverAt(null) : undefined}
                            onClick={updateValue ? () => updateValue(i + 1) : undefined}
                            key={`${id}_${i}`}
                        >
                            {i < fullStars ? "\u2605" : "\u2606"}
                        </span>
                    );
                })}
            </div>
            {updateValue && (
                <Button
                    variant="light"
                    onClick={() => updateValue(0)}
                    style={{
                        border: "1px solid lightgrey",
                    }}
                >
                    <Image aria-hidden src={ImageSrc("trash.svg")} alt="del" width={SmallIcone.width} height={SmallIcone.height} />
                </Button>
            )}
        </>
    );
};
