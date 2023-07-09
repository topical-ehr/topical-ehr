import { makeStyles, tokens } from "@fluentui/react-components";

export const styles = makeStyles({
    horizontal: {
        display: "flex",
        columnGap: tokens.spacingHorizontalM,
    },
    vgap: {
        marginTop: tokens.spacingVerticalM,
    },

    textboxNarrow: {
        width: "4em",
    },
    textboxWide: {
        width: "6em",
    },
    textboxWideWide: {
        width: "7em",
    },

    alignRight: {
        justifySelf: "right",
    },
});

export const controlSize = "medium";
