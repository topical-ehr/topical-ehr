import { FhirEditor } from "@topical-ehr/fhir-editor/FhirEditor";
import { useFhirServerConfig } from "@topical-ehr/fhir-store/fhir-server";

export function FhirEditorPage() {
    const config = useFhirServerConfig();
    return (
        <div>
            <FhirEditor config={config} />
        </div>
    );
}
