import * as FHIR from "../../utils/FhirTypes";
import css from "./ConditionAdd.module.scss";
import AsyncSelect, { useAsync } from "react-select/async";
import { OptionsOrGroups } from "react-select";

interface Props {}

export function ConditionAdd(props: Props) {
    async function loadOptions(input: string) {
        if (input.length < 4) {
            return [];
        }
        const codeSystemUrl = "http://snomed.info/sct?fhir_vs=isa/138875005";
        const serverBaseUrl = "https://r4.ontoserver.csiro.au/fhir/";
        const options = "_format=json&count=10&includeDesignations=false";
        const filter = encodeURIComponent(input);
        const url = `${serverBaseUrl}ValueSet/$expand?filter=${filter}&url=${codeSystemUrl}&${options}`;

        const resp = await fetch(url);
        const json: FHIR.ValueSet = await resp.json();

        return json.expansion.contains.map((info) => ({
            ...info,
            value: info.code,
            label: info.display,
        }));
    }

    function onChange() {}

    return (
        <div className={css.conditionAdd}>
            <AsyncSelect
                loadOptions={loadOptions}
                onChange={(newValue, actionMeta) => onChange()}
                getOptionLabel={(val) => val.display}
                getOptionValue={(val) => val.code}
            />
        </div>
    );
}
