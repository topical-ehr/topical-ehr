import ReactGridLayout, { Responsive, WidthProvider } from "react-grid-layout";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

interface Props {
    layout: ReactGridLayout.Layout[];
    children: React.ReactNode;
}

export function ResizableGridLayout(props: Props) {
    const { layout } = props;

    return (
        <div>
            <ResponsiveReactGridLayout
                style={{
                    height: "760px",
                }}
                draggableHandle=".draggable-handle"
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                layouts={{
                    lg: layout,
                    md: layout,
                    sm: layout,
                    xs: layout,
                    xxs: layout,
                }}
                measureBeforeMount // no animation on mount
            >
                {props.children}
            </ResponsiveReactGridLayout>
        </div>
    );
}
