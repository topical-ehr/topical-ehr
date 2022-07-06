import { v4 as uuidv4 } from "uuid";

export interface Bundle<TResource> {
  resourceType: "Bundle";
  id: string;
  meta: {
    lastUpdated: string;
  };
  type: string;
  total?: number;

  link: {
    relation: "self" | "next" | "previous";
    url: string;
  }[];

  entry?: {
    fullUrl: string;
    resource: TResource;
    search: {
      mode: "match" | "include";
    };
  }[];
}
export function isBundle(r: Resource): r is Bundle<Resource> {
  return r.resourceType === "Bundle";
}

export function parseRef(
  ref: string | null | undefined,
  resourceType?: string
) {
  if (!ref) {
    return null;
  }
  if (resourceType) {
    if (ref.startsWith(resourceType) && ref[resourceType.length] === "/") {
      return { resourceType, id: ref.substring(resourceType.length + 1) };
    } else {
      // not of the required type
      return null;
    }
  } else {
    const s = ref.split("/");
    return { resourceType: s[0], id: s[1] };
  }
}

export function newId() {
  return `urn:uuid:${uuidv4()}`;
}

type Markdown = string;
type FhirDateTime = string;
type FhirTime = string;

interface Annotation {
  authorReference?: Reference;
  authorString?: string;
  text: Markdown;
  time: FhirDateTime;
}

interface Coding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}
export function areOverlapping(cc1: CodeableConcept, cc2: CodeableConcept) {
  const c1 = cc1.coding;
  const c2 = cc2.coding;
  if (!c1 || !c2) {
    return false;
  }
  return c1.some(({ code, system }) =>
    c2.some(
      ({ code: code2, system: system2 }) => code === code2 && system === system2
    )
  );
}

interface Period {
  start?: FhirDateTime;
  end?: FhirDateTime;
}

interface Timing {
  event?: FhirDateTime[];
  // TODO: repeat
  code: CodeableConcept;
}

export interface Quantity {
  value?: number;
  comparator?: string;
  unit?: string;
  system?: string;
  code?: string;
}

export interface Ratio {
  numerator: Quantity;
  denominator: Quantity;
}

export interface SampledData {
  // TODO
}

export interface Reference {
  reference?: string;
  type?: string;
  identifier?: Identifier;
  display?: string;
}

interface Identifier {
  use?: "usual" | "official" | "temp" | "secondary" | "old";
  type?: CodeableConcept;
  system?: string;
  value?: string;
  period?: Period;
}

export interface HumanName {
  use?:
    | "usual"
    | "official"
    | "temp"
    | "nickname"
    | "anonymous"
    | "old"
    | "maiden";
  text?: string;
  family?: string;
  given?: string;
  prefix?: string;
  suffix?: string;
  period?: Period;
}

interface ContactPoint {
  use?: "home" | "work" | "temp" | "old" | "mobile";
  system?: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
  value?: string;
  rank?: number;
  period?: Period;
}

interface Attachment {
  contentType?: string;
  language?: string;
  data?: string;
  url?: string;
  size?: number;
  hash?: string;
  title?: string;
  creation?: FhirDateTime;
}

type FhirId = string;

export interface Resource {
  id: FhirId;
  resourceType: string;
  meta: {
    lastUpdated: string;
    versionId?: string;
  };
  text?: {
    status: string;
    div: string;
  };
}
export function referenceTo(resource: Resource) {
  return { reference: resource.resourceType + "/" + resource.id };
}

interface Address {
  use?: "home" | "work" | "temp" | "old" | "billing";
  type?: "postal" | "physical" | "both";
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: Period;
}

export interface Patient extends Resource {
  resourceType: "Patient";
  identifier?: Identifier[];
  active?: boolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  address?: Address[];
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  deceasedBoolean?: boolean;
  deceasedDateTime?: string;
}

export interface DiagnosticReport extends Resource {
  status: string;
  code: CodeableConcept;
  category?: CodeableConcept[];
  identifier?: Identifier[];
  basedOn?: Reference[];

