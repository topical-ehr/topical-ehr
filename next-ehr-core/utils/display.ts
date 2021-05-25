import { HumanName, Patient } from "./FhirTypes";

/**
 * @returns a text representation of a patient's name
 * 
 * Picks, in order, the usual name, the official name, and then the first name.
 * Also adds a nickname.
 * 
 * WARNING: Other names are ignored - may want to highlight in the UI if there are several.
 */
export function PatientName(patient: Patient) {

    function display(name: HumanName) {
        if (name.text) {
            return name.text.trim();
        } else {
            return `${(name.family ?? "").toUpperCase()}, ${name.given ?? ""}`.trim();
        }
    }

    const names = patient.name ?? [];

    function getOne() {

        const candidates = [
            names.find(n => n.use === "official"),
            names.find(n => n.use === "usual"),
            names[0],
        ];

        for (const candidate of candidates) {
            if (candidate) {
                return candidate;
            }
        }
    }

    const name = getOne();
    if (!name) {
        return "(NO NAME)";
    } else {
        const nickname = names.find(n => n.use === "nickname");
        if (nickname && name.use != "nickname") {
            return `${display(name)} (${display(nickname)})}`;
        } else {
            return display(name);
        }
    }
}

/**
 * @returns date of birth
 */
export function PatientDOB(patient: Patient) {
    return patient.birthDate;
}