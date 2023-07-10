import { int32ToString, uncurry, equals, disposeSafe, getEnumerator, defaultOf } from "../fable_modules/fable-library.4.0.0-theta-018/Util.js";
import { toText, isNullOrEmpty, substring, trim, printf, toFail } from "../fable_modules/fable-library.4.0.0-theta-018/String.js";
import { TypeId, TypeId__get_TypeId, TypeId_From, OperationOutcomeCodes, OperationOutcomeSeverity, operationOutcome, OperationOutcomeException } from "./Types.js";
import { FSharpRef, toString } from "../fable_modules/fable-library.4.0.0-theta-018/Types.js";
import { parse } from "./URL.js";
import { Request_forURL_Z309E9F90, addLocation, addETagAndLastUpdated, respondWith, StorageMode, Request, PreferReturn } from "./ServerUtils.js";
import { Logger__Warning_DED112C, Logger__Trace_DED112C, Logger_$ctor_Z721C83C5, Logger_set_Sink_543D23EA, Logger__Debug_DED112C } from "../LMLogger.Client/LMLogger.js";
import { singleton, collect, delay, toArray as toArray_1, iterate } from "../fable_modules/fable-library.4.0.0-theta-018/Seq.js";
import { defaultArgWith, map, value as value_5, defaultArg, toArray } from "../fable_modules/fable-library.4.0.0-theta-018/Option.js";
import { HttpSink_$ctor_Z721C83C5 } from "../LMLogger.Client/HttpSink.fable.js";
import { class_type } from "../fable_modules/fable-library.4.0.0-theta-018/Reflection.js";
import { toUniversalTime, toString as toString_1 } from "../fable_modules/fable-library.4.0.0-theta-018/Date.js";
import { Statement, insertDeletion, indexQuery, insertResourceVersion, readIsDeletedViaIndex, readVersion, IndexConditions__id, readResourcesViaIndex, insertCounter, updateCounter } from "./SQL.js";
import { singleton as singleton_1, ofArray, item, length, tail, head, isEmpty } from "../fable_modules/fable-library.4.0.0-theta-018/List.js";
import { map as map_1, sortWith, findIndex, fill, mapIndexed, equalsWith } from "../fable_modules/fable-library.4.0.0-theta-018/Array.js";
import { fromBits } from "../fable_modules/fable-library.4.0.0-theta-018/Long.js";
import { resourceType, collectReferences, MetaInfo, resourceId } from "./JSON.js";
import { containsKey } from "../fable_modules/fable-library.4.0.0-theta-018/Map.js";
import { conditionsFromUrl } from "./Search.js";
import { BundleResponse, Bundle, BundleEntry, BundleType_SearchSet } from "./Bundle.js";
import { unionWith } from "../fable_modules/fable-library.4.0.0-theta-018/Set.js";
import { deleteIndexForVersion, indexResource } from "./Indexes.js";
import { tryGetValue, addToDict } from "../fable_modules/fable-library.4.0.0-theta-018/MapUtil.js";

