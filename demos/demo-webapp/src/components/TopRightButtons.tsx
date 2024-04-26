import React from "react";

type Props = {
    children: React.ReactNode;
};

export default function TopRightButtons({ children }: Props) {
    return <div style={{ float: "right", display: "flex", gap: "1em" }}>{children}</div>;
}
