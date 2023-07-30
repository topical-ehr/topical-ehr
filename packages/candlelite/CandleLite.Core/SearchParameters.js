import { reference, codeableConcept, humanName, indexStrings, indexAddress, contactPoints, indexTrueOrDateExists, indexDateTime, indexString, indexBool, identifier, indexId } from "./Indexes.js";
import { ofArray, singleton } from "../fable_modules/fable-library.4.0.0-theta-018/List.js";
import { ofList } from "../fable_modules/fable-library.4.0.0-theta-018/Map.js";
import { comparePrimitives } from "../fable_modules/fable-library.4.0.0-theta-018/Util.js";

export const parameters = ofArray([["ALL", singleton(indexId)], ["Patient", ofArray([identifier, ["active", indexBool(singleton("active"))], ["birthdate", indexString(singleton("birthDate"))], ["gender", indexString(singleton("gender"))], ["death-date", indexDateTime(singleton("deceasedDateTime"))], ["deceased", indexTrueOrDateExists("deceased")], ["email", contactPoints(singleton("telecom"), "email")], ["phone", contactPoints(singleton("telecom"), "phone")], ["telecom", contactPoints(singleton("telecom"), void 0)], ["address", indexAddress(singleton("address"))], ["given", indexStrings(ofArray(["name", "given"]))], ["family", indexStrings(ofArray(["name", "family"]))], ["name", humanName(singleton("name"))]])], ["Composition", ofArray([identifier, ["type", codeableConcept("type")], ["category", codeableConcept("category")], ["status", indexString(singleton("status"))], reference("encounter"), reference("subject")])], ["Condition", ofArray([identifier, ["code", codeableConcept("code")], ["category", codeableConcept("category")], ["verification-status", codeableConcept("verificationStatus")], ["clinical-status", codeableConcept("clinicalStatus")], reference("encounter"), reference("subject")])], ["DiagnosticReport", ofArray([identifier, ["code", codeableConcept("code")], ["category", codeableConcept("category")], ["status", indexString(singleton("status"))], reference("encounter"), reference("subject")])], ["MedicationAdministration", ofArray([identifier, ["category", codeableConcept("category")], ["status", indexString(singleton("status"))], reference("encounter"), reference("subject")])], ["MedicationRequest", ofArray([identifier, ["category", codeableConcept("category")], ["status", indexString(singleton("status"))], reference("encounter"), reference("subject")])], ["Observation", ofArray([identifier, ["code", codeableConcept("code")], reference("encounter"), reference("subject")])], ["Organization", ofArray([identifier, ["active", indexBool(singleton("active"))]])], ["ServiceRequest", ofArray([identifier, ["code", codeableConcept("code")], ["category", codeableConcept("category")], reference("encounter"), reference("subject")])]]);

export const defaultParametersMap = ofList(parameters, {
    Compare: comparePrimitives,
});

