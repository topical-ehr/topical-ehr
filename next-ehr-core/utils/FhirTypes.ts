
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
    start?: string;
    end?: string;
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


export interface Patient {
    resourceType: "Patient";
    id: string;
    meta: {
        lastUpdated: string;
        versionId?: string;
    };
    text?: {
        status: string;
        div: string;
    };
    identifier?: Identifier[];
    active?: boolean;
    name?: HumanName[];
    telecom?: ContactPoint[];
    gender?: "male" | "female" | "other" | "unknown";
    birthDate?: string;
    deceasedBoolean?: boolean;
    deceasedDateTime?: string;
}