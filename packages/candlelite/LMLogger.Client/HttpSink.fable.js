import { class_type } from "../fable_modules/fable-library.4.0.0-theta-018/Reflection.js";

export class HttpSink {
    constructor(destination) {
        this.destination = destination;
    }
    Add(json) {
        const _ = this;
        const value = navigator.sendBeacon(_.destination, JSON.stringify(json));
    }
}

export function HttpSink$reflection() {
    return class_type("LMLogger.Sinks.HttpSink", void 0, HttpSink);
}

export function HttpSink_$ctor_Z721C83C5(destination) {
    return new HttpSink(destination);
}

