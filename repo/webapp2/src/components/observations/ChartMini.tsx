import { createClassFromSpec, VisualizationSpec } from "react-vega";
import { compile } from "vega-lite";
import { parse, View } from "vega";

// import ChartWorker from "./ChartWorker?worker";
// new ChartWorker();

const worker = new Worker(new URL("./ChartWorker.js", import.meta.url));

const spec2: VisualizationSpec = {
    height: 30,
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: {
        values: [
            { date: "2022-07-09", value: 270, color: "red" },
            { date: "2022-07-01", value: 220, color: "green" },
            { date: "2022-06-10", value: 240, color: "green" },
            { date: "2022-06-2", value: 300, color: "red" },
        ],
    },
    layer: [
        {
            mark: { type: "point", filled: true, tooltip: true, size: 120 },
            encoding: {
                color: { field: "color", type: "nominal", scale: null },
                x: { field: "date", type: "temporal", title: null, axis: null },
                y: {
                    field: "value",
                    type: "quantitative",
                    scale: { zero: false },
                    title: null,
                    axis: null,
                },
            },
        },
        {
            mark: { type: "rule", size: 3 },
            data: { values: [{ date: "2022-07-09", value: 270, color: "red" }] },
            encoding: {
                color: { field: "color", type: "nominal", scale: null },
                x: { field: "date", type: "temporal", title: null, axis: null },
                y: {
                    field: "value",
                    type: "quantitative",
                    scale: { zero: false },

                    title: null,
                    axis: null,
                },
            },
        },
    ],
};
var vgSpec = compile(spec2, {}).spec;

const runtime = parse(vgSpec);
const view = new View(runtime, {
    renderer: "svg",
});
// view.runAsync().then(async () => {
//     const svg = await view.toSVG();
//     console.log({ svg });
// });

export const ChartMini = createClassFromSpec({
    mode: "vega",
    spec: vgSpec,
});
