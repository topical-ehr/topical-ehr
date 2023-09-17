import { toString as toString_1 } from "../fable-library.4.0.0-theta-018/Decimal.js";
import { comparePrimitives, Lazy, uncurry, disposeSafe, getEnumerator, defaultOf } from "../fable-library.4.0.0-theta-018/Util.js";
import { empty, map as map_5, tryFind, add, toList } from "../fable-library.4.0.0-theta-018/Map.js";
import { toString as toString_2 } from "../fable-library.4.0.0-theta-018/BigInt.js";
import { toString as toString_3 } from "../fable-library.4.0.0-theta-018/Date.js";
import { toString as toString_4 } from "../fable-library.4.0.0-theta-018/TimeSpan.js";
import { map as map_1 } from "../fable-library.4.0.0-theta-018/List.js";
import { defaultArg, map as map_2, defaultArgWith, some } from "../fable-library.4.0.0-theta-018/Option.js";
import { toString as toString_5, FSharpRef } from "../fable-library.4.0.0-theta-018/Types.js";
import { class_type, getGenerics, getGenericTypeDefinition, getTupleFields, getTupleElements, isTuple, isGenericType, getEnumUnderlyingType, isEnum, getElementType, isArray, getUnionCaseFields, getUnionFields, isUnion, getRecordElements, getRecordField, name, isRecord, fullName as fullName_1 } from "../fable-library.4.0.0-theta-018/Reflection.js";
import { fill, map as map_3 } from "../fable-library.4.0.0-theta-018/Array.js";
import { Util_CachedEncoders, Util_Cache$1__GetOrAdd_43981464, CaseStrategy, Util_Casing_convert } from "./Types.fs.js";
import { mapIndexed, map as map_4, fold } from "../fable-library.4.0.0-theta-018/Seq.js";
import { toFail, printf, toText } from "../fable-library.4.0.0-theta-018/String.js";

export function guid(value) {
    return value;
}

export function decimal(value) {
    return toString_1(value);
}

export const nil = defaultOf();

export function object(values) {
    const o = {};
    const enumerator = getEnumerator(values);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            o[forLoopVar[0]] = forLoopVar[1];
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    return o;
}

export function list(values) {
    return Array.from(values);
}

export function seq(values) {
    return Array.from(values);
}

export function dict(values) {
    return object(toList(values));
}

export function bigint(value) {
    return toString_2(value);
}

export function datetimeOffset(value) {
    return toString_3(value, "O", {});
}

export function timespan(value) {
    return toString_4(value);
}

export function int64(value) {
    return String(value);
}

export function uint64(value) {
    return String(value);
}

export function unit() {
    return defaultOf();
}

export function tuple2(enc1, enc2, v1, v2) {
    return [enc1(v1), enc2(v2)];
}

export function tuple3(enc1, enc2, enc3, v1, v2, v3) {
    return [enc1(v1), enc2(v2), enc3(v3)];
}

export function tuple4(enc1, enc2, enc3, enc4, v1, v2, v3, v4) {
    return [enc1(v1), enc2(v2), enc3(v3), enc4(v4)];
}

export function tuple5(enc1, enc2, enc3, enc4, enc5, v1, v2, v3, v4, v5) {
    return [enc1(v1), enc2(v2), enc3(v3), enc4(v4), enc5(v5)];
}

export function tuple6(enc1, enc2, enc3, enc4, enc5, enc6, v1, v2, v3, v4, v5, v6) {
    return [enc1(v1), enc2(v2), enc3(v3), enc4(v4), enc5(v5), enc6(v6)];
}

export function tuple7(enc1, enc2, enc3, enc4, enc5, enc6, enc7, v1, v2, v3, v4, v5, v6, v7) {
    return [enc1(v1), enc2(v2), enc3(v3), enc4(v4), enc5(v5), enc6(v6), enc7(v7)];
}

export function tuple8(enc1, enc2, enc3, enc4, enc5, enc6, enc7, enc8, v1, v2, v3, v4, v5, v6, v7, v8) {
    return [enc1(v1), enc2(v2), enc3(v3), enc4(v4), enc5(v5), enc6(v6), enc7(v7), enc8(v8)];
}

export function map(keyEncoder, valueEncoder, values) {
    return list(map_1((tupledArg) => tuple2(keyEncoder, valueEncoder, tupledArg[0], tupledArg[1]), toList(values)));
}

export function Enum_byte(value) {
    return value;
}

export function Enum_sbyte(value) {
    return value;
}

export function Enum_int16(value) {
    return value;
}

export function Enum_uint16(value) {
    return value;
}

export function Enum_int(value) {
    return value;
}

export function Enum_uint32(value) {
    return value;
}

export function datetime(value) {
    return toString_3(value, "O", {});
}

