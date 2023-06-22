import * as FHIR from "@topical-ehr/fhir-types";
import { PatientFormatter } from "./PatientFormatter";
import { ObservationFormatter } from "./observation/ObservationFormatter";

export const defaultFormattingContext = {
    observation(r: FHIR.Observation) {
        return new ObservationFormatter(r);
    },
    patient(r: FHIR.Patient) {
        return new PatientFormatter(r);
    },
};

export const FormattingContext = React.createContext(defaultFormattingContext);

export function useFormatting() {
    return React.useContext(FormattingContext);
}