export class CandleLiteServer {
    constructor(config, dbImpl, jsonImpl) {
        let objectArg, f1, objectArg_1;
        this.config = config;
        this.dbImpl = dbImpl;
        this.jsonImpl = jsonImpl;
        this.log = Logger_$ctor_Z721C83C5("/home/eug/candlelite/CandleLite.Core/Server.fs");
        this.runQuery = ((objectArg = this.dbImpl, (arg) => objectArg.RunSql(arg)));
        this.runCommand = ((f1 = ((objectArg_1 = this.dbImpl, (arg_1) => objectArg_1.RunSql(arg_1))), (arg_2) => {
            f1(arg_2);
        }));
    }
    HandleRequest(method, urlPath, basePath, body, getHeader, setHeader) {
        let matchValue_1;
        const this$ = this;
        const header = (name) => {
            const matchValue = getHeader(name);
            let matchResult;
            if (matchValue === defaultOf()) {
                matchResult = 0;
            }
            else if (matchValue === "") {
                matchResult = 0;
            }
            else {
                matchResult = 1;
            }
            switch (matchResult) {
                case 0: {
                    return void 0;
                }
                case 1: {
                    return matchValue;
                }
            }
        };
        if (!(urlPath.indexOf(basePath) === 0)) {
            toFail(printf("URL (%s) doesn\'t start with base prefix (%s)"))(urlPath)(basePath);
        }
        const urlPathWithoutBase = trim(substring(urlPath, basePath.length), "/");
        try {
            const req = new Request(parse(urlPathWithoutBase), isNullOrEmpty(body) ? (void 0) : this$.jsonImpl.ParseJSON(body), header("if-match"), header("if-modified-since"), header("if-none-exist"), (matchValue_1 = header("prefer"), (matchValue_1 == null) ? (void 0) : ((matchValue_1 === "return=minimal") ? (new PreferReturn(0, [])) : ((matchValue_1 === "return=representation") ? (new PreferReturn(1, [])) : ((matchValue_1 === "return=OperationOutcome") ? CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), "Prefer: OperationOutcome not yet supported") : CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), "invalid value for Prefer header"))))));
            Logger__Debug_DED112C(this$.log, "HandleRequest", [["method", method], ["urlPath", urlPath], ["urlPathWithoutBase", urlPathWithoutBase], ["req", req]]);
            let res;
            const storageFunction = (id, meta, resource) => CandleLiteServer__storeResource(this$, new StorageMode(0, []), id, meta, resource);
            res = ((method === "GET") ? CandleLiteServer__GET_Z78D02DA(this$, req) : ((method === "POST") ? CandleLiteServer__POST(this$, req, storageFunction) : ((method === "PUT") ? CandleLiteServer__PUT(this$, req, storageFunction) : ((method === "DELETE") ? CandleLiteServer__DELETE_Z78D02DA(this$, req) : CandleLiteServer__raiseOO(this$, 405, new OperationOutcomeCodes(2, []), "method not allowed")))));
            const enumerator = getEnumerator([["ETag", res.ETag], ["Location", res.Location], ["Last-Modified", res.LastUpdated]]);
            try {
                while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                    const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                    iterate((v_1) => {
                        setHeader(forLoopVar[0], v_1);
                    }, toArray(forLoopVar[1]));
                }
            }
            finally {
                disposeSafe(enumerator);
            }
            return res;
        }
        catch (matchValue_2) {
            return (matchValue_2 instanceof OperationOutcomeException) ? CandleLiteServer__respondWithOO(this$, matchValue_2.Data0, matchValue_2.Data1) : CandleLiteServer__respondWithOO(this$, 500, operationOutcome(new OperationOutcomeSeverity(1, []), new OperationOutcomeCodes(10, []), toString(matchValue_2)));
        }
    }
    SetLogDestination(url) {
        Logger_set_Sink_543D23EA(HttpSink_$ctor_Z721C83C5(url));
    }
}

export function CandleLiteServer$reflection() {
    return class_type("CandleLite.Core.Server.CandleLiteServer", void 0, CandleLiteServer);
}

export function CandleLiteServer_$ctor_3F8AA2E8(config, dbImpl, jsonImpl) {
    return new CandleLiteServer(config, dbImpl, jsonImpl);
}

export function CandleLiteServer__currentTimestamp(this$) {
    return toString_1(toUniversalTime(this$.config.CurrentDateTime), "o");
}

export function CandleLiteServer__nextCounter_Z721C83C5(this$, name) {
    let testExpr_1, testExpr;
    const results = this$.runQuery(updateCounter(name));
    Logger__Trace_DED112C(this$.log, "nextCounter", [["name", name], ["results", results]]);
    let matchResult, value_2;
    if (!isEmpty(results)) {
        if ((testExpr = head(results), (!equalsWith(equals, testExpr, defaultOf())) && (testExpr.length === 1))) {
            if (isEmpty(tail(results))) {
                matchResult = 1;
                value_2 = head(results)[0];
            }
            else {
                matchResult = 2;
            }
        }
        else {
            matchResult = 2;
        }
    }
    else {
        matchResult = 0;
    }
    switch (matchResult) {
        case 0: {
            const results_1 = this$.runQuery(insertCounter(name));
            let matchResult_1;
            if (!isEmpty(results_1)) {
                if ((testExpr_1 = head(results_1), (!equalsWith(equals, testExpr_1, defaultOf())) && (testExpr_1.length === 1))) {
                    if (isEmpty(tail(results_1))) {
                        if (equals(head(results_1)[0], fromBits(1, 0, false))) {
                            matchResult_1 = 0;
                        }
                        else if (equals(head(results_1)[0], 1)) {
                            matchResult_1 = 1;
                        }
                        else {
                            matchResult_1 = 2;
                        }
                    }
                    else {
                        matchResult_1 = 2;
                    }
                }
                else {
                    matchResult_1 = 2;
                }
            }
            else {
                matchResult_1 = 2;
            }
            switch (matchResult_1) {
                case 2: {
                    toFail(printf("invalid result for insertCounter: %A"))(results_1);
                    break;
                }
            }
            return "1";
        }
        case 1: {
            return toString(value_2);
        }
        case 2: {
            return toFail(printf("invalid result for updateCounter: %A"))(results);
        }
    }
}

export function CandleLiteServer__nextVersionId(this$) {
    return CandleLiteServer__nextCounter_Z721C83C5(this$, "versionId");
}

