import { raiseOO, isArray } from "./Utils.js";
import { uncurry, partialApply, defaultOf, equals, disposeSafe, getEnumerator } from "./fable_modules/fable-library.4.0.0-theta-018/Util.js";
import { toString } from "./fable_modules/fable-library.4.0.0-theta-018/Types.js";
import { toArray, indexed, collect, length, splitAt, singleton, empty, head, tail, isEmpty } from "./fable_modules/fable-library.4.0.0-theta-018/List.js";
import { collect as collect_1, map, toList } from "./fable_modules/fable-library.4.0.0-theta-018/Seq.js";
import { class_type } from "./fable_modules/fable-library.4.0.0-theta-018/Reflection.js";
import { FSharpResult$2 } from "./fable_modules/fable-library.4.0.0-theta-018/Choice.js";
import { some, map as map_1, defaultArg } from "./fable_modules/fable-library.4.0.0-theta-018/Option.js";
import { map as map_2 } from "./fable_modules/fable-library.4.0.0-theta-018/Array.js";
import { fromValue } from "./fable_modules/Thoth.Json.9.0.0/Decode.fs.js";
import { OperationOutcomeCodes } from "./CandleLite.Core/Types.js";
import { newGuid } from "./fable_modules/fable-library.4.0.0-theta-018/Guid.js";
import { add } from "./fable_modules/fable-library.4.0.0-theta-018/Map.js";
import { empty as empty_1 } from "./fable_modules/Thoth.Json.9.0.0/Extra.fs.js";
import { CaseStrategy, ExtraCoders } from "./fable_modules/Thoth.Json.9.0.0/Types.fs.js";
import { Auto_generateBoxedDecoderCached_Z6670B51 } from "./fable_modules/Thoth.Json.9.0.0/Decode.fs.js";
import { Bundle$reflection } from "./CandleLite.Core/Bundle.js";

export class JsonViaJSObj {
    constructor(root) {
        this.root = root;
        if (equals(this.root, defaultOf())) {
            throw new Error("root object is null\\nParameter name: root");
        }
    }
    toString() {
        const this$ = this;
        return JSON.stringify(this$.root);
    }
    WalkAndModify(callback) {
        const this$ = this;
        const walk = (node) => {
            if (isArray(node)) {
                node.forEach(walk);
            }
            else if (typeof(node || false) === 'object') {
                let enumerator = getEnumerator(Object.entries(node));
                try {
                    while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                        const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                        const v = forLoopVar[1];
                        const k = forLoopVar[0];
                        if (isArray(v) ? true : (typeof(v || false) === 'object')) {
                            walk(v);
                        }
                        else if (typeof(v || false) === 'string') {
                            const matchValue = callback(k, v);
                            if (matchValue == null) {
                            }
                            else {
                                const newValue = matchValue;
                                node[k] = newValue;
                            }
                        }
                    }
                }
                finally {
                    disposeSafe(enumerator);
                }
            }
        };
        walk(this$.root);
    }
    GetString(path) {
        const this$ = this;
        let node = this$.root;
        const enumerator = getEnumerator(path);
        try {
            while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                const prop = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                if (!equals(node, defaultOf())) {
                    node = node[prop];
                }
            }
        }
        finally {
            disposeSafe(enumerator);
        }
        return (!equals(node, defaultOf())) ? toString(node) : "";
    }
    GetStrings(path) {
        let copyOfStruct;
        const this$ = this;
        if (!isEmpty(path)) {
            if (isEmpty(tail(path))) {
                const matchValue = this$.root[head(path)];
                return equals(matchValue, defaultOf()) ? empty() : (isArray(matchValue) ? toList(map(toString, matchValue)) : singleton((copyOfStruct = matchValue, toString(copyOfStruct))));
            }
            else {
                const patternInput = splitAt(length(path) - 1, path);
                return collect((e) => e.GetStrings(patternInput[1]), this$.GetElements(patternInput[0]));
            }
        }
        else {
            throw new Error("empty path\\nParameter name: path");
        }
    }
    GetElements(path) {
        const this$ = this;
        const toNodeList = (path_1_mut, node_mut) => {
            toNodeList:
            while (true) {
                const path_1 = path_1_mut, node = node_mut;
                if (isEmpty(path_1)) {
                    return [node];
                }
                else {
                    const rest = tail(path_1);
                    const matchValue = node[head(path_1)];
                    if (isArray(matchValue)) {
                        return collect_1(partialApply(1, toNodeList, [rest]), matchValue);
                    }
                    else if (equals(matchValue, defaultOf())) {
                        return [];
                    }
                    else {
                        path_1_mut = rest;
                        node_mut = matchValue;
                        continue toNodeList;
                    }
                }
                break;
            }
        };
        return toList(map(JsonViaJSObj_$ctor_4E60E31B, toNodeList(path, this$.root)));
    }
    SetString(path, value) {
        const this$ = this;
        let node = this$.root;
        const enumerator = getEnumerator(indexed(path));
        try {
            while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                const prop = forLoopVar[1];
                if (forLoopVar[0] === (length(path) - 1)) {
                    node[prop] = value;
                }
                else {
                    if (equals(node[prop], defaultOf())) {
                        node[prop] = {};
                    }
                    node = node[prop];
                }
            }
        }
        finally {
            disposeSafe(enumerator);
        }
    }
}

