import { createApi } from "@reduxjs/toolkit/query/react";
import * as FHIR from "@topical-ehr/fhir-types";
import { fhirUp } from "./fhir-server";

// Redux Toolkit Query actions for Patient CRUD
// Used by select-patient dialogs so that all patients don't need to be loaded

export const patientsApi = createApi({
    reducerPath: "patientsApiRTKQ",
    async baseQuery(args: { resourceType: string }, api) {
        return { data: null };
    },

    endpoints(build) {
        return {
            getPatient: build.query<FHIR.Patient, string>({
                async queryFn(arg, api) {
                    const reduxState = api.getState() as any;
                    const fhir = await fhirUp(reduxState.fhir.serverConfig);
                    const patient = await fhir.get(`Patient/${arg}`);
                    return { data: patient };
                },
                providesTags(result) {
                    if (result) {
                        return [{ type: "Patient" as const, id: result.id }];
                    } else {
                        return [];
                    }
                },
            }),
            getPatients: build.query<FHIR.Patient[], void>({
                async queryFn(arg, api) {
                    const reduxState = api.getState() as any;
                    const fhir = await fhirUp(reduxState.fhir.serverConfig);
                    const patientsBundle = await fhir.get("Patient");
                    if (FHIR.isBundle(patientsBundle)) {
                        const data = (patientsBundle.entry ?? []).map(
                            (entry) => entry.resource as FHIR.Patient
                        );

                        return { data };
                    } else {
                        console.error("FHIR query failed", {
                            patientsBundle,
                        });
                        return { error: new Error("FHIR query failed") };
                    }
                },
                providesTags(results) {
                    return (results ?? [])
                        .map((result) => ({
                            type: "Patient" as const,
                            id: result.id,
                        }))
                        .concat([{ type: "Patient", id: "LIST" }]);
                },
            }),
            addPatient: build.mutation<FHIR.Patient, FHIR.Patient>({
                async queryFn(arg, api) {
                    const reduxState = api.getState() as any;
                    const fhir = await fhirUp(reduxState.fhir.serverConfig);

                    const bundle = FHIR.Bundle.newTransaction([FHIR.Bundle.entry(arg)]);

                    const result = await fhir.post(bundle);
                    if (FHIR.isBundle(result)) {
                        const data = {
                            patient: result.entry?.[0].resource as FHIR.Patient,
                        };
                        return { data: data.patient };
                    } else {
                        return { error: "Invalid bundle" };
                    }
                },
                invalidatesTags: [{ type: "Patient", id: "LIST" }],
            }),
            updatePatient: build.mutation<FHIR.Patient, FHIR.Patient>({
                async queryFn(arg, api) {
                    const reduxState = api.getState() as any;
                    const fhir = await fhirUp(reduxState.fhir.serverConfig);

                    const bundle = FHIR.Bundle.newTransaction([FHIR.Bundle.entry(arg)]);

                    const result = await fhir.post(bundle);
                    if (FHIR.isBundle(result)) {
                        return { data: arg };
                    } else {
                        return { error: "Invalid bundle" };
                    }
                },
                invalidatesTags: (result) => [{ type: "Patient", id: result?.id }],
            }),
        };
    },
    tagTypes: ["Patient"],
});

export const {
    useGetPatientQuery,
    useGetPatientsQuery,
    useAddPatientMutation,
    useUpdatePatientMutation,
} = patientsApi;
