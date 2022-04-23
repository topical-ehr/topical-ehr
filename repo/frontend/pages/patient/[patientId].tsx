import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ResizableGridLayout } from "../../components/layout/ResizableGridLayout";
import { Tile } from "../../components/layout/Tile";
import { PatientList } from "../../components/patients/PatientList";
import styles from "../../styles/Home.module.css";
import { FHIR } from "../../components/dev/FHIR";
import { PatientHeader } from "../../components/patient/PatientHeader";
import { Logo } from "../../components/layout/Logo";
import { ObservationList } from "../../components/observations/ObservationList";
import { ObservationGroups } from "../../components/observations/ObservationGroups";
import { Column, ColumnLayout } from "../../components/layout/ColumnLayout";

export default function Home() {
  const router = useRouter();
  const { patientId } = router.query;

  if (typeof patientId !== "string") {
    return null;
    throw new Error(`unexpected patientId: ${JSON.stringify(patientId)}`);
  }

  return (
    <div className={styles.container}>
      <Logo />

      <PatientHeader />

      <ColumnLayout>
        <Column></Column>

        <Column>
          <Tile title="">
            <ObservationGroups patientId={patientId} />
          </Tile>
          <Tile title="All results">
            <ObservationList.All
              path={`Observation?subject=Patient/${patientId}`}
            />
          </Tile>
        </Column>

        {/* <Column>
          <Tile title="🔥 FHIR">
            <FHIR.JSON path={`Patient/${patientId}/$everything?_count=1000`} />
          </Tile>
        </Column> */}

        <div key="item-4"></div>
      </ColumnLayout>
    </div>
  );
}