export function JsonViaJSObj$reflection() {
    return class_type("CandleLite.JS.JSON.JsonViaJSObj", void 0, JsonViaJSObj);
}

export function JsonViaJSObj_$ctor_4E60E31B(root) {
    return new JsonViaJSObj(root);
}

export function JsonViaJSObj_Parse_Z721C83C5(json) {
    return JsonViaJSObj_$ctor_4E60E31B(JSON.parse(json));
}

export function JsonViaJSObj__get_Object(_) {
    return _.root;
}

export function ThothCodec_decoder(path, value) {
    return new FSharpResult$2(0, [JsonViaJSObj_$ctor_4E60E31B(value)]);
}

export function ThothCodec_encoder(elt) {
    return toString(elt);
}

export class JsJSON {
    constructor(indent) {
        let copyOfStruct;
        this.indent = indent;
        const extraDecoders = new ExtraCoders((copyOfStruct = newGuid(), copyOfStruct), add("CandleLite.Core.JSON.IJsonElement", [ThothCodec_encoder, (path) => ((value) => ThothCodec_decoder(path, value))], empty_1.Coders));
        this.bundleDecoder = uncurry(2, Auto_generateBoxedDecoderCached_Z6670B51(Bundle$reflection(), new CaseStrategy(1, []), extraDecoders));
    }
    ParseJSON(json) {
        return JsonViaJSObj_Parse_Z721C83C5(json);
    }
    BundleToJSON(bundle) {
        const _ = this;
        const encodeRequest = (req) => ({
            method: req.Method,
            url: req.Url,
            ifNoneMatch: req.IfNoneMatch,
            ifModifiedSince: req.IfModifiedSince,
            ifMatch: req.IfMatch,
            ifNoneExist: req.IfNoneExist,
        });
        const encodeNodeOrNull = (maybe) => {
            if (maybe == null) {
                return defaultOf();
            }
            else {
                return JsonViaJSObj__get_Object(maybe);
            }
        };
        const encodeResponse = (res) => ({
            status: res.Status,
            location: res.Location,
            etag: res.Etag,
            lastModified: res.LastModified,
            outcome: encodeNodeOrNull(res.Outcome),
        });
        const encodeEntry = (entry) => {
            let matchValue;
            return {
                fullUrl: entry.FullUrl,
                resource: (matchValue = entry.Resource, (matchValue == null) ? defaultOf() : JsonViaJSObj__get_Object(matchValue)),
                request: defaultArg(map_1(encodeRequest, entry.Request), defaultOf()),
                response: defaultArg(map_1(encodeResponse, entry.Response), defaultOf()),
            };
        };
        const encodeLink = (link) => ({
            relation: link.Relation,
            uri: link.Uri,
        });
        return JsJSON__toJSON_1505(_, {
            resourceType: bundle.ResourceType,
            type: bundle.Type,
            total: bundle.Total,
            timestamp: bundle.Timestamp,
            link: map_2(encodeLink, defaultArg(bundle.Link, []), null),
            entry: map_2(encodeEntry, defaultArg(bundle.Entry, []), null),
        });
    }
    OutcomeToJSON(oo) {
        const _ = this;
        return JsJSON__toJSON_1505(_, {
            resourceType: oo.ResourceType,
            issue: map_2((issue) => ({
                severity: issue.Severity,
                code: issue.Code,
                diagnostics: issue.Diagnostics,
            }), toArray(oo.Issue), null),
        });
    }
    ParseBundle(resource) {
        const this$ = this;
        const matchValue = fromValue("$", this$.bundleDecoder, JsonViaJSObj__get_Object(resource));
        return (matchValue.tag === 1) ? raiseOO(400, new OperationOutcomeCodes(0, []), matchValue.fields[0]) : matchValue.fields[0];
    }
}

export function JsJSON$reflection() {
    return class_type("CandleLite.JS.JSON.JsJSON", void 0, JsJSON);
}

export function JsJSON_$ctor_6FCE9E49(indent) {
    return new JsJSON(indent);
}

export function JsJSON__toJSON_1505(this$, obj) {
    if (equals(this$.indent, true)) {
        return JSON.stringify(obj, uncurry(2, void 0), some(4));
    }
    else {
        return JSON.stringify(obj);
    }
}

