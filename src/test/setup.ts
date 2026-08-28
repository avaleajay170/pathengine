import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library only auto-cleans when Vitest globals are enabled. They are not, so
// unmount explicitly — otherwise every render stacks up in the same jsdom document and
// queries start matching leftovers from earlier tests.
afterEach(() => {
  cleanup();
});