  effectiveDateTime?: FhirDateTime;
  issued?: FhirDateTime;

  subject?: Reference;
  encounter?: Reference;
  performer?: Reference;

  result?: Reference[];
  imagingStudy?: Reference[];
  media?: {
    link: Reference;
    comment?: string;
  }[];
  conclusion?: string;
  conclusionCode?: CodeableConcept[];
  presentedForm?: Attachment[];
}

export interface Observation extends Resource, ObservationValue {
  resourceType: "Observation";
  status: string;
  code: CodeableConcept;
  category?: CodeableConcept[];
  bodySite?: CodeableConcept[];
  method?: CodeableConcept[];

  subject?: Reference;
  encounter?: Reference;
  focus?: Reference[];
  performer?: Reference[];

  issued?: FhirDateTime;
  effectiveDateTime?: FhirDateTime;
  effectiveInstant?: FhirDateTime;
  effectivePeriod?: Period;
  effectiveTiming?: Timing;

  interpretation?: CodeableConcept[];
  dataAbsentReason?: CodeableConcept[];
  note?: Annotation[];

  referenceRange?: ObservationReferenceRange;

  component?: ({
    code: string;
    referenceRange?: ObservationReferenceRange;
  } & ObservationValue)[];

  hasMember?: Reference[];
  derivedFrom?: Reference[];
}
interface ObservationReferenceRange {
  low?: Quantity;
  high?: Quantity;
  type?: CodeableConcept;
  appliesTo?: CodeableConcept;
  age?: {
    low: Quantity;
    high: Quantity;
  };
  text?: string;
}

interface ObservationValue {
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueRange?: Range;
  valueRatio?: Ratio;
  valueSampledData?: SampledData;
  valueTime?: FhirTime;
  valueDateTime?: FhirDateTime;
  valuePeriod?: Period;
}

export interface Composition extends Resource {
  status: "preliminary" | "final" | "amended" | "entered-in-error";
  type: CodeableConcept;
  category?: CodeableConcept[];
  subject: Reference;
  encounter?: Reference;
  author?: Reference[];
  date: FhirDateTime;

  title: string;
  section?: CompositionSection[];
}

interface CompositionSection {
  title?: string;
  code?: CodeableConcept;
  text?: string;
  entry?: Reference[];
  section?: CompositionSection[];
  author?: Reference[];
}

export interface Condition extends Resource {
  resourceType: "Condition";

  subject: Reference;
  encounter?: Reference;
  asserter?: Reference;
  recorder?: Reference;
  recordedDate?: FhirDateTime;

  onsetDateTime?: FhirDateTime;
  onsetAge?: Quantity;
  onsetPeriod?: Period;
  onsetRange?: Range;
  onsetString?: string;

  abatementDateTime?: FhirDateTime;
  abatementAge?: Quantity;
  abatementPeriod?: Period;
  abatementRange?: Range;
  abatementString?: string;

  note?: Annotation[];
  stage?: {
    summary?: CodeableConcept;
    type?: CodeableConcept;
    assessment?: Reference[];
  }[];
  evidence?: {
    code?: CodeableConcept[];
    detail?: Reference[];
  }[];

  code?: CodeableConcept;

  clinicalStatus?: CodeableConcept;
  // clinicalStatus?:
  //   | "active"
  //   | "recurrence"
  //   | "relapse"
  //   | "inactive"
  //   | "remission"
  //   | "resolved";

  verificationStatus?: CodeableConcept;
  // verificationStatus?:
  //   | "unconfirmed"
  //   | "provisional"
  //   | "differential"
  //   | "confirmed"
  //   | "refuted"
  //   | "entered-in-error";

  severity?: CodeableConcept;
  category?: CodeableConcept[];
  bodySite?: CodeableConcept[];
}

export interface ValueSet extends Resource {
  expansion: {
    contains: [
      {
        system: string;
        code: string;
        display: string;
        designation: [
          {
            language: string;
            value: string;
            use: {
              system: string;
              code: string;
            };
          }
        ];
      }
    ];
  };
}
