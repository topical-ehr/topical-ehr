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

export default function Home() {
  const router = useRouter();
  const { patientId } = router.query;

  return (
    <div className={styles.container}>
      <Head>
        <title>Next-EHR</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Logo />

      <PatientHeader />

      <ResizableGridLayout
        layout={[
          { i: "item-1", x: 0, y: 0, w: 4, h: 5 },
          { i: "item-2", x: 4, y: 0, w: 4, h: 5 },
          { i: "item-3", x: 0, y: 5, w: 4, h: 2 },
          { i: "item-4", x: 4, y: 5, w: 4, h: 2 },
        ]}
      >
        <div key="item-1">
          <Tile title="🔥 FHIR">
            <FHIR.JSON path={`Patient/${patientId}/$everything`} />
          </Tile>
        </div>

        <div key="item-2">
          <Tile title="Results">
            <ObservationList.All
              path={`Observation?subject=Patient/${patientId}`}
            />
          </Tile>
        </div>
      </ResizableGridLayout>
    </div>
  );
}
