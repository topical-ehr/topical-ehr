import * as FHIR from "./FhirTypes";
import { FhirResourceById } from "../redux/FhirState";
import { addToMappedList } from "./collections";
import { applyShorthand } from "./display/ObservationShorthand";

interface DisplayItem {
  dateTime: string;
  id: string;
  item:
    | {
        type: "group";
        title: string;
        titleFull: string;
        observations: FHIR.Observation[];
      }
    | {
        type: "single";
        observation: FHIR.Observation;
      };
}

export function groupObservations(
  reports: FhirResourceById<FHIR.DiagnosticReport>,
  observations: FhirResourceById<FHIR.Observation>
) {
  const items: DisplayItem[] = [];
  const groupedObservationIds = new Set<string>();
  const observationsByCode = new Map<string, FHIR.Observation[]>();

  function observationByReference(reference: FHIR.Reference): FHIR.Observation {
    const id = FHIR.parseRef(reference.reference)?.id;
    if (!id) {
      throw new Error(`unable to parse reference ${reference}`);
    }
    const ob = observations[id];
    if (!ob) {
      throw new Error(`unable to find Observation for reference ${reference}`);
    }
    return ob;
  }

  for (const report of Object.values(reports)) {
    const title = report.code.text?.replace(/\(.*/, ""); // trim everything after a '('
    if (title && report.result?.length && report.effectiveDateTime) {
      const observations = report.result.map(observationByReference);

      items.push({
        id: "DiagnosticReport/" + report.id,
        dateTime: report.effectiveDateTime,
        item: {
          type: "group",
          title: applyShorthand(title),
          titleFull: report.code.text ?? title,
          observations,
        },
      });

      observations.forEach((ob) => groupedObservationIds.add(ob.id));
    } else {
      console.warn("invalid report", { report });
    }
  }

  for (const ob of Object.values(observations)) {
    for (const code of ob.code.coding ?? []) {
      const obKey = code.system + "|" + code.code;

      addToMappedList(observationsByCode, obKey, ob);

      if (!groupedObservationIds.has(ob.id)) {
        if (!ob.effectiveDateTime) {
          console.warn("Observation without date", { ob });
          continue;
        }
        items.push({
          id: "Observation/" + ob.id,
          dateTime: ob.effectiveDateTime,
          item: {
            type: "single",
            observation: ob,
          },
        });
      }
    }
  }

  items.sort((a, b) => b.dateTime.localeCompare(a.dateTime));

  return { items, observationsByCode };
}
