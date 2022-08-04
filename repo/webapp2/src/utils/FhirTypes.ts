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
    request?: {
      method: string;
      url: string;
    };
    response?: {
      status: string;
      location?: string;
      etag?: string;
      lastModified?: string;
      outcome?: Resource;
    };
    search?: {
      mode: "match" | "include";
    };
  }[];
}
export function isBundle(r: Resource): r is Bundle<Resource> {
  return r.resourceType === "Bundle";
}
export const Bundle = {
  newTransaction(entries: Bundle<Resource>["entry"]) {
    const bundle: Bundle<Resource> = {
      resourceType: "Bundle",
      type: "transaction",
      id: newUuidId(),
      meta: {
        lastUpdated: new Date().toISOString(),
      },
      link: [],
      entry: entries,
    };
    return bundle;
  },
};

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

function newUuidId() {
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

export interface Timing {
  // R4
  // https://www.hl7.org/fhir/datatypes-examples.html#Timing
  event?: FhirDateTime[];
  code?: CodeableConcept; // BID | TID | QID | AM | PM | QD | QOD | + (https://www.hl7.org/fhir/valueset-timing-abbreviation.html preferred)
  repeat?: {
    boundsDuration?: Quantity;
    boundsRange?: {}; // TODO
    boundsPeriod?: Period;
    count?: number; // Number of times to repeat
    countMax?: number; // Maximum number of times to repeat
    duration?: number; // How long when it happens
    durationMax?: number; // How long when it happens (Max)
    durationUnit?: string; // s | min | h | d | wk | mo | a - unit of time (UCUM)
    frequency?: number; // Event occurs frequency times per period
    frequencyMax?: number; // Event occurs up to frequencyMax times per period
    period?: number; // Event occurs frequency times per period
    periodMax?: number; // Upper limit of period (3-4 hours)
    periodUnit?: string; // s | min | h | d | wk | mo | a - unit of time (UCUM)
    dayOfWeek?: [string]; // mon | tue | wed | thu | fri | sat | sun
    timeOfDay?: [string]; // Time of day for action
    when?: [string]; // Code for time period of occurrence
    offset?: number; // Minutes from event (before or after)
  };
}

export interface Quantity {
  value?: number;
  comparator?: string;
  unit?: string;
  system?: string;
  code?: string;
}

export interface Range {
  low: Quantity;
  high: Quantity;
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
  if (resource.id.startsWith("urn:uuid:")) {
    return { reference: resource.id, type: resource.resourceType };
  } else {
    return { reference: resource.resourceType + "/" + resource.id };
  }
}

function newMeta() {
  return {
    id: newUuidId(),
    meta: { lastUpdated: new Date().toISOString() },
  };
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
  resourceType: "DiagnosticReport";
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
    code: CodeableConcept;
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
  resourceType: "Composition";
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
  text?: {
    status: "generated" | "extensions" | "additional" | "empty";
    div: string;
  };
  entry?: Reference[];
  section?: CompositionSection[];
  author?: Reference[];
}

export const Composition = {
  new(
    props: Pick<
      Composition,
      "subject" | "status" | "type" | "date" | "title" | "section"
    >
  ): Composition {
    return {
      resourceType: "Composition",
      ...newMeta(),
      ...props,
    };
  },
  setHTML(html: string, c: Composition): Composition {
    const sections = c.section ?? [];
    const newSections: CompositionSection[] = [
      {
        ...sections[0],
        text: {
          status: "additional",
          div: `<div>${html}</div>`,
        },
      },
      ...sections.slice(1),
    ];
    return { ...c, section: newSections };
  },
  setEntries(newEntries: Reference[], c: Composition): Composition {
    const sections = c.section ?? [];
    const newSections = [
      { ...sections[0], entry: newEntries },
      ...sections.slice(1),
    ];
    return { ...c, section: newSections };
  },
  addEntry(newEntry: Reference, c: Composition): Composition {
    const entries = c.section?.[0]?.entry ?? [];
    const newEntries = [...entries, newEntry];
    return Composition.setEntries(newEntries, c);
  },
  removeEntry(entryToRemove: Reference, c: Composition): Composition {
    const entries = c.section?.[0]?.entry ?? [];
    const newEntries = entries.filter(
      (e) => e.reference !== entryToRemove.reference
    );
    return Composition.setEntries(newEntries, c);
  },
};

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
export const Condition = {
  new({ subject }: { subject: Reference }): Condition {
    return {
      resourceType: "Condition",
      ...newMeta(),
      subject,
    };
  },
};

export interface ValueSet extends Resource {
  expansion: {
    contains: [
      {
        system: string;
        code: string;
        display: string;
        designation?: [
          {
            value: string;
            language?: string;
            use?: {
              system?: string;
              code?: string;
              version?: string;
              display?: string;
              userSelected?: boolean;
            };
          }
        ];
      }
    ];
  };
}

export interface MedicationRequest extends Resource {
  resourceType: "MedicationRequest";

  status:
    | "active"
    | "on-hold"
    | "cancelled"
    | "completed"
    | "entered-in-error"
    | "stopped"
    | "draft"
    | "unknown";
  intent:
    | "proposal"
    | "plan"
    | "order"
    | "original-order"
    | "reflex-order"
    | "filler-order"
    | "instance-order"
    | "option";

  medicationCodeableConcept?: CodeableConcept;
  medicationReference?: Reference;
  reasonCode?: Reference[];
  supportingInformation?: Reference[];

  subject: Reference;
  encounter?: Reference;
  requester?: Reference;

  note?: Annotation[];

  dosageInstruction?: {
    sequence?: number;
    text?: string;
    additionalInstruction?: CodeableConcept[];
    patientInstruction?: string;
    timing?: Timing;

    site?: CodeableConcept;
    route?: CodeableConcept;
    method?: CodeableConcept;

    doseAndRate?: {
      type?: CodeableConcept; // calculated, ordered, etc

      doseRange?: Range;
      doseQuantity?: Quantity;

      // rate[x]: Amount of medication per unit of time. One of these 3:
      rateRatio?: Ratio;
      rateRange?: Range;
      rateQuantity?: Quantity;
    }[];
  }[];
}
export const MedicationRequest = {
  new({
    subject,
    status,
    intent,
  }: {
    subject: Reference;
    status: MedicationRequest["status"];
    intent: MedicationRequest["intent"];
  }): MedicationRequest {
    return {
      resourceType: "MedicationRequest",
      ...newMeta(),
      subject,
      status,
      intent,
    };
  },
};

export interface ServiceRequest extends Resource {
  resourceType: "ServiceRequest";

  status:
    | "draft"
    | "active"
    | "on-hold"
    | "revoked"
    | "completed"
    | "entered-in-error"
    | "unknown";
  intent:
    | "proposal"
    | "plan"
    | "directive"
    | "order"
    | "original-order"
    | "reflex-order"
    | "filler-order"
    | "instance-order"
    | "option";

  category?: CodeableConcept;
  code?: CodeableConcept;

  subject: Reference;
  encounter?: Reference;
  requester?: Reference;

  supportingInfo?: Reference[];
  reasonCode?: Reference[];
  note?: Annotation[];
}
export const ServiceRequest = {
  new({
    subject,
    status,
    intent,
  }: {
    subject: Reference;
    status: ServiceRequest["status"];
    intent: ServiceRequest["intent"];
  }): ServiceRequest {
    return {
      resourceType: "ServiceRequest",
      ...newMeta(),
      subject,
      status,
      intent,
    };
  },
};
