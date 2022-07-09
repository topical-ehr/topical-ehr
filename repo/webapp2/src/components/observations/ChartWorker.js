// importScripts("https://vega.github.io/vega/vega.min.js");
importScripts("https://cdn.jsdelivr.net/npm/vega@5");
importScripts("https://cdn.jsdelivr.net/npm/vega-lite@5");
// import { compile, TopLevelSpec } from "vega-lite";
// import type { TopLevelSpec } from "vega-lite";
// import { parse, View } from "vega";

const spec = {
    height: 30,
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: {
        values: [
            { a: "C", b: 2 },
            { a: "C", b: 7 },
            { a: "C", b: 4 },
            { a: "D", b: 1 },
            { a: "D", b: 2 },
            { a: "D", b: 6 },
            { a: "E", b: 8 },
            { a: "E", b: 4 },
            { a: "E", b: 7 },
        ],
    },
    mark: "rule",
    encoding: {
        x: { field: "a", type: "nominal", title: null },
        y: { aggregate: "average", field: "b", type: "quantitative", title: null },
    },
};
const spec2 = {
    "height": 30,
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "data": {
        "values": [
            { "date": "2022-07-09", "value": 270, "color": "red" },
            { "date": "2022-07-01", "value": 220, "color": "green" },
            { "date": "2022-06-10", "value": 240, "color": "green" },
            { "date": "2022-06-2", "value": 300, "color": "red" }
        ]
    },
    "layer": [
        {
            "mark": { "type": "point", "filled": true, "tooltip": true, "size": 120 },
            "encoding": {
                "color": { "field": "color", "type": "nominal", "scale": null },
                "x": { "field": "date", "type": "temporal", "title": null, "axis": null },
                "y": {
                    "field": "value",
                    "type": "quantitative",
                    "scale": { "zero": false },
                    "title": null,
                    "axis": null
                }
            }
        },
        {
            "mark": { "type": "rule", "size": 3 },
            "data": { "values": [{ "date": "2022-07-09", "value": 270, "color": "red" }] },
            "encoding": {
                "color": { "field": "color", "type": "nominal", "scale": null },
                "x": { "field": "date", "type": "temporal", "title": null, "axis": null },
                "y": {
                    "field": "value",
                    "type": "quantitative",
                    "scale": { "zero": false },

                    "title": null,
                    "axis": null
                }
            }
        }
    ]
};

var vgSpec = vegaLite.compile(spec2, {}).spec;

const runtime = vega.parse(vgSpec);
const view = new vega.View(runtime, {
    renderer: "svg",
});
view.runAsync().then(async () => {
    const svg = await view.toSVG();
    console.log({ svgFromWorker: svg });
});
