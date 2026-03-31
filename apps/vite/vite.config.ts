import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite-plus";

import { framework } from "react-server-frame/vite/plugin";

export default defineConfig({
  plugins: [framework(), react(), rsc()],
});
