"use client";

import { Button, Form, InputGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { ImageSrc } from "@/tools/Homepage-BasePath";
import { SmallIcone } from "../const";

export const TableKeyFilter = (tableKey: string) => `filter-${tableKey}`;

const applyFilter = (filter: string, setFilter: (filter: string) => void, tableKey?: string) => {
    if (tableKey) {
        localStorage.setItem(TableKeyFilter(tableKey), filter);
    }
    setFilter(filter);
};

const FilterRows = ({
    filter,
    tableKey,
    setFilter,
}: {
    filter: string;
    tableKey?: string;
    setFilter: (filter: string) => void;
}) => {
    const { t } = useTranslation();
    const clear = () => setFilter("");
    return (
        <InputGroup className="mb-3">
            <Button variant="light" size="sm">
                <Image aria-hidden src={ImageSrc("find.svg")} alt="find" width={SmallIcone.width} height={SmallIcone.height} />
            </Button>
            <Form.Control
                autoFocus
                placeholder={t("Common.filter")}
                onChange={(e) => applyFilter(e.target.value, setFilter, tableKey)}
                value={filter}
            />
            <Button variant="light" onClick={clear} size="sm">
                <Image aria-hidden src={ImageSrc("trash.svg")} alt="trash" width={SmallIcone.width} height={SmallIcone.height} />
            </Button>
        </InputGroup>
    );
};

export default FilterRows;
