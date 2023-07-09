import { Record } from "../fable_modules/fable-library.4.0.0-theta-018/Types.js";
import { array_type, record_type, string_type } from "../fable_modules/fable-library.4.0.0-theta-018/Reflection.js";
import { map } from "../fable_modules/fable-library.4.0.0-theta-018/Array.js";
import { split } from "../fable_modules/fable-library.4.0.0-theta-018/String.js";
import { unescapeDataString } from "../fable_modules/fable-library.4.0.0-theta-018/Util.js";

export class FhirParameter extends Record {
    constructor(Name, Modifier, Value) {
        super();
        this.Name = Name;
        this.Modifier = Modifier;
        this.Value = Value;
    }
}

export function FhirParameter$reflection() {
    return record_type("CandleLite.Core.URL.FhirParameter", [], FhirParameter, () => [["Name", string_type], ["Modifier", string_type], ["Value", string_type]]);
}

export class FhirURL extends Record {
    constructor(PathSegments, Parameters) {
        super();
        this.PathSegments = PathSegments;
        this.Parameters = Parameters;
    }
}

export function FhirURL$reflection() {
    return record_type("CandleLite.Core.URL.FhirURL", [], FhirURL, () => [["PathSegments", array_type(string_type)], ["Parameters", array_type(FhirParameter$reflection())]]);
}

export function parseParameters(qs) {
    return map((p) => {
        const nv = split(p, ["="], 2, 0);
        return new FhirParameter(nv[0], "", unescapeDataString(nv[1]));
    }, split(qs, ["&"], null, 0), null);
}

export function parse(relativeUrl) {
    let array;
    const pathQS = split(relativeUrl, ["?"], 2, 0);
    return new FhirURL((array = split(pathQS[0], ["/"], null, 0), array.filter((s) => (s.length > 0))), (pathQS.length === 2) ? parseParameters(pathQS[1]) : []);
}

