import * as FHIR from "@topical-ehr/fhir-types";

export interface TimelineItem {
    dateTime: string;
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
          };
}
