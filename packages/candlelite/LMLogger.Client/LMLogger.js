import { empty, append, map, singleton, collect, delay, toList, last } from "../fable_modules/fable-library.4.0.0-theta-018/Seq.js";
import { split } from "../fable_modules/fable-library.4.0.0-theta-018/String.js";
import { class_type } from "../fable_modules/fable-library.4.0.0-theta-018/Reflection.js";
import { equals, createObj, defaultOf } from "../fable_modules/fable-library.4.0.0-theta-018/Util.js";
import { toString, isException } from "../fable_modules/fable-library.4.0.0-theta-018/Types.js";

export class Logger {
    constructor(filePath) {
        this._module = last(split(filePath, ["/", "\\"]));
    }
}

export function Logger$reflection() {
    return class_type("LMLogger.Logger", void 0, Logger);
}

export function Logger_$ctor_Z721C83C5(filePath) {
    return new Logger(filePath);
}

(() => {
    Logger["Sink@"] = defaultOf();
    Logger["InstanceId@"] = "";
    Logger["Component@"] = "";
    Logger["Context@"] = (new Map([]));
})();

export function Logger_get_Sink() {
    return Logger["Sink@"];
}

export function Logger_set_Sink_543D23EA(v) {
    Logger["Sink@"] = v;
}

export function Logger_get_InstanceId() {
    return Logger["InstanceId@"];
}

export function Logger_set_InstanceId_Z721C83C5(v) {
    Logger["InstanceId@"] = v;
}

export function Logger_get_Component() {
    return Logger["Component@"];
}

export function Logger_set_Component_Z721C83C5(v) {
    Logger["Component@"] = v;
}

export function Logger_get_Context() {
    return Logger["Context@"];
}

export function Logger_set_Context_Z2485C786(v) {
    Logger["Context@"] = v;
}

export function Logger__Log_1BDB2184(_, message, level, props) {
    let usecs;
    const arg = ((performance.now()) + (performance.timeOrigin)) * 1000;
    usecs = Math.floor(arg);
    const props_1 = createObj(toList(delay(() => collect((matchValue) => {
        const value = matchValue[1];
        const name = matchValue[0];
        const matchValue_1 = value;
        return isException(matchValue_1) ? singleton([name, toString(value)]) : singleton([name, value]);
    }, props))));
    const context = createObj(toList(delay(() => map((kv) => [kv[0], kv[1]], Logger_get_Context()))));
    const obj = createObj(toList(delay(() => append(singleton(["message", message]), delay(() => append(singleton(["level", level]), delay(() => append(singleton(["module", _._module]), delay(() => append(singleton(["component", Logger_get_Component()]), delay(() => append(singleton(["instance", Logger_get_InstanceId()]), delay(() => append(singleton(["props", props_1]), delay(() => append((Logger_get_Context().size > 0) ? singleton(["context", context]) : empty(), delay(() => singleton(["time_us", usecs]))))))))))))))))));
    if (!equals(Logger_get_Sink(), defaultOf())) {
        Logger_get_Sink().Add(obj);
    }
    else {
        console.log(obj);
    }
}

export function Logger__Debug_Z16373198(this$, message, ...props) {
    Logger__Log_1BDB2184(this$, message, 20, props);
}

export function Logger__Debug_DED112C(this$, message, props) {
    Logger__Log_1BDB2184(this$, message, 20, props);
}

export function Logger__Info_Z16373198(this$, message, ...props) {
    Logger__Log_1BDB2184(this$, message, 30, props);
}

export function Logger__Info_DED112C(this$, message, props) {
    Logger__Log_1BDB2184(this$, message, 30, props);
}

export function Logger__Trace_Z16373198(this$, message, ...props) {
    Logger__Log_1BDB2184(this$, message, 10, props);
}

export function Logger__Trace_DED112C(this$, message, props) {
    Logger__Log_1BDB2184(this$, message, 10, props);
}

export function Logger__Warning_Z16373198(this$, message, ...props) {
    Logger__Log_1BDB2184(this$, message, 40, props);
}

export function Logger__Warning_DED112C(this$, message, props) {
    Logger__Log_1BDB2184(this$, message, 40, props);
}

export function Logger__Error_Z16373198(this$, message, ...props) {
    Logger__Log_1BDB2184(this$, message, 50, props);
}

export function Logger__Error_DED112C(this$, message, props) {
    Logger__Log_1BDB2184(this$, message, 50, props);
}

export function Logger__Critical_Z16373198(this$, message, ...props) {
    Logger__Log_1BDB2184(this$, message, 60, props);
}

export function Logger__Critical_DED112C(this$, message, props) {
    Logger__Log_1BDB2184(this$, message, 60, props);
}

