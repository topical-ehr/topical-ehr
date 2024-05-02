import * as Comlink from "comlink";
// need to run inside a WebWorker to use OPFS
const worker = new Worker(new URL("./CandleLiteWorker.ts", import.meta.url), {
    type: "module",
});
export const CandleLiteWrapper = Comlink.wrap(worker);
//# sourceMappingURL=CandleLite.js.map