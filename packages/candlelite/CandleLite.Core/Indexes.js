import { Record, Union } from "../fable_modules/fable-library.4.0.0-theta-018/Types.js";
import { record_type, lambda_type, list_type, class_type, bool_type, decimal_type, string_type, union_type } from "../fable_modules/fable-library.4.0.0-theta-018/Reflection.js";
import { TypeId, TokenValue, TypeId__get_TypeId, TokenValue$reflection, TypeId$reflection } from "./Types.js";
import { printf, toFail, split, isNullOrEmpty } from "../fable_modules/fable-library.4.0.0-theta-018/String.js";
import { compare, equals, defaultOf } from "../fable_modules/fable-library.4.0.0-theta-018/Util.js";
import { append, filter as filter_1, ofArray, collect, empty, map, singleton } from "../fable_modules/fable-library.4.0.0-theta-018/List.js";
import { resourceId } from "./JSON.js";
import { equalsWith } from "../fable_modules/fable-library.4.0.0-theta-018/Array.js";
import { Insert, Delete, WhereCondition, Value, Condition, Table_indexes, Statement } from "./SQL.js";
import { find, tryFind } from "../fable_modules/fable-library.4.0.0-theta-018/Map.js";
import { map as map_1, singleton as singleton_1, empty as empty_1, collect as collect_1, append as append_1, delay, toList } from "../fable_modules/fable-library.4.0.0-theta-018/Seq.js";
import { ofList, toArray } from "../fable_modules/fable-library.4.0.0-theta-018/Set.js";

export class Type extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Id", "Number", "Reference", "DateTime", "String", "Bool", "Token"];
    }
}

export function Type$reflection() {
    return union_type("CandleLite.Core.Indexes.Type", [], Type, () => [[], [], [], [], [], [], []]);
}

export class IndexedValues extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Id", "Number", "Reference", "DateTime", "String", "Bool", "Token"];
    }
}

export function IndexedValues$reflection() {
    return union_type("CandleLite.Core.Indexes.IndexedValues", [], IndexedValues, () => [[["Item", string_type]], [["Item", decimal_type]], [["Item", TypeId$reflection()]], [["Item", string_type]], [["Item", string_type]], [["Item", bool_type]], [["Item", TokenValue$reflection()]]]);
}

export function IndexedValues__ToValueAndSystemAndIsRef(this$) {
    const normalise = (str) => str.trim().toLocaleLowerCase();
    const boxOrNull = (str_1) => {
        if (isNullOrEmpty(str_1)) {
            return defaultOf();
        }
        else {
            return str_1;
        }
    };
    switch (this$.tag) {
        case 1: {
            return [this$.fields[0], defaultOf(), defaultOf()];
        }
        case 2: {
            return [TypeId__get_TypeId(this$.fields[0]), defaultOf(), 1];
        }
        case 3: {
            return [boxOrNull(this$.fields[0]), defaultOf(), defaultOf()];
        }
        case 4: {
            return [boxOrNull(normalise(this$.fields[0])), defaultOf(), defaultOf()];
        }
        case 5: {
            return [this$.fields[0] ? "true" : "false", defaultOf(), defaultOf()];
        }
        case 6: {
            const t = this$.fields[0];
            return [boxOrNull(t.Code), t.System, defaultOf()];
        }
        default: {
            return [this$.fields[0], defaultOf(), defaultOf()];
        }
    }
}

export class SearchParameter extends Record {
    constructor(Type, Indexer) {
        super();
        this.Type = Type;
        this.Indexer = Indexer;
    }
}

export function SearchParameter$reflection() {
    return record_type("CandleLite.Core.Indexes.SearchParameter", [], SearchParameter, () => [["Type", Type$reflection()], ["Indexer", lambda_type(class_type("CandleLite.Core.JSON.IJsonElement"), list_type(IndexedValues$reflection()))]]);
}

export function indexer(_type, func) {
    return new SearchParameter(_type, func);
}

export function indexString(path) {
    return indexer(new Type(4, []), (elt) => singleton(new IndexedValues(4, [elt.GetString(path)])));
}

export function indexStrings(path) {
    return indexer(new Type(4, []), (elt) => map((arg) => (new IndexedValues(4, [arg])), elt.GetStrings(path)));
}

export function indexDateTime(path) {
    return indexer(new Type(3, []), (elt) => singleton(new IndexedValues(3, [elt.GetString(path)])));
}

export const indexId = ["_id", indexer(new Type(0, []), (elt) => singleton(new IndexedValues(0, [resourceId(elt).Id])))];

export function getElements(path, elt) {
    return elt.GetElements(path);
}

export function getString(path, elt) {
    return new IndexedValues(4, [elt.GetString(path)]);
}

export function getSystemValue(elt) {
    return new IndexedValues(6, [new TokenValue(elt.GetString(singleton("system")), elt.GetString(singleton("value")))]);
}

export function getSystemCode(elt) {
    return new IndexedValues(6, [new TokenValue(elt.GetString(singleton("system")), elt.GetString(singleton("code")))]);
}

export const identifier = ["identifier", indexer(new Type(6, []), (arg) => map(getSystemValue, getElements(singleton("identifier"), arg)))];

