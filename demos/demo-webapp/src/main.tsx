import React from "react";
import ReactDOM from "react-dom/client";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import { App } from "./App";
import "./index.css";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

initializeIcons(/* optional base url */);

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
    // <React.StrictMode>
    <FluentProvider theme={webLightTheme}>
        <App />
    </FluentProvider>
    // </React.StrictMode>
);
