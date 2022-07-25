importScripts("https://cdn.jsdelivr.net/npm/vega@5");
importScripts("https://cdn.jsdelivr.net/npm/vega-lite@5");
// importScripts("https://vega.github.io/vega/vega.min.js");

// import { compile, TopLevelSpec } from "vega-lite";
// import type { TopLevelSpec } from "vega-lite";
// import { parse, View } from "vega";

let vegaView = null;

addEventListener('message', async (event) => {
    if (event.data.vegaliteSpec) {
        // load spec
        const vegaSpec = vegaLite.compile(event.data.vegaliteSpec, {}).spec;

        const runtime = vega.parse(vegaSpec);
        vegaView = new vega.View(runtime, {
            renderer: "svg",
        });
    } else {
        // render a chart
        const { requestId, vegaData } = event.data;
        // console.log("got request", requestId, { vegaData });

        vegaView.data('main', vegaData.main);
        await vegaView.runAsync();
        const svg = await vegaView.toSVG();
        postMessage({ requestId, svg });
    }
});