import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  if (mode === "production" && (!env.VITE_BLUTO_API_URL || /localhost|127\.0\.0\.1/.test(env.VITE_BLUTO_API_URL))) {
    throw new Error(
      "VITE_BLUTO_API_URL must be set to a non-localhost URL for a production build (see .env.production).",
    );
  }

  return {
    plugins: [react(), tailwindcss()],
  };
});
