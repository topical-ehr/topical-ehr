import css from "./ColumnLayout.module.scss";

interface LayoutProps {
    children: React.ReactElement<ColumnProps>[];
}
export function ColumnLayout(props: LayoutProps) {
    return <div class={css.container}>{props.children}</div>;
}

interface ColumnProps {
    children: React.ReactNode[] | React.ReactNode;
}
export function Column(props: ColumnProps) {
    return <div>{props.children}</div>;
}
