import Head from "next/head";
import React from "react";
import { Logo } from "../components/layout/Logo";
import { ResizableGridLayout } from "../components/layout/ResizableGridLayout";
import { Tile } from "../components/layout/Tile";
import { PatientList } from "../components/patients/PatientList";
import styles from "../styles/Home.module.css";
import { PatientFormatter } from "../utils/display/PatientFormatter";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Next-EHR</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Logo />

      <ResizableGridLayout
        layout={[
          { i: "item-1", x: 0, y: 0, w: 4, h: 2 },
          { i: "item-2", x: 4, y: 0, w: 4, h: 2 },
          { i: "item-3", x: 0, y: 4, w: 4, h: 2 },
          { i: "item-4", x: 4, y: 4, w: 4, h: 2 },
        ]}
      >
        <div key="item-1">
          <Tile title="Recent">
            <PatientList.Recent />
          </Tile>
        </div>

        <div key="item-2">
          <Tile title="All">
            <PatientList.All />
          </Tile>
        </div>

        <div key="item-3">
          <Tile title="List 3">
            <PatientList.Filtered
              filter={(patient) =>
                new PatientFormatter(patient).name.includes("Arm")
              }
            />
          </Tile>
        </div>

        <div key="item-4">
          <Tile title="Ward 1A">
            <PatientList.Filtered
              filter={(patient) =>
                new PatientFormatter(patient).name.includes("An")
              }
            />
          </Tile>
        </div>
      </ResizableGridLayout>
    </div>
  );
}
