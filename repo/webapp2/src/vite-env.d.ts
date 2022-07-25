/// <reference types="vite/client" />

declare module "*.csv" {
  const content: object[]; // courtesy of plugin-dsv
  export default content;
}