export function CandleLiteServer__respondWithOO(this$, httpStatus, oo) {
    const json = this$.jsonImpl.OutcomeToJSON(oo);
    Logger__Warning_DED112C(this$.log, "respondWithOO", [["oo", json]]);
    return respondWith(httpStatus, this$.jsonImpl.ParseJSON(json), json);
}

export function CandleLiteServer__raiseOO(this$, httpStatus, code, msg) {
    const oo = operationOutcome(new OperationOutcomeSeverity(1, []), code, msg);
    Logger__Warning_DED112C(this$.log, "raiseOO", [["oo", oo]]);
    throw new OperationOutcomeException(httpStatus, oo);
}

export function CandleLiteServer__respondWithSingleResource(this$, expectedId, results) {
    const matchValue = length(results) | 0;
    if (matchValue === 0) {
        return CandleLiteServer__raiseOO(this$, 404, new OperationOutcomeCodes(7, []), "not found");
    }
    else if (matchValue === 1) {
        const json = toString(item(0, results)[0]);
        if (item(0, results)[1] === 1) {
            return CandleLiteServer__raiseOO(this$, 410, new OperationOutcomeCodes(8, []), "deleted");
        }
        else {
            const resource = this$.jsonImpl.ParseJSON(json);
            if (!equals(resourceId(resource), expectedId)) {
                return CandleLiteServer__raiseOO(this$, 404, new OperationOutcomeCodes(2, []), "version corresponds to a different resource");
            }
            else {
                return addETagAndLastUpdated(resource, respondWith(200, resource, json));
            }
        }
    }
    else {
        return toFail(printf("multiple entries!"));
    }
}

export function CandleLiteServer__respondWithBundle(this$, status, bundle) {
    const json = this$.jsonImpl.BundleToJSON(bundle);
    return respondWith(status, this$.jsonImpl.ParseJSON(json), json);
}

export function CandleLiteServer__ensureTypeSupported_Z721C83C5(this$, _type) {
    if (!containsKey(_type, this$.config.SearchParameters)) {
        CandleLiteServer__raiseOO(this$, 404, new OperationOutcomeCodes(4, []), toText(printf("resource type not supported (%s)"))(_type));
    }
}

export function CandleLiteServer__read(this$, _type, _id, req) {
    const typeId = TypeId_From(_type, _id);
    Logger__Trace_DED112C(this$.log, "read", [["type", _type], ["id", _id]]);
    CandleLiteServer__ensureTypeSupported_Z721C83C5(this$, _type);
    return CandleLiteServer__respondWithSingleResource(this$, typeId, this$.runQuery(readResourcesViaIndex([IndexConditions__id(typeId)])));
}

export function CandleLiteServer__vread(this$, _type, _id, versionId, req) {
    const id = TypeId_From(_type, _id);
    Logger__Trace_DED112C(this$.log, "vread", [["type", _type], ["id", _id], ["versionId", versionId]]);
    CandleLiteServer__ensureTypeSupported_Z721C83C5(this$, _type);
    return CandleLiteServer__respondWithSingleResource(this$, id, this$.runQuery(readVersion(versionId)));
}

export function CandleLiteServer__historyForId(this$, _type, _id, req) {
    const id = TypeId_From(_type, _id);
    return toFail(printf("not implemented"));
}

export function CandleLiteServer__historyForType(this$, _type, req) {
    return toFail(printf("not implemented"));
}

export function CandleLiteServer__historyForServer_1505(this$, req) {
    return toFail(printf("not implemented"));
}

export function CandleLiteServer__search(this$, _type, req) {
    Logger__Trace_DED112C(this$.log, "search", [["type", _type], ["req", req]]);
    CandleLiteServer__ensureTypeSupported_Z721C83C5(this$, _type);
    const results = this$.runQuery(readResourcesViaIndex(conditionsFromUrl(this$.config.SearchParameters, _type, req.URL.Parameters)));
    const bundle = new Bundle("Bundle", BundleType_SearchSet, length(results), CandleLiteServer__currentTimestamp(this$), void 0, toArray_1(delay(() => collect((row) => {
        const json = toString(row[0]);
        const resource = this$.jsonImpl.ParseJSON(json);
        return singleton(new BundleEntry(TypeId__get_TypeId(resourceId(resource)), resource, void 0, void 0));
    }, results))));
    Logger__Trace_DED112C(this$.log, "search results", [["bundle", bundle]]);
    return [bundle, CandleLiteServer__respondWithBundle(this$, 200, bundle)];
}

