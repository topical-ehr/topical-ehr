import * as R from "remeda";
import * as FHIR from "./FhirTypes";
import { FhirResourceById } from "../redux/FhirState";

export interface Topic {
  id: string;
  composition: FHIR.Composition | null;
  conditions: FHIR.Condition[];
}

export interface TopicGroup {
  id: string;
  title: string;
  topics: Topic[];
  collapsedByDefault: boolean;
}

export function conditionsFromComposition(
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

export function groupTopics(
  conditions: FhirResourceById<FHIR.Condition>,
  compositions: FhirResourceById<FHIR.Composition>
): TopicGroup[] {
  const fromCompositions: TopicGroup = {
    id: "compositions",
    title: "",
    collapsedByDefault: false,
    topics: Object.values(compositions).map((c) => ({
      id: c.id,
      composition: c,
      conditions: conditionsFromComposition(c, conditions),
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
    conditions.map((c) => ({ id: c.id, conditions: [c], composition: null }))
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
