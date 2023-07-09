import { Record } from "../fable_modules/fable-library.4.0.0-theta-018/Types.js";
import { array_type, int32_type, class_type, option_type, record_type, string_type } from "../fable_modules/fable-library.4.0.0-theta-018/Reflection.js";

export class BundleLink extends Record {
    constructor(Relation, Uri) {
        super();
        this.Relation = Relation;
        this.Uri = Uri;
    }
}

export function BundleLink$reflection() {
    return record_type("CandleLite.Core.Bundle.BundleLink", [], BundleLink, () => [["Relation", string_type], ["Uri", string_type]]);
}

export class BundleRequest extends Record {
    constructor(Method, Url, IfNoneMatch, IfModifiedSince, IfMatch, IfNoneExist) {
        super();
        this.Method = Method;
        this.Url = Url;
        this.IfNoneMatch = IfNoneMatch;
        this.IfModifiedSince = IfModifiedSince;
        this.IfMatch = IfMatch;
        this.IfNoneExist = IfNoneExist;
    }
}

export function BundleRequest$reflection() {
    return record_type("CandleLite.Core.Bundle.BundleRequest", [], BundleRequest, () => [["Method", string_type], ["Url", string_type], ["IfNoneMatch", option_type(string_type)], ["IfModifiedSince", option_type(string_type)], ["IfMatch", option_type(string_type)], ["IfNoneExist", option_type(string_type)]]);
}

export class BundleResponse extends Record {
    constructor(Status, Location, Etag, LastModified, Outcome) {
        super();
        this.Status = Status;
        this.Location = Location;
        this.Etag = Etag;
        this.LastModified = LastModified;
        this.Outcome = Outcome;
    }
}

export function BundleResponse$reflection() {
    return record_type("CandleLite.Core.Bundle.BundleResponse", [], BundleResponse, () => [["Status", string_type], ["Location", option_type(string_type)], ["Etag", option_type(string_type)], ["LastModified", option_type(string_type)], ["Outcome", option_type(class_type("CandleLite.Core.JSON.IJsonElement"))]]);
}

export class BundleEntry extends Record {
    constructor(FullUrl, Resource, Request, Response) {
        super();
        this.FullUrl = FullUrl;
        this.Resource = Resource;
        this.Request = Request;
        this.Response = Response;
    }
}

export function BundleEntry$reflection() {
    return record_type("CandleLite.Core.Bundle.BundleEntry", [], BundleEntry, () => [["FullUrl", option_type(string_type)], ["Resource", option_type(class_type("CandleLite.Core.JSON.IJsonElement"))], ["Request", option_type(BundleRequest$reflection())], ["Response", option_type(BundleResponse$reflection())]]);
}

export class Bundle extends Record {
    constructor(ResourceType, Type, Total, Timestamp, Link, Entry) {
        super();
        this.ResourceType = ResourceType;
        this.Type = Type;
        this.Total = Total;
        this.Timestamp = Timestamp;
        this.Link = Link;
        this.Entry = Entry;
    }
}

export function Bundle$reflection() {
    return record_type("CandleLite.Core.Bundle.Bundle", [], Bundle, () => [["ResourceType", string_type], ["Type", string_type], ["Total", option_type(int32_type)], ["Timestamp", option_type(string_type)], ["Link", option_type(array_type(BundleLink$reflection()))], ["Entry", option_type(array_type(BundleEntry$reflection()))]]);
}

export const BundleType_SearchSet = "searchset";