export function CandleLiteServer__respondAsClientPrefers(this$, status, req, resource, json) {
    const matchValue = req.PreferReturn;
    let matchResult;
    if (matchValue != null) {
        if (matchValue.tag === 0) {
            matchResult = 1;
        }
        else if (matchValue.tag === 2) {
            matchResult = 2;
        }
        else {
            matchResult = 0;
        }
    }
    else {
        matchResult = 0;
    }
    switch (matchResult) {
        case 0: {
            return respondWith(status, resource, json);
        }
        case 1: {
            return respondWith(status, defaultOf(), "");
        }
        case 2: {
            return CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), "PreferReturn OperationOutcome not implemented");
        }
    }
}

export function CandleLiteServer__updateVersionId_Z746D228E(this$, resource) {
    const newVersionId = CandleLiteServer__nextVersionId(this$);
    const newLastUpdated = CandleLiteServer__currentTimestamp(this$);
    Logger__Trace_DED112C(this$.log, "updateVersionId", [["newVersionId", newVersionId], ["newLastUpdated", newLastUpdated]]);
    resource.SetString(ofArray(["meta", "versionId"]), newVersionId);
    resource.SetString(ofArray(["meta", "lastUpdated"]), newLastUpdated);
    return new MetaInfo(newVersionId, newLastUpdated);
}

export function CandleLiteServer__checkTypeIdReference_4145CFFB(this$, typeId) {
    const rows = this$.runQuery(readIsDeletedViaIndex([IndexConditions__id(typeId)]));
    const ref = TypeId__get_TypeId(typeId);
    if (!isEmpty(rows)) {
        if (isEmpty(tail(rows))) {
            if (head(rows)[0] > 0) {
                CandleLiteServer__raiseOO(this$, 404, new OperationOutcomeCodes(8, []), `referenced resource is deleted (${ref})`);
            }
            else {
                Logger__Trace_DED112C(this$.log, "checkTypeIdReference ok", [["ref", ref]]);
            }
        }
        else {
            toFail(`multiple resources for reference (${ref})!`);
        }
    }
    else {
        CandleLiteServer__raiseOO(this$, 404, new OperationOutcomeCodes(7, []), `reference doesn't exist (${ref})`);
    }
}

export function CandleLiteServer__checkReferencesExist_5D66A394(this$, references) {
    let arg_1;
    const enumerator = getEnumerator(references);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const ref = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const patternInput = parse(ref);
            const segments = patternInput.PathSegments;
            if (patternInput.Parameters.length > 0) {
                CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), `reference should not have parameters (${ref})`);
            }
            if ((!equalsWith((x, y) => (x === y), segments, defaultOf())) && (segments.length === 2)) {
                CandleLiteServer__checkTypeIdReference_4145CFFB(this$, (arg_1 = segments[1], TypeId_From(segments[0], arg_1)));
            }
            else {
                CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), `invalid reference (${ref})`);
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
}

export function CandleLiteServer__storeResource(this$, mode, id, meta, resource) {
    Logger__Trace_DED112C(this$.log, "storeResource", [["mode", mode], ["id", id], ["meta", meta]]);
    const references = new Set([]);
    switch (mode.tag) {
        case 1:
        case 3: {
            collectReferences(references, resource);
            Logger__Trace_DED112C(this$.log, "storeResource references", [["references", references]]);
            break;
        }
        case 2: {
            break;
        }
        default: {
            collectReferences(references, resource);
            Logger__Trace_DED112C(this$.log, "storeResource references", [["references", references]]);
        }
    }
    switch (mode.tag) {
        case 1: {
            unionWith(mode.fields[0], references);
            break;
        }
        case 3:
        case 2: {
            break;
        }
        default: {
            CandleLiteServer__checkReferencesExist_5D66A394(this$, references);
        }
    }
    switch (mode.tag) {
        case 1:
        case 3: {
            this$.runCommand(indexResource(this$.config.SearchParameters, resource, id, meta, references));
            break;
        }
        case 2: {
            break;
        }
        default: {
            this$.runCommand(indexResource(this$.config.SearchParameters, resource, id, meta, references));
        }
    }
    switch (mode.tag) {
        case 0:
        case 3:
        case 2: {
            const json = toString(resource);
            Logger__Trace_DED112C(this$.log, "storeResource inserting version", [["json", json]]);
            this$.runCommand(insertResourceVersion(id, meta, json));
            return json;
        }
        default: {
            return "";
        }
    }
}

