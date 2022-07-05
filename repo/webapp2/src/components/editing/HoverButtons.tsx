interface ContainerProps {
    children: JSX.Element[] | JSX.Element;
}
interface ButtonProps {
    onClick: () => void;
}

export function HoverButtons(props: ContainerProps) {
    return (
        <div className="hover-buttons" style={{ float: "right" }}>
            {props.children}
        </div>
    );
}

function IconButton(props: ButtonProps & { children: JSX.Element; title: string }) {
    function onClick() {
        props.onClick();
        return false;
    }

    return (
        <a href="#" onClick={onClick} title={props.title} style={{ marginLeft: "1em" }}>
            {props.children}
        </a>
    );
}

export function HoverButtonEdit(props: ButtonProps) {
    // THANKS TO https://uxwing.com/edit-round-line-icon/
    // https://react-svgr.com/playground/?expandProps=none
    return (
        <IconButton {...props} title="Edit (or double-click)">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 122.88 122.88"
                style={{ height: "1.5em" }}
                xmlSpace="preserve"
            >
                <path d="M61.44 0c16.97 0 32.33 6.88 43.44 18 11.12 11.12 18 26.48 18 43.44 0 16.97-6.88 32.33-18 43.44-11.12 11.12-26.48 18-43.44 18S29.11 116 18 104.88C6.88 93.77 0 78.41 0 61.44S6.88 29.11 18 18C29.11 6.88 44.47 0 61.44 0zm15.61 36.16c-.6-.56-1.28-.85-2.05-.81-.77 0-1.45.3-2.01.9l-4.53 4.7L81.15 53.2l4.57-4.78c.56-.55.77-1.28.77-2.05 0-.77-.3-1.49-.85-2.01l-8.59-8.2zM53.31 82.11c-1.67.56-3.37 1.07-5.04 1.62-1.67.56-3.33 1.11-5.04 1.67-3.97 1.28-6.15 2.01-6.62 2.14-.47.13-.17-1.71.81-5.55l3.16-12.09.26-.27 12.47 12.48zm-7.86-17.28L65.04 44.5l12.68 12.21-19.8 20.59-12.47-12.47zm55.63-43.03C90.93 11.66 76.92 5.39 61.44 5.39S31.95 11.66 21.8 21.8C11.66 31.95 5.39 45.96 5.39 61.44s6.27 29.49 16.42 39.64c10.14 10.14 24.16 16.42 39.64 16.42s29.49-6.27 39.64-16.42c10.14-10.14 16.42-24.16 16.42-39.64-.02-15.48-6.29-29.49-16.43-39.64z" />
            </svg>
        </IconButton>
    );
}

export function HoverButtonDelete(props: ButtonProps) {
    // THANKS TO https://uxwing.com/remove-icon/
    // https://react-svgr.com/playground/?expandProps=none

    return (
        <IconButton {...props} title="Delete">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 122.87 122.87"
                width="1.5em"
                height="1.5em"
            >
                <path d="M18 18A61.45 61.45 0 1 1 0 61.44 61.28 61.28 0 0 1 18 18Zm59.38 21 6.53 6.54a4 4 0 0 1 0 5.63L73.6 61.44l10.31 10.31a4 4 0 0 1 0 5.63l-6.53 6.53a4 4 0 0 1-5.63 0L61.44 73.6 51.13 83.91a4 4 0 0 1-5.63 0L39 77.38a4 4 0 0 1 0-5.63l10.28-10.31L39 51.13a4 4 0 0 1 0-5.63l6.5-6.5a4 4 0 0 1 5.63 0l10.31 10.28L71.75 39a4 4 0 0 1 5.63 0ZM61.44 10.54a50.91 50.91 0 1 0 36 14.91 50.83 50.83 0 0 0-36-14.91Z" />
            </svg>
        </IconButton>
    );
}

export function HoverButtonUndo(props: ButtonProps) {
    // THANKS TO https://uxwing.com/rotate-left-arrow-icon/
    // https://react-svgr.com/playground/?expandProps=none

    return (
        <IconButton {...props} title="Undo all edits">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                shapeRendering="geometricPrecision"
                textRendering="geometricPrecision"
                imageRendering="optimizeQuality"
                fillRule="evenodd"
                clipRule="evenodd"
                viewBox="0 0 512 452.64"
                width="1.5em"
                height="1.5em"
            >
                <path d="M143.65 161.02c33.05-59.34 90.64-98.27 164.75-89.98 69.06 7.72 131.91 57.64 147.19 131.68 12.78 62-10.79 121.11-52.63 161.1-48.87 46.7-122.66 67.32-192.61 36.01-35.84-16.05-60.23-36.5-78.47-62.84-1.86-2.45-4.36-6.41-7.83-8.99-10.07-7.53-23.32 1.41-21.28 12.43.43 2.36 1.49 4.88 3.36 7.53 15 23.71 31.64 41.83 53.38 58.4 49.84 37.98 114.27 55.13 178.92 41.8 60.23-12.41 109.18-48.92 139.51-97.8 53.04-85.46 40.95-188.32-14.26-260.43-34.29-44.79-85.22-77.72-147.5-87.26C211.03-13.44 105.47 44.94 71.66 137.99l-42.51-13.6c-11.78-3.73-24.37 2.79-28.1 14.57a22.326 22.326 0 0 0 .9 15.89l48.64 108.53c5.04 11.3 18.29 16.37 29.59 11.32l1.65-.82.02.03 106.62-58.84c10.86-5.97 14.83-19.61 8.87-30.47-3.15-5.74-8.44-9.55-14.34-11l-39.35-12.58z" />
            </svg>
        </IconButton>
    );
}
