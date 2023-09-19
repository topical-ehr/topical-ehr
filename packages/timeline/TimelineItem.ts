import { DateTime } from "luxon";

import * as FHIR from "@topical-ehr/fhir-types";

export interface TimelineItem {
    dateTime: DateTime;
    dateTimeString: string;
    id: string;
    item:
        | {
              type: "observation-group";
              title: string;
              titleFull: string;
              observations: FHIR.Observation[];
          }
        | {
              type: "observation";
              observation: FHIR.Observation;
          }
        | {
              type: "medication-administration";
              meds: FHIR.MedicationAdministration[];
          }
        | {
              type: "progress-note";
              document: FHIR.Composition;
          };
}
