import * as FHIR from "@topical-ehr/fhir-types";

export class CodeFormatter {
    constructor(public code: FHIR.CodeableConcept) {}

    get text() {
        const { text, coding } = this.code;

        if (text) {
            return text;
        }

        if (coding) {
            for (const coded of coding) {
                const { display, code } = coded;
                if (display) {
                    return display;
                }
                if (code) {
                    return code;
                }
            }
        }

        return `ERROR: code with no text: ${JSON.stringify(this.code)}`;
    }

    get shortText() {
        return this.text.replace(/\((finding|disorder)\)/, "");
    }
}
