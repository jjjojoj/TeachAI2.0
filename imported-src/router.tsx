import { createRouter as createTanStackRouter } from "@tanstack/react-router";
// @ts-expect-error - route tree is generated at build time
import { routeTree } from "./generated/tanstack-router/routeTree.gen";

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPendingComponent: () => <div>Loading...</div>,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
