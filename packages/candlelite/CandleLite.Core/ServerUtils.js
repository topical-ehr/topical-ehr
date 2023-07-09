import { Record, Union } from "../fable_modules/fable-library.4.0.0-theta-018/Types.js";
import { int32_type, record_type, string_type, option_type, class_type, union_type } from "../fable_modules/fable-library.4.0.0-theta-018/Reflection.js";
import { FhirURL$reflection } from "./URL.js";
import { TypeId$reflection } from "./Types.js";
import { metaInfo as metaInfo_1 } from "./JSON.js";

export class PreferReturn extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Minimal", "Representation", "OperationOutcome"];
    }
}

export function PreferReturn$reflection() {
    return union_type("CandleLite.Core.ServerUtils.PreferReturn", [], PreferReturn, () => [[], [], []]);
}

export class Request extends Record {
    constructor(URL$, Body, IfMatch, IfModifiedSince, IfNoneExist, PreferReturn) {
        super();
        this.URL = URL$;
        this.Body = Body;
        this.IfMatch = IfMatch;
        this.IfModifiedSince = IfModifiedSince;
        this.IfNoneExist = IfNoneExist;
        this.PreferReturn = PreferReturn;
    }
}

export function Request$reflection() {
    return record_type("CandleLite.Core.ServerUtils.Request", [], Request, () => [["URL", FhirURL$reflection()], ["Body", option_type(class_type("CandleLite.Core.JSON.IJsonElement"))], ["IfMatch", option_type(string_type)], ["IfModifiedSince", option_type(string_type)], ["IfNoneExist", option_type(string_type)], ["PreferReturn", option_type(PreferReturn$reflection())]]);
}

export function Request_forURL_Z309E9F90(url) {
    return new Request(url, void 0, void 0, void 0, void 0, void 0);
}

export class Response extends Record {
    constructor(Status, BodyResource, BodyString, Location, TypeId, ETag, LastUpdated) {
        super();
        this.Status = (Status | 0);
        this.BodyResource = BodyResource;
        this.BodyString = BodyString;
        this.Location = Location;
        this.TypeId = TypeId;
        this.ETag = ETag;
        this.LastUpdated = LastUpdated;
    }
}

export function Response$reflection() {
    return record_type("CandleLite.Core.ServerUtils.Response", [], Response, () => [["Status", int32_type], ["BodyResource", class_type("CandleLite.Core.JSON.IJsonElement")], ["BodyString", string_type], ["Location", option_type(string_type)], ["TypeId", option_type(TypeId$reflection())], ["ETag", option_type(string_type)], ["LastUpdated", option_type(string_type)]]);
}

export class StorageMode extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["CheckRefsIndexAndStore", "PreliminaryIndexing", "StoreOnly", "IndexAndStore"];
    }
}

export function StorageMode$reflection() {
    return union_type("CandleLite.Core.ServerUtils.StorageMode", [], StorageMode, () => [[], [["allReferences", class_type("System.Collections.Generic.HashSet`1", [string_type])]], [], []]);
}

export function respondWith(status, bodyResource, bodyString) {
    return new Response(status, bodyResource, bodyString, void 0, void 0, void 0, void 0);
}

export function addETagAndLastUpdated(resource, response) {
    const metaInfo = metaInfo_1(resource);
    return new Response(response.Status, response.BodyResource, response.BodyString, response.Location, response.TypeId, `W/"${metaInfo.VersionId}"`, metaInfo.LastUpdated);
}

export function addLocation(id, meta, response) {
    return new Response(response.Status, response.BodyResource, response.BodyString, `${id.Type}/${id.Id}/_history/${meta.VersionId}`, id, response.ETag, response.LastUpdated);
}

