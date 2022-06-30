import css from "./HoverButtons.module.scss";

interface Props {
    onEdit: () => void;
}

export function HoverButtons(props: Props) {
    const editIcon = (
        // THANKS TO https://uxwing.com/edit-round-line-icon/
        // https://react-svgr.com/playground/?expandProps=none
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 122.88 122.88"
            style={{ height: "1.5em" }}
            xmlSpace="preserve"
        >
            <path d="M61.44 0c16.97 0 32.33 6.88 43.44 18 11.12 11.12 18 26.48 18 43.44 0 16.97-6.88 32.33-18 43.44-11.12 11.12-26.48 18-43.44 18S29.11 116 18 104.88C6.88 93.77 0 78.41 0 61.44S6.88 29.11 18 18C29.11 6.88 44.47 0 61.44 0zm15.61 36.16c-.6-.56-1.28-.85-2.05-.81-.77 0-1.45.3-2.01.9l-4.53 4.7L81.15 53.2l4.57-4.78c.56-.55.77-1.28.77-2.05 0-.77-.3-1.49-.85-2.01l-8.59-8.2zM53.31 82.11c-1.67.56-3.37 1.07-5.04 1.62-1.67.56-3.33 1.11-5.04 1.67-3.97 1.28-6.15 2.01-6.62 2.14-.47.13-.17-1.71.81-5.55l3.16-12.09.26-.27 12.47 12.48zm-7.86-17.28L65.04 44.5l12.68 12.21-19.8 20.59-12.47-12.47zm55.63-43.03C90.93 11.66 76.92 5.39 61.44 5.39S31.95 11.66 21.8 21.8C11.66 31.95 5.39 45.96 5.39 61.44s6.27 29.49 16.42 39.64c10.14 10.14 24.16 16.42 39.64 16.42s29.49-6.27 39.64-16.42c10.14-10.14 16.42-24.16 16.42-39.64-.02-15.48-6.29-29.49-16.43-39.64z" />
        </svg>
    );

    function onEdit() {
        props.onEdit();
        return false;
    }

    return (
        <div className="hover-buttons" style={{ float: "right" }}>
            <a href="#" onClick={onEdit} title="Edit (or double-click)">
                {editIcon}
            </a>
        </div>
    );
}
