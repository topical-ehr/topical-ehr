import { DateTime } from "luxon";
import { CodeableConcept, Observation, Quantity } from "../FhirTypes";

import shorthandData from "./ObservationShorthand.csv";

interface RawRow {
  full: string;
  short: string;
}
const shorthand = new Map<string, string>();
for (const _row of shorthandData) {
  const row = _row as RawRow;
  shorthand.set(row.full.trim(), row.short.trim());
}

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
    const code = this.codeFull.split("\n")[0].split("[", 2)[0];
    return shorthand.get(code.trim()) ?? code;
  }

  get value() {
    const ob = this.ob;

    if (ob.code.coding?.[0].code == "55284-4") {
      // blood pressure
      let systolic: number | undefined;
      let diastolic: number | undefined;

      for (const component of ob.component ?? []) {
        if (component.code.coding?.[0].code == "8480-6") {
          systolic = component.valueQuantity?.value;
        }
        if (component.code.coding?.[0].code == "8462-4") {
          diastolic = component.valueQuantity?.value;
        }
      }

      if (systolic && diastolic) {
        return `${Math.round(systolic)}/${Math.round(diastolic)}`;
      }
    }

    return (
      ob.valueString ??
      ob.valueInteger?.toExponential.toString() ??
      ob.valueBoolean?.toString() ??
      formatQuantity(ob.valueQuantity) ??
      formatCodeableConcept(ob.valueCodeableConcept)
    );
  }

  get units() {
    if (this.ob.code.coding?.[0].code == "55284-4") {
      // blood pressure
      return "mmHg";
    }

    const val = this.ob.valueQuantity;
    const val2 = val?.unit ?? val?.code;
    return val2?.replace("{score}", "");
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
