import * as R from "remeda";
import * as FHIR from "./FhirTypes";
import { FhirResourceById } from "../redux/FhirState";

export interface Topic {
  id: string;
  composition: FHIR.Composition | null;
  conditions: FHIR.Condition[];
  prescriptions: FHIR.MedicationRequest[];
}

export interface TopicGroup {
  id: string;
  title: string;
  topics: Topic[];
  collapsedByDefault: boolean;
}

function conditionsFromComposition(
  c: FHIR.Composition,
  conditions: FhirResourceById<FHIR.Condition>
) {
  const _conditions = (c.section ?? [])
    .flatMap((section) => section.entry)
    .map(
      (ref) => conditions[FHIR.parseRef(ref?.reference, "Condition")?.id ?? ""]
    )
    .filter((c) => c);
  return _conditions;
}
function prescriptionsFromComposition(
  c: FHIR.Composition,
  prescriptions: FhirResourceById<FHIR.MedicationRequest>
) {
  const _resources = (c.section ?? [])
    .flatMap((section) => section.entry)
    .map(
      (ref) =>
        prescriptions[
          FHIR.parseRef(ref?.reference, "MedicationRequest")?.id ?? ""
        ]
    )
    .filter((c) => c);
  return _resources;
}

export function groupTopics(
  conditions: FhirResourceById<FHIR.Condition>,
  compositions: FhirResourceById<FHIR.Composition>,
  prescriptions: FhirResourceById<FHIR.MedicationRequest>
): TopicGroup[] {
  const fromCompositions: TopicGroup = {
    id: "compositions",
    title: "",
    collapsedByDefault: false,
    topics: Object.values(compositions).map((c) => ({
      id: c.id,
      composition: c,
      conditions: conditionsFromComposition(c, conditions),
      prescriptions: prescriptionsFromComposition(c, prescriptions),
    })),
  };

  const conditionsInTopics = new Set(
    fromCompositions.topics.flatMap((t) => t.conditions).map((c) => c.id)
  );

  const conditionsWithoutTopics = Object.values(conditions).filter(
    (c) => !conditionsInTopics.has(c.id)
  );

  const [active, inactive] = R.partition(
    conditionsWithoutTopics,
    (c) => c.clinicalStatus?.coding?.[0]?.code === "active"
  ).map((conditions) =>
    // create topic for each condition
    conditions.map((c) => ({
      id: c.id,
      conditions: [c],
      prescriptions: [],
      composition: null,
    }))
  );

  console.log("groupTopics", {
    conditions,
    compositions,
    conditionsWithoutTopics,
    active,
    inactive,
  });

  const activeConditions: TopicGroup = {
    id: "active-conditions",
    title: "",
    collapsedByDefault: false,
    topics: active,
  };
  const inactiveConditions: TopicGroup = {
    id: "inactive-conditions",
    title: "Inactive",
    collapsedByDefault: true,
    topics: inactive,
  };

  return [fromCompositions, activeConditions, inactiveConditions];
}
