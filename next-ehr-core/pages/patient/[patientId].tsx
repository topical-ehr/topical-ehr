import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ResizableGridLayout } from "../../components/layout/ResizableGridLayout";
import { Tile } from "../../components/layout/Tile";
import { PatientList } from "../../components/patients/PatientList";
import styles from "../../styles/Home.module.css";
import { PatientName } from "../../utils/display";
import { FHIR } from "../../components/dev/FHIR";

export default function Home() {
  const router = useRouter();
  const { patientId } = router.query;

  return (
    <div className={styles.container}>
      <Head>
        <title>Next-EHR</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ResizableGridLayout
        layout={[
          { i: "item-1", x: 0, y: 0, w: 4, h: 2 },
          { i: "item-2", x: 4, y: 0, w: 4, h: 2 },
          { i: "item-3", x: 0, y: 4, w: 4, h: 2 },
          { i: "item-4", x: 4, y: 4, w: 4, h: 2 },
        ]}
      >
        <div key="item-1">
          <Tile title="FHIR">
            <FHIR.JSON path={`Patient/${patientId}`} />
          </Tile>
        </div>

        <div key="item-2">
          <Tile title="All">
            <PatientList.All />
          </Tile>
        </div>

        <div key="item-3">List 3</div>

        <div key="item-4">
          <Tile title="Ward 1A">
            <PatientList.Filtered
              filter={(patient) => PatientName(patient).startsWith("A")}
            />
          </Tile>
        </div>
      </ResizableGridLayout>
    </div>
  );
}
