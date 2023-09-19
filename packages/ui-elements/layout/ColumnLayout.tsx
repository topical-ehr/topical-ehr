import React from "react";
import css from "./ColumnLayout.module.scss";

interface LayoutProps {
    children: React.ReactNode;
}
export function ColumnLayout(props: LayoutProps) {
    return <div className={css.columnContainer}>{props.children}</div>;
}

interface ColumnProps {
    children: React.ReactNode;
    width: string;
    marginLeft?: string;
}
export function Column(props: ColumnProps) {
    const { width, marginLeft } = props;
    return (
        <div
            className={css.column}
            style={{ width, marginLeft }}
        >
            {props.children}
        </div>
    );
}
