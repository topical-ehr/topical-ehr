import { CodeableConcept, Observation, Quantity } from "../FhirTypes";
import { DateTime } from "luxon";

export class ObservationFormatter {
  constructor(public ob: Observation) {}

  get dateString() {
    return this.ob.effectiveDateTime ?? this.ob.effectiveInstant;
  }
  get date() {
    const str = this.dateString;
    if (!str) return null;

    return DateTime.fromISO(str);
  }

  get codeFull() {
    return (
      (this.ob.code.text ??
        (this.ob.code.coding || [])
          .map((c) => c.display ?? c.code)
          .join(", ")) +
      "\n\n" +
      (this.ob.code.coding || []).map((c) => c.system + " " + c.code).join(", ")
    );
  }
  get code() {
    // remove everything after "["
    return this.codeFull.split("\n")[0].split("[", 2)[0];
  }

  get value() {
    const ob = this.ob;
    return (
      ob.valueString ??
      ob.valueInteger?.toExponential.toString() ??
      ob.valueBoolean?.toString() ??
      formatQuantity(ob.valueQuantity) ??
      formatCodeableConcept(ob.valueCodeableConcept)
    );
  }

  get units() {
    const val = this.ob.valueQuantity;
    return val?.unit ?? val?.code;
  }
}

function formatQuantity(val?: Quantity): string | null {
  if (!val) {
    return null;
  }

  return `${val.comparator || ""}${val.comparator ? " " : ""}${
    val.value?.toFixed(1) ?? "???"
  }`;
}

function formatCodeableConcept(val?: CodeableConcept): string | null {
  if (!val) {
    return null;
  }
  if (val.text) {
    return val.text;
  }

  if (val.coding && val.coding.length > 0) {
    return val.coding.map((c) => c.display ?? c.code).join(", ");
  }

  console.warn("Cannot disable CodeableConcept", val);
  return "???";
}
