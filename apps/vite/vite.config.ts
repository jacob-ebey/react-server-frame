import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import devtoolsJson from "vite-plugin-devtools-json";
import { useCachePlugin } from "vite-plugin-react-use-cache";
import { defineConfig } from "vite-plus";

import { reactServerFrame } from "react-server-frame/vite/plugin";

export default defineConfig({
  plugins: [
    reactServerFrame(),
    react(),
    rsc(),
    babel({ presets: [reactCompilerPreset()] }),
    useCachePlugin(),
    devtoolsJson(),
  ],
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
