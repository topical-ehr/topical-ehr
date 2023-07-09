import { OperationOutcomeException, OperationOutcomeSeverity, operationOutcome } from "./CandleLite.Core/Types.js";

export function isArray(x) {
    return Array.isArray(x);
}

export function raiseOO(httpStatus, code, msg) {
    throw new OperationOutcomeException(httpStatus, operationOutcome(new OperationOutcomeSeverity(1, []), code, msg));
}

