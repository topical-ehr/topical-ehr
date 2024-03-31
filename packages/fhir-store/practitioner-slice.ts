import { createApi } from "@reduxjs/toolkit/query/react";
import * as FHIR from "@topical-ehr/fhir-types";
import { fhirUp } from "./fhir-server";

export interface PractitionerWithRole {
    practitioner: FHIR.Practitioner;
    role: FHIR.PractitionerRole;
}

export const practitionersApi = createApi({
    reducerPath: "practitionersApiRTKQ",
    async baseQuery(args: { resourceType: string }, api) {
        return { data: null };
    },

    endpoints(build) {
        return {
            getPractitioner: build.query<FHIR.Practitioner, string>({
                async queryFn(arg, api) {
                    const reduxState = api.getState() as any;
                    const fhir = await fhirUp(reduxState.fhir.serverConfig);
                    const practitioner = await fhir.get(`Practitioner/${arg}`);
                    return { data: practitioner };
                },
                providesTags(result) {
                    if (result) {
                        return [{ type: "Practitioner" as const, id: result.id }];
                    } else {
                        return [];
                    }
                },
            }),
            getPractitioners: build.query<PractitionerWithRole[], void>({
                async queryFn(arg, api) {
                    const reduxState = api.getState() as any;
                    const fhir = await fhirUp(reduxState.fhir.serverConfig);
                    const practitionersBundle = await fhir.get("Practitioner");
                    const rolesBundle = await fhir.get("PractitionerRole");
                    if (
                        FHIR.isBundle(practitionersBundle) &&
                        FHIR.isBundle(rolesBundle)
                    ) {
                        const data = (practitionersBundle.entry ?? []).map(
                            (practitioner) => ({
                                practitioner: practitioner.resource as FHIR.Practitioner,
                                role: rolesBundle.entry?.find((role) => {
                                    const resource =
                                        role.resource as FHIR.PractitionerRole;
                                    const found =
                                        resource.practitioner?.reference ===
                                        "Practitioner/" + practitioner.resource.id;
                                    // debugger;
                                    return found;
                                })?.resource as FHIR.PractitionerRole,
                            })
                        );

                        return { data };
                    } else {
                        console.error("FHIR query failed", {
                            practitionersBundle,
                            rolesBundle,
                        });
                        return { error: new Error("FHIR query failed") };
                    }
                },
                providesTags(results) {
                    return (results ?? [])
                        .map((result) => ({
                            type: "Practitioner" as const,
                            id: result.practitioner.id,
                        }))
                        .concat([{ type: "Practitioner", id: "LIST" }]);
                },
            }),
            addPractitioner: build.mutation<PractitionerWithRole, PractitionerWithRole>({
                async queryFn(arg, api) {
                    const reduxState = api.getState() as any;
                    const fhir = await fhirUp(reduxState.fhir.serverConfig);

                    const practitionerId = FHIR.newUuidId();
                    const role = {
                        ...arg.role,
                        id: FHIR.newUuidId(),
                        practitioner: { reference: practitionerId },
                    };

                    const bundle = FHIR.Bundle.newTransaction([
                        FHIR.Bundle.entry(arg.practitioner),
                        FHIR.Bundle.entry(role),
                    ]);

                    const result = await fhir.post(bundle);
                    if (FHIR.isBundle(result)) {
                        const data = {
                            practitioner: result.entry?.[0].resource as FHIR.Practitioner,
                            role: result.entry?.[1].resource as FHIR.PractitionerRole,
                        };
                        return { data };
                    } else {
                        return { error: "Invalid bundle" };
                    }
                },
                invalidatesTags: [{ type: "Practitioner", id: "LIST" }],
            }),
            updatePractitioner: build.mutation<
                PractitionerWithRole,
                PractitionerWithRole
            >({
                async queryFn(arg, api) {
                    const reduxState = api.getState() as any;
                    const fhir = await fhirUp(reduxState.fhir.serverConfig);

                    const role = {
                        ...arg.role,
                        id: FHIR.newUuidId(),
                        practitioner: FHIR.referenceTo(arg.practitioner),
                    };

                    const bundle = FHIR.Bundle.newTransaction([
                        FHIR.Bundle.entry(arg.practitioner),
                        FHIR.Bundle.entry(role),
                    ]);

                    const result = await fhir.post(bundle);
                    if (FHIR.isBundle(result)) {
                        return { data: arg };
                    } else {
                        return { error: "Invalid bundle" };
                    }
                },
                invalidatesTags: (result) => [
                    { type: "Practitioner", id: result?.practitioner.id },
                ],
            }),
        };
    },
    tagTypes: ["Practitioner"],
});

export const {
    useGetPractitionerQuery,
    useGetPractitionersQuery,
    useAddPractitionerMutation,
    useUpdatePractitionerMutation,
} = practitionersApi;
