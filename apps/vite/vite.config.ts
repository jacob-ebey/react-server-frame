import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { reactServerFrame } from "react-server-frame/vite/plugin";
import devtoolsJson from "vite-plugin-devtools-json";
import { useCachePlugin } from "vite-plugin-react-use-cache";
import { defineConfig } from "vite-plus";

export default defineConfig({
  server: {
    host: "127.0.0.1",
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    reactServerFrame(),
    tailwindcss(),
    react(),
    rsc(),
    babel({ presets: [reactCompilerPreset()] }),
    useCachePlugin(),
    devtoolsJson(),
    {
      name: "dot-env",
      config(_, { command }) {
        if (command !== "build") process.loadEnvFile();
      },
    },
  ],
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
