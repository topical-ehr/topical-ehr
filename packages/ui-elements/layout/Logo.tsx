import { MessageBarButton } from "@fluentui/react";

import css from "./Logo.module.scss";

export function Logo() {
    return (
        <a
            href="/"
            className={css.container}
        >
            {/* <b>TopicalEHR</b> */}
            <MessageBarButton
                text="🧑‍⚕️ Test User"
                style={{ borderRadius: "9px" }}
            ></MessageBarButton>
            {/* <span> 0.0.1</span> */}
        </a>
    );
}