export function CandleLiteServer__DELETE_Z78D02DA(this$, req) {
    let testExpr;
    const matchValue = req.URL.PathSegments;
    if ((!equalsWith((x, y) => (x === y), matchValue, defaultOf())) && (matchValue.length === 2)) {
        let typeId;
        const arg_1 = matchValue[1];
        typeId = TypeId_From(matchValue[0], arg_1);
        const versionIdResult = this$.runQuery(indexQuery(IndexConditions__id(typeId)));
        let matchResult, existingVersionId;
        if (!isEmpty(versionIdResult)) {
            if ((testExpr = head(versionIdResult), (!equalsWith(equals, testExpr, defaultOf())) && (testExpr.length === 1))) {
                if (isEmpty(tail(versionIdResult))) {
                    matchResult = 0;
                    existingVersionId = head(versionIdResult)[0];
                }
                else {
                    matchResult = 1;
                }
            }
            else {
                matchResult = 1;
            }
        }
        else {
            matchResult = 1;
        }
        switch (matchResult) {
            case 0: {
                this$.runCommand(deleteIndexForVersion(toString(existingVersionId)));
                this$.runCommand(insertDeletion(typeId, new MetaInfo(CandleLiteServer__nextVersionId(this$), CandleLiteServer__currentTimestamp(this$))));
                return respondWith(204, defaultOf(), "");
            }
            case 1: {
                return CandleLiteServer__raiseOO(this$, 404, new OperationOutcomeCodes(7, []), `existing resource not found (${TypeId__get_TypeId(typeId)})`);
            }
        }
    }
    else {
        return CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), "invalid path in URL");
    }
}

export function CandleLiteServer__PUT(this$, req, storeResource) {
    let testExpr;
    const matchValue = req.URL.PathSegments;
    if ((!equalsWith((x, y) => (x === y), matchValue, defaultOf())) && (matchValue.length === 2)) {
        const _type = matchValue[0];
        const _id = matchValue[1];
        const typeId = TypeId_From(_type, _id);
        const matchValue_1 = req.Body;
        if (matchValue_1 != null) {
            const resource = matchValue_1;
            if (!equals(typeId, resourceId(resource))) {
                return CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), "type and id in URL don\'t match the resource");
            }
            else {
                const versionIdResult = this$.runQuery(indexQuery(IndexConditions__id(typeId)));
                Logger__Debug_DED112C(this$.log, "PUT", [["type", _type], ["id", _id], ["oldVersionId", versionIdResult]]);
                let matchResult, existingVersionId;
                if (!isEmpty(versionIdResult)) {
                    if ((testExpr = head(versionIdResult), (!equalsWith(equals, testExpr, defaultOf())) && (testExpr.length === 1))) {
                        if (isEmpty(tail(versionIdResult))) {
                            matchResult = 0;
                            existingVersionId = head(versionIdResult)[0];
                        }
                        else {
                            matchResult = 1;
                        }
                    }
                    else {
                        matchResult = 1;
                    }
                }
                else {
                    matchResult = 1;
                }
                switch (matchResult) {
                    case 0: {
                        this$.runCommand(deleteIndexForVersion(toString(existingVersionId)));
                        const meta = CandleLiteServer__updateVersionId_Z746D228E(this$, resource);
                        return addLocation(typeId, meta, addETagAndLastUpdated(resource, CandleLiteServer__respondAsClientPrefers(this$, 200, req, resource, storeResource(typeId, meta, resource))));
                    }
                    case 1: {
                        return CandleLiteServer__raiseOO(this$, 404, new OperationOutcomeCodes(7, []), `existing resource not found (${TypeId__get_TypeId(typeId)})`);
                    }
                }
            }
        }
        else {
            return CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(0, []), "not JSON body in PUT (update) request");
        }
    }
    else {
        return CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), "invalid path in URL");
    }
}

export function CandleLiteServer__GET_Z78D02DA(this$, req) {
    const matchValue = req.URL.PathSegments;
    let matchResult;
    if ((!equalsWith((x, y) => (x === y), matchValue, defaultOf())) && (matchValue.length === 3)) {
        if (matchValue[2] === "_history") {
            matchResult = 0;
        }
        else {
            matchResult = 6;
        }
    }
    else if ((!equalsWith((x_1, y_1) => (x_1 === y_1), matchValue, defaultOf())) && (matchValue.length === 2)) {
        if (matchValue[1] === "_history") {
            matchResult = 1;
        }
        else {
            matchResult = 4;
        }
    }
    else if ((!equalsWith((x_2, y_2) => (x_2 === y_2), matchValue, defaultOf())) && (matchValue.length === 1)) {
        if (matchValue[0] === "_history") {
            matchResult = 2;
        }
        else {
            matchResult = 5;
        }
    }
    else if ((!equalsWith((x_3, y_3) => (x_3 === y_3), matchValue, defaultOf())) && (matchValue.length === 4)) {
        if (matchValue[2] === "_history") {
            matchResult = 3;
        }
        else {
            matchResult = 6;
        }
    }
    else {
        matchResult = 6;
    }
    switch (matchResult) {
        case 0: {
            return CandleLiteServer__historyForId(this$, matchValue[0], matchValue[1], req);
        }
        case 1: {
            return CandleLiteServer__historyForType(this$, matchValue[0], req);
        }
        case 2: {
            return CandleLiteServer__historyForServer_1505(this$, req);
        }
        case 3: {
            const versionId = matchValue[3];
            return CandleLiteServer__vread(this$, matchValue[0], matchValue[1], versionId, req);
        }
        case 4: {
            return CandleLiteServer__read(this$, matchValue[0], matchValue[1], req);
        }
        case 5: {
            return CandleLiteServer__search(this$, matchValue[0], req)[1];
        }
        case 6: {
            return CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), "invalid path in URL");
        }
    }
}

