import css from "./ColumnLayout.module.scss";
import React from "react";

interface LayoutProps {
    children: React.ReactNode;
}
export function ColumnLayout(props: LayoutProps) {
    return <div className={css.container}>{props.children}</div>;
}

interface ColumnProps {
    children: React.ReactNode;
    width: string;
    marginLeft?: string;
}
export function Column(props: ColumnProps) {
    const { width, marginLeft } = props;
    return <div style={{ width, marginLeft }}>{props.children}</div>;
}
