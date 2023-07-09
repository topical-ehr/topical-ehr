import { FSharpException, toString, Union, Record } from "../fable_modules/fable-library.4.0.0-theta-018/Types.js";
import { class_type, list_type, union_type, record_type, string_type } from "../fable_modules/fable-library.4.0.0-theta-018/Reflection.js";
import { replace } from "../fable_modules/fable-library.4.0.0-theta-018/String.js";
import { singleton } from "../fable_modules/fable-library.4.0.0-theta-018/List.js";
import { defaultOf, equals } from "../fable_modules/fable-library.4.0.0-theta-018/Util.js";

export class TypeId extends Record {
    constructor(Type, Id) {
        super();
        this.Type = Type;
        this.Id = Id;
    }
}

export function TypeId$reflection() {
    return record_type("CandleLite.Core.Types.TypeId", [], TypeId, () => [["Type", string_type], ["Id", string_type]]);
}

export function TypeId__get_TypeId(this$) {
    return `${this$.Type}/${this$.Id}`;
}

export function TypeId_From(_type, _id) {
    return new TypeId(_type, _id);
}

export class TokenValue extends Record {
    constructor(System, Code) {
        super();
        this.System = System;
        this.Code = Code;
    }
}

export function TokenValue$reflection() {
    return record_type("CandleLite.Core.Types.TokenValue", [], TokenValue, () => [["System", string_type], ["Code", string_type]]);
}

export class OperationOutcomeIssue extends Record {
    constructor(Severity, Code, Diagnostics) {
        super();
        this.Severity = Severity;
        this.Code = Code;
        this.Diagnostics = Diagnostics;
    }
}

export function OperationOutcomeIssue$reflection() {
    return record_type("CandleLite.Core.Types.OperationOutcomeIssue", [], OperationOutcomeIssue, () => [["Severity", string_type], ["Code", string_type], ["Diagnostics", string_type]]);
}

export class OperationOutcomeSeverity extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Fatal", "Error", "Warning", "Information"];
    }
}

export function OperationOutcomeSeverity$reflection() {
    return union_type("CandleLite.Core.Types.OperationOutcomeSeverity", [], OperationOutcomeSeverity, () => [[], [], [], []]);
}

export class OperationOutcomeCodes extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Structure", "Required", "Value", "Invariant", "Not_Supported", "Duplicate", "Multiple_Matches", "Not_Found", "Deleted", "Conflict", "Exception", "Informational"];
    }
}

export function OperationOutcomeCodes$reflection() {
    return union_type("CandleLite.Core.Types.OperationOutcomeCodes", [], OperationOutcomeCodes, () => [[], [], [], [], [], [], [], [], [], [], [], []]);
}

export class OperationOutcome extends Record {
    constructor(ResourceType, Issue) {
        super();
        this.ResourceType = ResourceType;
        this.Issue = Issue;
    }
}

export function OperationOutcome$reflection() {
    return record_type("CandleLite.Core.Types.OperationOutcome", [], OperationOutcome, () => [["ResourceType", string_type], ["Issue", list_type(OperationOutcomeIssue$reflection())]]);
}

export function operationOutcome(severity, code, diagnosticInfo) {
    const toCode = (x) => replace(toString(x), "_", "-").toLowerCase();
    return new OperationOutcome("OperationOutcome", singleton(new OperationOutcomeIssue(toCode(severity), toCode(code), diagnosticInfo)));
}

export class OperationOutcomeException extends FSharpException {
    constructor(Data0, Data1) {
        super();
        this.Data0 = (Data0 | 0);
        this.Data1 = Data1;
    }
}

export function OperationOutcomeException$reflection() {
    return class_type("CandleLite.Core.Types.OperationOutcomeException", void 0, OperationOutcomeException, class_type("System.Exception"));
}

export function OperationOutcomeException__Equals_229D3F39(this$, obj) {
    if (!equals(this$, defaultOf())) {
        if (!equals(obj, defaultOf())) {
            if (obj instanceof OperationOutcomeException) {
                if (this$.Data0 === obj.Data0) {
                    return equals(this$.Data1, obj.Data1);
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    else if (!equals(obj, defaultOf())) {
        return false;
    }
    else {
        return true;
    }
}