export function toString(space, value) {
    return JSON.stringify(value, uncurry(2, defaultOf()), some(space));
}

export function option(encoder) {
    return (arg) => defaultArgWith(map_2(encoder, arg), () => nil);
}

function autoEncodeRecordsAndUnions(extra, caseStrategy, skipNullField, t) {
    let arg;
    const encoderRef = new FSharpRef(defaultOf());
    let extra_1;
    const matchValue = fullName_1(t);
    extra_1 = ((matchValue === "") ? extra : add(matchValue, encoderRef, extra));
    let encoder;
    if (isRecord(t, true)) {
        const setters = map_3((fi) => {
            const targetKey = Util_Casing_convert(caseStrategy, name(fi));
            const encode_1 = autoEncoder(extra_1, caseStrategy, skipNullField, fi[1]);
            return (source) => ((target) => {
                const value = getRecordField(source, fi);
                if ((!skipNullField) ? true : (skipNullField && (!(value == null)))) {
                    target[targetKey]=encode_1(value);
                }
                return target;
            });
        }, getRecordElements(t, true), null);
        encoder = ((source_1) => fold((target_1, set$) => set$(source_1)(target_1), {}, setters));
    }
    else if (isUnion(t, true)) {
        encoder = ((value_1) => {
            const patternInput = getUnionFields(value_1, t, true);
            const info = patternInput[0];
            const fields = patternInput[1];
            const matchValue_1 = fields.length | 0;
            if (matchValue_1 === 0) {
                return name(info);
            }
            else {
                const len = matchValue_1 | 0;
                const fieldTypes = getUnionCaseFields(info);
                const target_2 = fill(new Array(len + 1), 0, len + 1, null);
                target_2[0] = name(info);
                for (let i = 1; i <= len; i++) {
                    const encode_2 = autoEncoder(extra_1, caseStrategy, skipNullField, fieldTypes[i - 1][1]);
                    target_2[i] = encode_2(fields[i - 1]);
                }
                return target_2;
            }
        });
    }
    else {
        throw new Error((arg = fullName_1(t), toText(printf("Cannot generate auto encoder for %s. Please pass an extra encoder.\n\nDocumentation available at: https://thoth-org.github.io/Thoth.Json/documentation/auto/extra-coders.html#ready-to-use-extra-coders"))(arg)));
    }
    encoderRef.contents = encoder;
    return encoder;
}

