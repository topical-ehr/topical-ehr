import { initializeIcons } from "@fluentui/react/lib/Icons";
import { render } from "react-dom";
import { App } from "./app";

initializeIcons(/* optional base url */);

render(<App />, document.getElementById("app")!);
