import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { PatientFormatter } from "../../utils/display/PatientFormatter";
import { fetcher } from "../../utils/fetcher";
import { Patient } from "../../utils/FhirTypes";
import { ErrorMessage } from "../feedback/ErrorMessage";
import css from "./PatientHeader.module.scss";

export function PatientHeader() {
  const router = useRouter();
  const { patientId } = router.query;

  const { data: patient, error } = useSWR<Patient>(
    `/fhir/Patient/${patientId}`,
    fetcher
  );
  if (error) {
    return <ErrorMessage error={error} />;
  }
  if (!patient) {
    return <div>Loading...</div>;
  }

  const pf = new PatientFormatter(patient);
  return (
    <div class={css.container}>
      <div class={css.name}>{pf.name}</div>
      <div class={css.summary}>{pf.ageGenderBorn}</div>
    </div>
  );
}
