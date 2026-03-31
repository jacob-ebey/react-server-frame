import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import devtoolsJson from "vite-plugin-devtools-json";
import { defineConfig } from "vite-plus";

import { framework } from "react-server-frame/vite/plugin";

export default defineConfig({
  plugins: [
    framework(),
    react(),
    rsc(),
    babel({ presets: [reactCompilerPreset()] }),
    devtoolsJson(),
  ],
});
