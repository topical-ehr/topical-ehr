import { makeStyles, tokens, shorthands } from "@fluentui/react-components";

interface Props {
    children: React.ReactNode[];
}

const styles = makeStyles({
    grid: {
        display: "grid",
        gridTemplateColumns: "auto auto",
        alignItems: "center",

        rowGap: tokens.spacingVerticalS,
        columnGap: tokens.spacingHorizontalXS,
        // ...shorthands.margin(tokens.spacingVerticalM),
    },
});

export function FieldGrid(props: Props) {
    const classes = styles();

    return <div className={classes.grid}>{props.children}</div>;
}
