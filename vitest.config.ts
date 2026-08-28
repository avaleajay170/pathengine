import { fileURLToPath } from "node:url";

import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Tests deliberately do not load the TanStack Start or Nitro plugins. Those exist to
// build and serve an SSR application; under Vitest they would spin up route
// generation and a server bundle for no benefit. Components and domain logic are
// tested against jsdom, and routing is covered by the loaders' own unit tests.
export default defineConfig({
  plugins: [viteReact()],

  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },

  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
  },
});
