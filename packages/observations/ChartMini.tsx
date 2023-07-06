import React from "react";
import { createClassFromSpec } from "react-vega";
import { FixedVegaChartProps } from "react-vega/lib/createClassFromSpec";
import { compile } from "vega-lite";
import vegaliteSpec from "./ChartMini.vegalite.json";

import "./ChartMini.scss";

const worker = new Worker(new URL("./ChartWorker.js", import.meta.url));
worker.postMessage({ vegaliteSpec });

const workerRequests = new Map<number, (svg: string) => void>();
worker.onmessage = (event) => {
    const { requestId, svg } = event.data;
    const setSvg = workerRequests.get(requestId);
    if (setSvg) {
        workerRequests.delete(requestId);
        setSvg(svg);
    } else {
        console.error("request not found!", event);
    }
};
let nextWorkerRequestId = 1;

interface SelectedPoint {
    elt: SVGElement;
    stroke: string | null;
    fill: string | null;
}

function unselectPoint(point: SelectedPoint) {
    point.elt.setAttribute("stroke", point.stroke ?? "");
    point.elt.setAttribute("fill", point.fill ?? "");
}

function getTooltipDiv() {
    const tooltip = document.getElementById("chart-tooltip");
    if (tooltip) {
        return tooltip;
    }

    const newDiv = document.createElement("div");
    newDiv.id = "chart-tooltip";
    newDiv.style.position = "fixed";
    newDiv.style.backgroundColor = "lightgrey";
    newDiv.style.zIndex = "1000";
    newDiv.innerHTML = "Tooltip";
    document.body.appendChild(newDiv);
    return newDiv;
}

function getClosestPoint(target: SVGElement, mouseX: number) {
    function matches(elt: SVGElement) {
        return elt.getAttribute("aria-roledescription") === "point";
    }

    if (matches(target)) {
        return target;
    }

    const svg = target.ownerSVGElement;
    if (!svg) {
        return;
    }
    const paths = svg.querySelectorAll("path");

    let closestPath: SVGPathElement | null = null;
    let closestDistance = Infinity;

    for (const path of paths) {
        if (matches(path)) {
            const rect = path.getBoundingClientRect();
            const centerX = rect.x + rect.width / 2;
            const distance = Math.abs(centerX - mouseX);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPath = path;
            }
        }
    }

    return closestPath;
}

function ChartMiniViaWorker(props: FixedVegaChartProps) {
    const [svg, setSvg] = React.useState<string | null>(null);
    const divRef = React.useRef<HTMLDivElement>(null);

    const selectedPoint = React.useRef<SelectedPoint | null>(null);

    // Render SVG via WebWorker
    React.useEffect(() => {
        const requestId = nextWorkerRequestId;
        nextWorkerRequestId += 1;
        workerRequests.set(requestId, setSvg);
        worker.postMessage({ requestId, vegaData: props.data });
    }, []);

    // Dynamic legend
    function onMouseMove(event: Event) {
        const target = event.target as SVGElement;
        const mouseX = (event as MouseEvent).clientX;
        const closestPath = getClosestPoint(target, mouseX);

        // const svgElt = divRef.current?.firstChild;
        // console.log("mouseMove", { event, closestPath, svgElt });

        if (closestPath) {
            if (selectedPoint.current?.elt !== closestPath) {
                if (selectedPoint.current) {
                    unselectPoint(selectedPoint.current);
                }

                const stroke = closestPath.getAttribute("stroke");
                const fill = closestPath.getAttribute("fill");

                closestPath.setAttribute("fill", "#FFD700");
                if (fill && !stroke) {
                    closestPath.setAttribute("stroke", fill);
                }

                selectedPoint.current = {
                    elt: closestPath,
                    stroke,
                    fill,
                };

                const tooltip = getTooltipDiv();
                tooltip.style.visibility = "visible";
                tooltip.style.left = mouseX + "px";

                const svg = target.ownerSVGElement!;
                const chartBackground = svg.querySelector(".background");
                tooltip.style.top = (chartBackground ?? svg).getBoundingClientRect().bottom + 10 + "px";

                // paths have
                // aria-label="date: Jun 19, 2010; value: 94; range: normal"
                const ariaLabel = closestPath.getAttribute("aria-label") ?? "";
                const fields = ariaLabel.split("; ").map((f) => f.split(": "));
                const date = fields.find((f) => f[0] === "date")?.[1];
                const value = fields.find((f) => f[0] === "value")?.[1];
                const range = fields.find((f) => f[0] === "range")?.[1];
                const units = (props.data as any).main[0].units;
                tooltip.innerHTML = `
                    <div>
                        <span class="value">${value}</span> <span>${units}</span> <span class="${range}">(${range})</span>
                    </div>
                    <div>${date}</div>`;
                if (range) {
                    tooltip.className = range;
                    // console.log({ range, tooltip });
                }
            }
        }
    }
    function onMouseOut(event: Event) {
        if (selectedPoint.current) {
            unselectPoint(selectedPoint.current);
            selectedPoint.current = null;

            // hide tooltip
            const tooltip = getTooltipDiv();
            tooltip.style.visibility = "hidden";
        }
    }
    React.useEffect(() => {
        const svgElt = divRef.current?.firstChild;
        if (svgElt) {
            svgElt.addEventListener("mousemove", onMouseMove);
            svgElt.addEventListener("mouseout", onMouseOut);

            return function cleanup() {
                svgElt.removeEventListener("mousemove", onMouseMove);
                svgElt.removeEventListener("mouseout", onMouseOut);
            };
        }
    }, [svg]);

    function onContainerClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.ctrlKey) {
            alert(JSON.stringify(props.data, null, 2));
        }
    }

    if (svg) {
        return (
            <div onClick={onContainerClick}>
                <div
                    ref={divRef}
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
                <div style={{ color: "black", width: "2px" }} />
            </div>
        );
    } else {
        // return <div>Loading...</div>;
        return null;
    }
}

// @ts-ignore
var vegaSpec = compile(vegaliteSpec, {}).spec;

const ChartMiniDirect = createClassFromSpec({
    mode: "vega",
    spec: vegaSpec,
});

const useWebWorker = true;
export const ChartMini = useWebWorker ? ChartMiniViaWorker : ChartMiniDirect;