export function CandleLiteServer__create(this$, _type, req, storeResource) {
    const matchValue = req.Body;
    if (matchValue != null) {
        const resource = matchValue;
        const typeFromResource = resourceType(resource);
        if (typeFromResource !== _type) {
            CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), `type in URL doesn't match that of resource: from URL '${_type}', form resource '${typeFromResource}'`);
        }
        const newId = new TypeId(_type, CandleLiteServer__nextCounter_Z721C83C5(this$, _type));
        resource.SetString(singleton_1("id"), newId.Id);
        const meta = CandleLiteServer__updateVersionId_Z746D228E(this$, resource);
        return addLocation(newId, meta, addETagAndLastUpdated(resource, CandleLiteServer__respondAsClientPrefers(this$, 201, req, resource, storeResource(newId, meta, resource))));
    }
    else {
        return CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(0, []), "not JSON body in POST (create) request");
    }
}

export function CandleLiteServer__createFromBundle(this$, req, storeResource) {
    const matchValue = req.URL.PathSegments;
    if ((!equalsWith((x, y) => (x === y), matchValue, defaultOf())) && (matchValue.length === 1)) {
        return CandleLiteServer__create(this$, matchValue[0], req, storeResource);
    }
    else {
        return CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), "invalid path for bundled POST request");
    }
}

