import React from "react";
import Head from "next/head";
import css from "./Logo.module.scss";

export function Logo() {
  return (
    <a href="/" class={css.container}>
      <Head>
        <title>Next-EHR</title>

        {/* 🏥 favicon using SVG trick */}
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏥</text></svg>"
        ></link>
      </Head>

      <b>Next-EHR</b>
      <span> 0.0.1</span>
    </a>
  );
}
