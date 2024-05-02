// vite.config.ts
import { defineConfig } from "file:///home/eug/src/topical-ehr/.yarn/__virtual__/vite-virtual-dc1c52cb8f/0/cache/vite-npm-4.3.9-24f3552941-8c45a51627.zip/node_modules/vite/dist/node/index.js";
import react from "file:///home/eug/src/topical-ehr/.yarn/__virtual__/@vitejs-plugin-react-virtual-25b3d1c6e8/0/cache/@vitejs-plugin-react-npm-4.0.1-13fe9aab7e-a0ec934920.zip/node_modules/@vitejs/plugin-react/dist/index.mjs";
import dsv from "@rollup/plugin-dsv";
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
      }
      // "/db_snapshots": {
      //     target: "http://0.0.0.0:8000",
      //     secure: false,
      // },
    },
    headers: {
      // For OPFS
      // from https://github.com/tomayac/sqlite-wasm#usage-with-vite
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  },
  preview: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  },
  build: {
    minify: false
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9ldWcvc3JjL3RvcGljYWwtZWhyL2RlbW9zL2RlbW8td2ViYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9ldWcvc3JjL3RvcGljYWwtZWhyL2RlbW9zL2RlbW8td2ViYXBwL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2V1Zy9zcmMvdG9waWNhbC1laHIvZGVtb3MvZGVtby13ZWJhcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IGRzdiBmcm9tIFwiQHJvbGx1cC9wbHVnaW4tZHN2XCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAgIHJlc29sdmU6IHtcbiAgICAgICAgYWxpYXM6IHtcbiAgICAgICAgICAgIC8vIHNyYzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgICBwcm94eToge1xuICAgICAgICAgICAgXCIvZmhpclwiOiB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBcImh0dHA6Ly9sb2NhbGhvc3Q6NTQ1NFwiLFxuICAgICAgICAgICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8gXCIvZGJfc25hcHNob3RzXCI6IHtcbiAgICAgICAgICAgIC8vICAgICB0YXJnZXQ6IFwiaHR0cDovLzAuMC4wLjA6ODAwMFwiLFxuICAgICAgICAgICAgLy8gICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgICAgICAvLyB9LFxuICAgICAgICB9LFxuXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIC8vIEZvciBPUEZTXG4gICAgICAgICAgICAvLyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS90b21heWFjL3NxbGl0ZS13YXNtI3VzYWdlLXdpdGgtdml0ZVxuICAgICAgICAgICAgXCJDcm9zcy1PcmlnaW4tT3BlbmVyLVBvbGljeVwiOiBcInNhbWUtb3JpZ2luXCIsXG4gICAgICAgICAgICBcIkNyb3NzLU9yaWdpbi1FbWJlZGRlci1Qb2xpY3lcIjogXCJyZXF1aXJlLWNvcnBcIixcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIHByZXZpZXc6IHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgXCJDcm9zcy1PcmlnaW4tT3BlbmVyLVBvbGljeVwiOiBcInNhbWUtb3JpZ2luXCIsXG4gICAgICAgICAgICBcIkNyb3NzLU9yaWdpbi1FbWJlZGRlci1Qb2xpY3lcIjogXCJyZXF1aXJlLWNvcnBcIixcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICAgIG1pbmlmeTogZmFsc2UsXG4gICAgfSxcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgICAgLy8gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vdG9tYXlhYy9zcWxpdGUtd2FzbSN1c2FnZS13aXRoLXZpdGVcbiAgICAgICAgZXhjbHVkZTogW1wiQHNxbGl0ZS5vcmcvc3FsaXRlLXdhc21cIl0sXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgZHN2KCldLFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1ULFNBQVMsb0JBQW9CO0FBQ2hWLE9BQU8sV0FBVztBQUNsQixPQUFPLFNBQVM7QUFHaEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBO0FBQUEsSUFFUDtBQUFBLEVBQ0o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLE9BQU87QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLFFBQVE7QUFBQSxRQUNSLFFBQVE7QUFBQSxNQUNaO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtKO0FBQUEsSUFFQSxTQUFTO0FBQUE7QUFBQTtBQUFBLE1BR0wsOEJBQThCO0FBQUEsTUFDOUIsZ0NBQWdDO0FBQUEsSUFDcEM7QUFBQSxFQUNKO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxTQUFTO0FBQUEsTUFDTCw4QkFBOEI7QUFBQSxNQUM5QixnQ0FBZ0M7QUFBQSxJQUNwQztBQUFBLEVBQ0o7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNILFFBQVE7QUFBQSxFQUNaO0FBQUEsRUFDQSxjQUFjO0FBQUE7QUFBQSxJQUVWLFNBQVMsQ0FBQyx5QkFBeUI7QUFBQSxFQUN2QztBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDNUIsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
