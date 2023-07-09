// vite.config.ts
import { defineConfig } from "file:///home/eug/topical-ehr/.yarn/__virtual__/vite-virtual-dc1c52cb8f/0/cache/vite-npm-4.3.9-24f3552941-8c45a51627.zip/node_modules/vite/dist/node/index.js";
import react from "file:///home/eug/topical-ehr/.yarn/__virtual__/@vitejs-plugin-react-virtual-25b3d1c6e8/0/cache/@vitejs-plugin-react-npm-4.0.1-13fe9aab7e-a0ec934920.zip/node_modules/@vitejs/plugin-react/dist/index.mjs";
import dsv from "file:///home/eug/topical-ehr/.yarn/cache/@rollup-plugin-dsv-npm-2.0.3-e56246c378-560c75227e.zip/node_modules/@rollup/plugin-dsv/dist/index.js";
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      // src: path.resolve(__dirname, "./src"),
    }
  },
  server: {
    proxy: {
      "/fhir": {
        target: "http://localhost:5454",
        secure: false
      },
      "/db_snapshots": {
        target: "http://0.0.0.0:8000",
        secure: false
      }
    },
    headers: {
      // For OPFS
      // from https://github.com/tomayac/sqlite-wasm#usage-with-vite
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  },
  optimizeDeps: {
    // from https://github.com/tomayac/sqlite-wasm#usage-with-vite
    exclude: ["@sqlite.org/sqlite-wasm"]
  },
  plugins: [react(), dsv()]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9ldWcvdG9waWNhbC1laHIvZGVtb3MvZGVtby13ZWJhcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2V1Zy90b3BpY2FsLWVoci9kZW1vcy9kZW1vLXdlYmFwcC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9ldWcvdG9waWNhbC1laHIvZGVtb3MvZGVtby13ZWJhcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IGRzdiBmcm9tIFwiQHJvbGx1cC9wbHVnaW4tZHN2XCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAgIHJlc29sdmU6IHtcbiAgICAgICAgYWxpYXM6IHtcbiAgICAgICAgICAgIC8vIHNyYzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgICBwcm94eToge1xuICAgICAgICAgICAgXCIvZmhpclwiOiB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBcImh0dHA6Ly9sb2NhbGhvc3Q6NTQ1NFwiLFxuICAgICAgICAgICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCIvZGJfc25hcHNob3RzXCI6IHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IFwiaHR0cDovLzAuMC4wLjA6ODAwMFwiLFxuICAgICAgICAgICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIC8vIEZvciBPUEZTXG4gICAgICAgICAgICAvLyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS90b21heWFjL3NxbGl0ZS13YXNtI3VzYWdlLXdpdGgtdml0ZVxuICAgICAgICAgICAgXCJDcm9zcy1PcmlnaW4tT3BlbmVyLVBvbGljeVwiOiBcInNhbWUtb3JpZ2luXCIsXG4gICAgICAgICAgICBcIkNyb3NzLU9yaWdpbi1FbWJlZGRlci1Qb2xpY3lcIjogXCJyZXF1aXJlLWNvcnBcIixcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgICAvLyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS90b21heWFjL3NxbGl0ZS13YXNtI3VzYWdlLXdpdGgtdml0ZVxuICAgICAgICBleGNsdWRlOiBbXCJAc3FsaXRlLm9yZy9zcWxpdGUtd2FzbVwiXSxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtyZWFjdCgpLCBkc3YoKV0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVMsU0FBUyxvQkFBb0I7QUFDcFUsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sU0FBUztBQUdoQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixTQUFTO0FBQUEsSUFDTCxPQUFPO0FBQUE7QUFBQSxJQUVQO0FBQUEsRUFDSjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osT0FBTztBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsUUFBUTtBQUFBLFFBQ1IsUUFBUTtBQUFBLE1BQ1o7QUFBQSxNQUNBLGlCQUFpQjtBQUFBLFFBQ2IsUUFBUTtBQUFBLFFBQ1IsUUFBUTtBQUFBLE1BQ1o7QUFBQSxJQUNKO0FBQUEsSUFFQSxTQUFTO0FBQUE7QUFBQTtBQUFBLE1BR0wsOEJBQThCO0FBQUEsTUFDOUIsZ0NBQWdDO0FBQUEsSUFDcEM7QUFBQSxFQUNKO0FBQUEsRUFDQSxjQUFjO0FBQUE7QUFBQSxJQUVWLFNBQVMsQ0FBQyx5QkFBeUI7QUFBQSxFQUN2QztBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDNUIsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