function autoEncoder(extra, caseStrategy, skipNullField, t) {
    const fullname = fullName_1(t);
    const matchValue = tryFind(fullname, extra);
    if (matchValue == null) {
        if (isArray(t)) {
            const encoder = autoEncoder(extra, caseStrategy, skipNullField, getElementType(t));
            return (value) => seq(map_4(encoder, value));
        }
        else if (isEnum(t)) {
            const enumType = fullName_1(getEnumUnderlyingType(t));
            if (enumType === "System.SByte") {
                return (value_1) => value_1;
            }
            else if (enumType === "System.Byte") {
                return (value_3) => value_3;
            }
            else if (enumType === "System.Int16") {
                return (value_5) => value_5;
            }
            else if (enumType === "System.UInt16") {
                return (value_7) => value_7;
            }
            else if (enumType === "System.Int32") {
                return (value_9) => value_9;
            }
            else if (enumType === "System.UInt32") {
                return (value_11) => value_11;
            }
            else {
                const arg = fullName_1(t);
                const clo_1 = toFail(printf("Cannot generate auto encoder for %s.\nThoth.Json.Net only support the following enum types:\n- sbyte\n- byte\n- int16\n- uint16\n- int\n- uint32\n\nIf you can\'t use one of these types, please pass an extra encoder.\n\nDocumentation available at: https://thoth-org.github.io/Thoth.Json/documentation/auto/extra-coders.html#ready-to-use-extra-coders\n                    "))(arg);
                return clo_1;
            }
        }
        else if (isGenericType(t)) {
            if (isTuple(t)) {
                const encoders = map_3((t_2) => autoEncoder(extra, caseStrategy, skipNullField, t_2), getTupleElements(t), null);
                return (value_13) => seq(mapIndexed((i, x) => encoders[i](x), getTupleFields(value_13)));
            }
            else {
                const fullname_1 = fullName_1(getGenericTypeDefinition(t));
                if (fullname_1 === "Microsoft.FSharp.Core.FSharpOption`1[System.Object]") {
                    const encoder_2 = new Lazy(() => option(autoEncoder(extra, caseStrategy, skipNullField, getGenerics(t)[0])));
                    return (value_14) => {
                        if (value_14 == null) {
                            return nil;
                        }
                        else {
                            return encoder_2.Value(value_14);
                        }
                    };
                }
                else if (((fullname_1 === "Microsoft.FSharp.Collections.FSharpList`1[System.Object]") ? true : (fullname_1 === "Microsoft.FSharp.Collections.FSharpSet`1[System.Object]")) ? true : (fullname_1 === "System.Collections.Generic.IEnumerable`1[System.Object]")) {
                    const encoder_3 = autoEncoder(extra, caseStrategy, skipNullField, getGenerics(t)[0]);
                    return (value_15) => seq(map_4(encoder_3, value_15));
                }
                else if (fullname_1 === "Microsoft.FSharp.Collections.FSharpMap`2[System.Object,System.Object]") {
                    const keyType = getGenerics(t)[0];
                    const valueEncoder = autoEncoder(extra, caseStrategy, skipNullField, getGenerics(t)[1]);
                    if ((fullName_1(keyType) === "System.String") ? true : (fullName_1(keyType) === "System.Guid")) {
                        return (value_16) => fold((target, _arg) => {
                            const activePatternResult = _arg;
                            target[activePatternResult[0]]=valueEncoder(activePatternResult[1]);
                            return target;
                        }, {}, value_16);
                    }
                    else {
                        let keyEncoder;
                        const clo_2 = autoEncoder(extra, caseStrategy, skipNullField, keyType);
                        keyEncoder = (clo_2);
                        return (value_17) => seq(map_4((_arg_1) => {
                            const activePatternResult_1 = _arg_1;
                            return [keyEncoder(activePatternResult_1[0]), valueEncoder(activePatternResult_1[1])];
                        }, value_17));
                    }
                }
                else {
                    return autoEncodeRecordsAndUnions(extra, caseStrategy, skipNullField, t);
                }
            }
        }
        else if (fullname === "System.Boolean") {
            return (value_18) => value_18;
        }
        else if (fullname === "Microsoft.FSharp.Core.Unit") {
            return unit;
        }
        else if (fullname === "System.String") {
            return (value_20) => value_20;
        }
        else if (fullname === "System.Char") {
            return (value_22) => value_22;
        }
        else if (fullname === "System.SByte") {
            return (value_24) => value_24;
        }
        else if (fullname === "System.Byte") {
            return (value_26) => value_26;
        }
        else if (fullname === "System.Int16") {
            return (value_28) => value_28;
        }
        else if (fullname === "System.UInt16") {
            return (value_30) => value_30;
        }
        else if (fullname === "System.Int32") {
            return (value_32) => value_32;
        }
        else if (fullname === "System.UInt32") {
            return (value_34) => value_34;
        }
        else if (fullname === "System.Double") {
            return (value_36) => value_36;
        }
        else if (fullname === "System.Single") {
            return (value_38) => value_38;
        }
        else if (fullname === "System.DateTime") {
            return datetime;
        }
        else if (fullname === "System.DateTimeOffset") {
            return datetimeOffset;
        }
        else if (fullname === "System.TimeSpan") {
            return timespan;
        }
        else if (fullname === "System.Guid") {
            return guid;
        }
        else if (fullname === "System.Object") {
            return (x_1) => x_1;
        }
        else {
            return autoEncodeRecordsAndUnions(extra, caseStrategy, skipNullField, t);
        }
    }
    else {
        const encoderRef = matchValue;
        return (v) => encoderRef.contents(v);
    }
}

function makeExtra(extra) {
    if (extra != null) {
        return map_5((_arg, tupledArg) => (new FSharpRef(tupledArg[0])), extra.Coders);
    }
    else {
        return empty({
            Compare: comparePrimitives,
        });
    }
}

export class Auto {
    constructor() {
    }
}

export function Auto$reflection() {
    return class_type("Thoth.Json.Encode.Auto", void 0, Auto);
}

export function Auto_generateBoxedEncoderCached_437914C6(t, caseStrategy, extra, skipNullField) {
    let y_1, y;
    const caseStrategy_1 = defaultArg(caseStrategy, new CaseStrategy(0, []));
    const skipNullField_1 = defaultArg(skipNullField, true);
    return Util_Cache$1__GetOrAdd_43981464(Util_CachedEncoders, (y_1 = ((y = fullName_1(t), toString_5(caseStrategy_1) + y)), defaultArg(map_2((e) => e.Hash, extra), "") + y_1), () => autoEncoder(makeExtra(extra), caseStrategy_1, skipNullField_1, t));
}

export function Auto_generateBoxedEncoder_437914C6(t, caseStrategy, extra, skipNullField) {
    const caseStrategy_1 = defaultArg(caseStrategy, new CaseStrategy(0, []));
    const skipNullField_1 = defaultArg(skipNullField, true);
    return autoEncoder(makeExtra(extra), caseStrategy_1, skipNullField_1, t);
}

export function encode(space, value) {
    return toString(space, value);
}