export function CandleLiteServer__transaction_Z78D02DA(this$, req) {
    let arg_2, testExpr, _type, oid, hashtag, testExpr_1, _type_1, _id;
    const matchValue = req.Body;
    if (matchValue != null) {
        const body = matchValue;
        const bundle = this$.jsonImpl.ParseBundle(body);
        const processEntry = (entry, storeResource) => {
            let res;
            const matchValue_1 = entry.Request;
            if (matchValue_1 != null) {
                const request = matchValue_1;
                const req_1 = new Request(parse(request.Url), entry.Resource, request.IfMatch, request.IfModifiedSince, request.IfNoneExist, req.PreferReturn);
                const matchValue_2 = request.Method;
                res = ((matchValue_2 === "GET") ? CandleLiteServer__GET_Z78D02DA(this$, req_1) : ((matchValue_2 === "POST") ? CandleLiteServer__createFromBundle(this$, req_1, uncurry(3, storeResource)) : ((matchValue_2 === "PUT") ? CandleLiteServer__PUT(this$, req_1, uncurry(3, storeResource)) : CandleLiteServer__raiseOO(this$, 405, new OperationOutcomeCodes(2, []), "method not allowed"))));
            }
            else {
                res = CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), "transaction/batch entries should have a request element");
            }
            return [new BundleEntry(void 0, res.BodyResource, void 0, new BundleResponse(int32ToString(res.Status), res.Location, res.ETag, res.LastUpdated, void 0)), res.TypeId];
        };
        let isTransaction;
        const matchValue_3 = bundle.Type;
        isTransaction = ((matchValue_3 === "transaction") ? true : ((matchValue_3 === "batch") ? false : CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), "expected batch or transaction bundle")));
        const entries = defaultArg(bundle.Entry, []);
        let entryExecutionOrder;
        const incrementingIndices = mapIndexed((i, _arg) => i, fill(new Array(entries.length), 0, entries.length, null), Int32Array);
        if (isTransaction) {
            const methodOrder = ["DELETE", "POST", "PUT", "PATCH", "GET", "HEAD"];
            const orderForTransactionEntry = (index) => {
                const matchValue_4 = entries[index].Request;
                if (matchValue_4 == null) {
                    return CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), "transaction/batch entries should have a request") | 0;
                }
                else {
                    const request_1 = matchValue_4;
                    return findIndex((y) => (request_1.Method === y), methodOrder) | 0;
                }
            };
            entryExecutionOrder = sortWith((a, b) => (orderForTransactionEntry(a) - orderForTransactionEntry(b)), incrementingIndices);
        }
        else {
            entryExecutionOrder = incrementingIndices;
        }
        if (isTransaction) {
            this$.runCommand(new Statement(7, []));
        }
        try {
            let storageFunction;
            if (isTransaction) {
                const preliminaryIndex = (cmd) => {
                    this$.dbImpl.RunSql(cmd("preliminary-index"));
                };
                preliminaryIndex((arg) => (new Statement(4, [arg])));
                const allReferences = new Set([]);
                const fullUrlToResolvedId = new Map([]);
                entryExecutionOrder.forEach((index_1) => {
                    let req_2;
                    const entry_1 = entries[index_1];
                    const matchValue_5 = entry_1.Request;
                    let matchResult;
                    if (matchValue_5 != null) {
                        if ((req_2 = matchValue_5, (req_2.Method === "GET") ? true : (req_2.Method === "HEAD"))) {
                            matchResult = 0;
                        }
                        else {
                            matchResult = 1;
                        }
                    }
                    else {
                        matchResult = 1;
                    }
                    switch (matchResult) {
                        case 0: {
                            break;
                        }
                        case 1: {
                            const typeId = processEntry(entries[index_1], (id) => ((meta) => ((resource) => CandleLiteServer__storeResource(this$, new StorageMode(1, [allReferences]), id, meta, resource))))[1];
                            const matchValue_6 = entry_1.FullUrl;
                            if (typeId == null) {
                                throw new Error("processEntry did not return a type/id");
                            }
                            else if (matchValue_6 == null) {
                                CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), "transaction/batch entries should have fullUrl");
                            }
                            else {
                                const fullUrl = matchValue_6;
                                const typeId_1 = typeId;
                                try {
                                    addToDict(fullUrlToResolvedId, fullUrl, typeId_1);
                                }
                                catch (matchValue_8) {
                                    throw matchValue_8;
                                }
                            }
                            break;
                        }
                    }
                });
                const referencesToUpdate = new Map([]);
                let enumerator = getEnumerator(allReferences);
                try {
                    while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                        const reference = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                        const parsed = parse(reference);
                        const matchValue_9 = parsed.Parameters.length | 0;
                        const matchValue_10 = parsed.PathSegments;
                        let matchResult_1;
                        if ((testExpr = matchValue_10, (!equalsWith((x_1, y_1) => (x_1 === y_1), testExpr, defaultOf())) && (testExpr.length === 1))) {
                            if ((_type = matchValue_10[0], matchValue_9 > 0)) {
                                matchResult_1 = 0;
                            }
                            else if ((oid = matchValue_10[0], (matchValue_9 === 0) && (oid.indexOf("urn:uuid:") === 0))) {
                                matchResult_1 = 2;
                            }
                            else if ((hashtag = matchValue_10[0], (matchValue_9 === 0) && (hashtag.indexOf("#") === 0))) {
                                matchResult_1 = 3;
                            }
                            else {
                                matchResult_1 = 4;
                            }
                        }
                        else if ((testExpr_1 = matchValue_10, (!equalsWith((x_2, y_2) => (x_2 === y_2), testExpr_1, defaultOf())) && (testExpr_1.length === 2))) {
                            if ((_type_1 = matchValue_10[0], (_id = matchValue_10[1], matchValue_9 === 0))) {
                                matchResult_1 = 1;
                            }
                            else {
                                matchResult_1 = 4;
                            }
                        }
                        else {
                            matchResult_1 = 4;
                        }
                        switch (matchResult_1) {
                            case 0: {
                                const resultEntries = defaultArg(CandleLiteServer__search(this$, matchValue_10[0], Request_forURL_Z309E9F90(parsed))[0].Entry, []);
                                const matchValue_12 = resultEntries.length | 0;
                                if (matchValue_12 === 0) {
                                    CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(7, []), `no matches for conditional reference (${reference})`);
                                }
                                else if (matchValue_12 === 1) {
                                    addToDict(referencesToUpdate, reference, resourceId(value_5(resultEntries[0].Resource)));
                                }
                                else {
                                    CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(6, []), `multiple matches for conditional reference (${reference})`);
                                }
                                break;
                            }
                            case 1: {
                                CandleLiteServer__checkTypeIdReference_4145CFFB(this$, (arg_2 = matchValue_10[1], TypeId_From(matchValue_10[0], arg_2)));
                                break;
                            }
                            case 2: {
                                const oid_1 = matchValue_10[0];
                                let matchValue_13;
                                let outArg = defaultOf();
                                matchValue_13 = [tryGetValue(fullUrlToResolvedId, oid_1, new FSharpRef(() => outArg, (v) => {
                                    outArg = v;
                                })), outArg];
                                if (matchValue_13[0]) {
                                    addToDict(referencesToUpdate, reference, matchValue_13[1]);
                                }
                                else {
                                    CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), `placeholder reference not present as a fullUrl (${reference})`);
                                }
                                break;
                            }
                            case 3: {
                                const hashtag_1 = matchValue_10[0];
                                break;
                            }
                            case 4: {
                                CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), `invalid reference (${reference})`);
                                break;
                            }
                        }
                    }
                }
                finally {
                    disposeSafe(enumerator);
                }
                if (referencesToUpdate.size > 0) {
                    for (let idx = 0; idx <= (entries.length - 1); idx++) {
                        iterate((resource_1) => {
                            resource_1.WalkAndModify((prop, value_3) => {
                                if (prop === "reference") {
                                    let matchValue_14;
                                    let outArg_1 = defaultOf();
                                    matchValue_14 = [tryGetValue(referencesToUpdate, value_3, new FSharpRef(() => outArg_1, (v_1) => {
                                        outArg_1 = v_1;
                                    })), outArg_1];
                                    return matchValue_14[0] ? TypeId__get_TypeId(matchValue_14[1]) : (void 0);
                                }
                                else {
                                    return void 0;
                                }
                            });
                        }, toArray(entries[idx].Resource));
                    }
                    preliminaryIndex((arg_3) => (new Statement(6, [arg_3])));
                    storageFunction = ((id_1) => ((meta_1) => ((resource_2) => CandleLiteServer__storeResource(this$, new StorageMode(3, []), id_1, meta_1, resource_2))));
                }
                else {
                    preliminaryIndex((arg_4) => (new Statement(6, [arg_4])));
                    storageFunction = ((id_2) => ((meta_2) => ((resource_3) => CandleLiteServer__storeResource(this$, new StorageMode(3, []), id_2, meta_2, resource_3))));
                }
            }
            else {
                storageFunction = ((id_3) => ((meta_3) => ((resource_4) => CandleLiteServer__storeResource(this$, new StorageMode(0, []), id_3, meta_3, resource_4))));
            }
            const responseEntries = fill(new Array(entries.length), 0, entries.length, void 0);
            entryExecutionOrder.forEach((index_2) => {
                const entry_3 = entries[index_2];
                const continueTransactionOnFailure = () => {
                    if (equals(map((r) => (r.Method === "GET"), entry_3.Request), true)) {
                        return false === false;
                    }
                    else {
                        return false;
                    }
                };
                try {
                    const patternInput_2 = processEntry(entry_3, storageFunction);
                    responseEntries[index_2] = patternInput_2[0];
                }
                catch (matchValue_15) {
                    let matchResult_2, oo_1, status_1;
                    if (matchValue_15 instanceof OperationOutcomeException) {
                        if ((isTransaction === false) ? true : continueTransactionOnFailure()) {
                            matchResult_2 = 0;
                            oo_1 = matchValue_15.Data1;
                            status_1 = matchValue_15.Data0;
                        }
                        else {
                            matchResult_2 = 1;
                        }
                    }
                    else {
                        matchResult_2 = 1;
                    }
                    switch (matchResult_2) {
                        case 0: {
                            const bundleEntry_1 = new BundleEntry(void 0, CandleLiteServer__respondWithOO(this$, status_1, oo_1).BodyResource, void 0, new BundleResponse(int32ToString(status_1), void 0, void 0, void 0, void 0));
                            responseEntries[index_2] = bundleEntry_1;
                            break;
                        }
                        case 1: {
                            throw matchValue_15;
                            break;
                        }
                    }
                }
            });
            if (isTransaction) {
                this$.runCommand(new Statement(8, []));
            }
            return CandleLiteServer__respondWithBundle(this$, 200, new Bundle("Bundle", bundle.Type + "-response", entries.length, CandleLiteServer__currentTimestamp(this$), void 0, map_1((option_4) => defaultArgWith(option_4, () => {
                throw new Error("response entry is None");
            }), responseEntries, null)));
        }
        catch (matchValue_16) {
            if (matchValue_16 instanceof OperationOutcomeException) {
                this$.runCommand(new Statement(9, []));
                return CandleLiteServer__respondWithOO(this$, matchValue_16.Data0, matchValue_16.Data1);
            }
            else {
                this$.runCommand(new Statement(9, []));
                return CandleLiteServer__raiseOO(this$, 500, new OperationOutcomeCodes(10, []), toString(matchValue_16));
            }
        }
    }
    else {
        return CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), "missing request body");
    }
}

export function CandleLiteServer__POST(this$, req, storeResource) {
    const matchValue = req.URL.PathSegments;
    if ((!equalsWith((x, y) => (x === y), matchValue, defaultOf())) && (matchValue.length === 0)) {
        return CandleLiteServer__transaction_Z78D02DA(this$, req);
    }
    else if ((!equalsWith((x_1, y_1) => (x_1 === y_1), matchValue, defaultOf())) && (matchValue.length === 1)) {
        return CandleLiteServer__create(this$, matchValue[0], req, storeResource);
    }
    else {
        return CandleLiteServer__raiseOO(this$, 400, new OperationOutcomeCodes(2, []), "invalid path for POST request");
    }
}

