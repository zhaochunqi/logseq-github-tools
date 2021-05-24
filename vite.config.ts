import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import WindiCSS from "vite-plugin-windicss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // TODO: is it possible to use HMR during plugin development?
    reactRefresh(),
    WindiCSS(),
  ],
  base: ''
});
