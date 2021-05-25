import { initializeIcons } from '@fluentui/react';

import '../styles/globals.css';

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

initializeIcons();

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
