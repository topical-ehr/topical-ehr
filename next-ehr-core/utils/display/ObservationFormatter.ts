import { CodeableConcept, Observation, Quantity } from "../FhirTypes";

export class ObservationFormatter {
  constructor(public ob: Observation) {}

  get date() {
    return this.ob.effectiveDateTime ?? this.ob.effectiveInstant;
  }

  get code() {
    return (
      this.ob.code.text ??
      (this.ob.code.coding || []).map((c) => c.display ?? c.code).join(", ")
    );
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
}

function formatQuantity(val?: Quantity): string | null {
  if (!val) {
    return null;
  }

  return `${val.comparator || ""}${val.comparator ? " " : ""}${
    val.value?.toFixed(1) ?? "???"
  } ${val.unit ?? val.code}`;
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
