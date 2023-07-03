import React from "react";
import ReactDOM from "react-dom/client";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import { App } from "./App.tsx";
import "./index.css";

initializeIcons(/* optional base url */);

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
