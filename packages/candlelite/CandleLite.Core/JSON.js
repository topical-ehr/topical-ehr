import { Record } from "../fable_modules/fable-library.4.0.0-theta-018/Types.js";
import { record_type, string_type } from "../fable_modules/fable-library.4.0.0-theta-018/Reflection.js";
import { singleton, ofArray } from "../fable_modules/fable-library.4.0.0-theta-018/List.js";
import { TypeId } from "./Types.js";
import { addToSet } from "../fable_modules/fable-library.4.0.0-theta-018/MapUtil.js";

export class MetaInfo extends Record {
    constructor(VersionId, LastUpdated) {
        super();
        this.VersionId = VersionId;
        this.LastUpdated = LastUpdated;
    }
}

export function MetaInfo$reflection() {
    return record_type("CandleLite.Core.JSON.MetaInfo", [], MetaInfo, () => [["VersionId", string_type], ["LastUpdated", string_type]]);
}

export function metaInfo(elt) {
    return new MetaInfo(elt.GetString(ofArray(["meta", "versionId"])), elt.GetString(ofArray(["meta", "lastUpdated"])));
}

export function resourceType(elt) {
    return elt.GetString(singleton("resourceType"));
}

export function resourceId(elt) {
    return new TypeId(resourceType(elt), elt.GetString(singleton("id")));
}

export function collectReferences(set$, resource) {
    resource.WalkAndModify((prop, value) => {
        if (prop === "reference") {
            addToSet(value, set$);
        }
        return void 0;
    });
}

