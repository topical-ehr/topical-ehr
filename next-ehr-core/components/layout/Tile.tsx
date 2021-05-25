interface Props {
    title: string;
    children: React.ReactNode;
}
export function Tile(props: Props) {
    return (
        <div style={{
            height: '100%',
            overflowY: 'auto',
            border: '1px solid gray'
        }}>
            <h3
                style={{ paddingLeft: "0.5em", cursor: "move" }}
                className="draggable-handle"
            >
                {props.title}
            </h3>
            {props.children}
        </div>
    );
}