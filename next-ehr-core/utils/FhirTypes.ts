
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

    entry: {
        fullUrl: string;
        resource: TResource;
        search: {
            mode: "match" | "include";
        };
    }[];
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

interface CodeableConcept {
    coding?: Coding[];
    text?: string;
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

interface Quantity {
    value?: number;
    comparator?: string;
    unit?: string;
    system?: string;
    code?: string;
}

interface Ratio {
    numerator: Quantity;
    denominator: Quantity;
}

interface SampledData {
    // TODO
}

interface Reference {
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
    use?: "usual" | "official" | "temp" | "nickname" | "anonymous" | "old" | "maiden";
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

interface Resource {
    id: string;
    meta: {
        lastUpdated: string;
        versionId?: string;
    };
    text?: {
        status: string;
        div: string;
    };
}

export interface Patient extends Resource {
    resourceType: "Patient";
    identifier?: Identifier[];
    active?: boolean;
    name?: HumanName[];
    telecom?: ContactPoint[];
    gender?: "male" | "female" | "other" | "unknown";
    birthDate?: string;
    deceasedBoolean?: boolean;
    deceasedDateTime?: string;
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
};

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