import { lazy } from "react";

const routes = [
  {
    path: "/tempobook/*",
    element: lazy(() => import("./tempobook/routes")),
  },
];

export default routes;
