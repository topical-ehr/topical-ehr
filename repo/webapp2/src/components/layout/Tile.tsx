interface Props {
    title: string;
    children: React.ReactNode;
}
export function Tile(props: Props) {
    return (
        <div
            style={{
                // height: "100%",
                maxHeight: "50vh",
                overflowY: "auto",
                border: "1px solid gray",
                paddingLeft: "1em",
                margin: "1em",
            }}
        >
            <h3 style={{ paddingLeft: "0.5em", cursor: "move" }} className="draggable-handle">
                {props.title}
            </h3>
            {props.children}
        </div>
    );
}
