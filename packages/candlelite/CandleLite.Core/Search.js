import { tryFind as tryFind_1, empty, singleton, append, exists } from "../fable_modules/fable-library.4.0.0-theta-018/List.js";
import { IndexConditions_systemEqual, IndexConditions_valueEqual, IndexConditions__type } from "./SQL.js";
import { OperationOutcomeCodes, OperationOutcomeException, OperationOutcomeSeverity, operationOutcome } from "./Types.js";
import { printf, toText, split } from "../fable_modules/fable-library.4.0.0-theta-018/String.js";
import { equalsWith } from "../fable_modules/fable-library.4.0.0-theta-018/Array.js";
import { defaultOf } from "../fable_modules/fable-library.4.0.0-theta-018/Util.js";
import { tryFind } from "../fable_modules/fable-library.4.0.0-theta-018/Map.js";
import { singleton as singleton_1, collect, delay, toList } from "../fable_modules/fable-library.4.0.0-theta-018/Seq.js";

export function Helpers_addTypeClauseIfNeeded(_type, conditions) {
    const typeDot = _type + ".";
    if (exists((clause) => exists((col) => {
        const matchValue_1 = col.Condition;
        let matchResult, name;
        if (col.Column === "name") {
            if (matchValue_1.tag === 0) {
                if (matchValue_1.fields[0].tag === 0) {
                    matchResult = 0;
                    name = matchValue_1.fields[0].fields[0];
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
                return name.indexOf(typeDot) === 0;
            }
            case 1: {
                return false;
            }
        }
    }, clause), conditions)) {
        return conditions;
    }
    else {
        return append(conditions, singleton(IndexConditions__type(_type)));
    }
}

export function raiseOO(httpStatus, code, msg) {
    throw new OperationOutcomeException(httpStatus, operationOutcome(new OperationOutcomeSeverity(1, []), code, msg));
}

export function conditionsForParam(resourceType, paramType, p) {
    switch (paramType.tag) {
        case 2: {
            return IndexConditions_valueEqual(resourceType)(p.Name)(p.Value);
        }
        case 4: {
            return IndexConditions_valueEqual(resourceType)(p.Name)(p.Value.toLocaleLowerCase());
        }
        case 6: {
            const matchValue = split(p.Value, ["|"], null, 0);
            if ((!equalsWith((x, y) => (x === y), matchValue, defaultOf())) && (matchValue.length === 1)) {
                const code = matchValue[0];
                return IndexConditions_valueEqual(resourceType)(p.Name)(code);
            }
            else if ((!equalsWith((x_1, y_1) => (x_1 === y_1), matchValue, defaultOf())) && (matchValue.length === 2)) {
                const system = matchValue[0];
                const code_1 = matchValue[1];
                const systemCond = IndexConditions_systemEqual(resourceType)(p.Name)(system);
                return append((code_1.length > 0) ? IndexConditions_valueEqual(resourceType)(p.Name)(code_1) : empty(), systemCond);
            }
            else {
                return raiseOO(400, new OperationOutcomeCodes(2, []), toText(printf("invalid token parameter for %s/%s"))(resourceType)(p.Name));
            }
        }
        default: {
            return raiseOO(404, new OperationOutcomeCodes(4, []), toText(printf("search parameter type %A not supported (%s/%s)"))(paramType)(resourceType)(p.Name));
        }
    }
}

export function conditionsFromUrl(paramsMap, _type, parameters) {
    let paramsForType;
    const matchValue = tryFind(_type, paramsMap);
    paramsForType = ((matchValue == null) ? empty() : matchValue);
    return Helpers_addTypeClauseIfNeeded(_type, toList(delay(() => collect((p) => {
        let matchValue_1;
        return singleton_1(conditionsForParam(_type, ((matchValue_1 = tryFind_1((tupledArg) => (tupledArg[0] === p.Name), paramsForType), (matchValue_1 == null) ? raiseOO(404, new OperationOutcomeCodes(4, []), toText(printf("search parameter not supported (%s/%s)"))(_type)(p.Name)) : matchValue_1[1])).Type, p));
    }, parameters))));
}

