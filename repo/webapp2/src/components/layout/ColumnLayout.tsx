import css from "./ColumnLayout.module.scss";

interface LayoutProps {
    children: React.ReactNode;
}
export function ColumnLayout(props: LayoutProps) {
    return <div className={css.container}>{props.children}</div>;
}

interface ColumnProps {
    children: React.ReactNode;
    width: string;
}
export function Column(props: ColumnProps) {
    return <div style={{ width: props.width }}>{props.children}</div>;
}
