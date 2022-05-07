import css from "./ColumnLayout.module.scss";

interface LayoutProps {
    children: React.ReactNode;
}
export function ColumnLayout(props: LayoutProps) {
    return <div className={css.container}>{props.children}</div>;
}

interface ColumnProps {
    children: React.ReactNode;
}
export function Column(props: ColumnProps) {
    return <div>{props.children}</div>;
}
