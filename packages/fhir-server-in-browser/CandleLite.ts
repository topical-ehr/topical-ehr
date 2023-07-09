import * as Comlink from "comlink";

import type { CandleLiteWrapper as Wrapper } from "./CandleLiteWorker";
export type RemoteCandleLiteWrapper = Comlink.Remote<Wrapper>;

// need to run inside a WebWorker to use OPFS

const worker = new Worker(new URL("./CandleLiteWorker.ts", import.meta.url), {
    type: "module",
});

export const CandleLiteWrapper = Comlink.wrap<typeof Wrapper>(worker);
