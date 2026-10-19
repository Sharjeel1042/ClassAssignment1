import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Requests to /api/... are forwarded to the backend, so no CORS setup is needed.
// Example: /api/applications  ->  http://localhost:3000/applications
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