export function reference(name) {
    const getReference = (elt) => {
        const parseReference = (str) => {
            let placeholder, hashtag;
            const matchValue = split(str, ["/"], null, 0);
            let matchResult;
            if ((!equalsWith((x, y) => (x === y), matchValue, defaultOf())) && (matchValue.length === 2)) {
                matchResult = 0;
            }
            else if ((!equalsWith((x_1, y_1) => (x_1 === y_1), matchValue, defaultOf())) && (matchValue.length === 1)) {
                if ((placeholder = matchValue[0], placeholder.indexOf("urn:uuid:") === 0)) {
                    matchResult = 1;
                }
                else if ((hashtag = matchValue[0], hashtag.indexOf("#") === 0)) {
                    matchResult = 2;
                }
                else {
                    matchResult = 3;
                }
            }
            else {
                matchResult = 3;
            }
            switch (matchResult) {
                case 0: {
                    const id = matchValue[1];
                    return singleton(new IndexedValues(2, [new TypeId(matchValue[0], id)]));
                }
                case 1: {
                    const placeholder_1 = matchValue[0];
                    return empty();
                }
                case 2: {
                    const hashtag_1 = matchValue[0];
                    return empty();
                }
                case 3: {
                    return toFail(printf("unable to parse reference in %s: %s"))(name)(str);
                }
            }
        };
        return parseReference(elt.GetString(singleton("reference")));
    };
    return [name, indexer(new Type(2, []), (arg_2) => collect(getReference, getElements(singleton(name), arg_2)))];
}

export function codeableConcept(name) {
    return indexer(new Type(6, []), (arg) => map(getSystemCode, getElements(ofArray([name, "coding"]), arg)));
}

export function getStrings(path, elt) {
    return map((arg) => (new IndexedValues(4, [arg])), elt.GetStrings(path));
}

export function indexElementStrings(elementPath, stringPath) {
    return indexer(new Type(4, []), (arg) => collect((elt_1) => getStrings(stringPath, elt_1), getElements(elementPath, arg)));
}

export function indexElementString(elementPath, stringPath) {
    return indexer(new Type(4, []), (arg) => map((elt_1) => getString(stringPath, elt_1), getElements(elementPath, arg)));
}

export function indexBool(path) {
    return new SearchParameter(new Type(5, []), (elt) => singleton(new IndexedValues(5, [elt.GetString(path) === "true"])));
}

export function indexTrueOrDateExists(path) {
    const pathBool = singleton(path + "Boolean");
    const pathDate = singleton(path + "DateTime");
    return new SearchParameter(new Type(5, []), (elt) => ((elt.GetString(pathBool) === "true") ? singleton(new IndexedValues(5, [true])) : singleton(new IndexedValues(5, [elt.GetString(pathDate) !== ""]))));
}

export function contactPoints(path, filterForSystem) {
    let filter;
    if (filterForSystem != null) {
        const system = filterForSystem;
        filter = ((list) => filter_1((e) => (e.GetString(singleton("system")) === system), list));
    }
    else {
        filter = ((x) => x);
    }
    return new SearchParameter(new Type(4, []), (elt) => map((e_1) => (new IndexedValues(4, [e_1.GetString(singleton("value"))])), filter(elt.GetElements(path))));
}

export function indexAddress(path) {
    return new SearchParameter(new Type(4, []), (elt) => map((arg) => (new IndexedValues(4, [arg])), collect((e) => append(ofArray([e.GetString(singleton("text")), e.GetString(singleton("city")), e.GetString(singleton("district")), e.GetString(singleton("state")), e.GetString(singleton("postalCode")), e.GetString(singleton("country"))]), e.GetStrings(singleton("line"))), elt.GetElements(path))));
}

export function humanName(path) {
    return new SearchParameter(new Type(4, []), (elt) => map((arg) => (new IndexedValues(4, [arg])), collect((e) => append(ofArray([e.GetString(singleton("text")), e.GetString(singleton("family"))]), e.GetStrings(singleton("given"))), elt.GetElements(path))));
}

export function deleteIndexForVersion(versionId) {
    return new Statement(3, [new Delete(Table_indexes, singleton(new WhereCondition("versionId", new Condition(0, [new Value(0, [versionId])]))))]);
}

export function indexResource(paramsMap, resource, id, meta, references) {
    let paramsForType, matchValue;
    const allRows = map((tupledArg) => [tupledArg[0], tupledArg[1].Indexer(resource)], (paramsForType = ((matchValue = tryFind(id.Type, paramsMap), (matchValue == null) ? empty() : matchValue)), append(find("ALL", paramsMap), paramsForType)));
    const versionId = meta.VersionId;
    return new Statement(1, [new Insert(Table_indexes, ofArray(["name", "value", "system", "isRef", "id", "versionId"]), toList(delay(() => append_1(collect_1((matchValue_1) => {
        const indexName = (id.Type + ".") + matchValue_1[0];
        return collect_1((indexRow) => {
            let matchValue_2;
            return append_1((matchValue_2 = indexRow, (matchValue_2.tag === 2) ? ((void references.delete(TypeId__get_TypeId(matchValue_2.fields[0])), empty_1())) : (empty_1())), delay(() => {
                const patternInput = IndexedValues__ToValueAndSystemAndIsRef(indexRow);
                const v = patternInput[0];
                return (!equals(v, defaultOf())) ? singleton_1(ofArray([indexName, v, patternInput[1], patternInput[2], id.Id, versionId])) : empty_1();
            }));
        }, toArray(ofList(matchValue_1[1], {
            Compare: compare,
        })));
    }, allRows), delay(() => map_1((ref) => ofArray(["ref", ref, defaultOf(), 1, id.Id, versionId]), references))))), empty())]);
}

