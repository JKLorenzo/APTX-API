import { pathToFileURL } from "url";
import { join, relative } from "path";

import express, { json, Router } from "express";

import APIRoute from "./structures/api_route.js";
import { getFiles } from "./utils/helpers.js";
import { APIMethod } from "./utils/enums.js";
import { initDb } from "./modules/database.js";

const app = express().use(json());
const port = 3000;
const router = Router();
const routesPath = join(process.cwd(), "build/routes");

// Load API Routes dynamically
for (const routePath of getFiles(routesPath)) {
  const filePath = pathToFileURL(routePath).href;
  const relPath = relative(routesPath, routePath);
  const sections = relPath.replace(/\\/g, "/").split("/");

  const endpoint = `/api/${sections
    .slice(0, sections.length - 1)
    .map((section) => {
      if (!section.startsWith("_")) return section;
      return `:${section.substring(1)}`;
    })
    .join("/")}`;

  const method = sections[sections.length - 1]
    .split(".")[0]
    .toUpperCase() as APIMethod;

  const { default: Route } = await import(filePath);
  const apiRoute = new Route() as APIRoute;

  switch (method) {
    case APIMethod.Get:
      router.get(endpoint, apiRoute.middleware, apiRoute.run);
      break;
    case APIMethod.Post:
      router.post(endpoint, apiRoute.middleware, apiRoute.run);
      break;
    case APIMethod.Patch:
      router.patch(endpoint, apiRoute.middleware, apiRoute.run);
      break;
    case APIMethod.Delete:
      router.delete(endpoint, apiRoute.middleware, apiRoute.run);
      break;
    default:
      console.error(`[UNKNOWN_ENDPOINT]: ${method} ${endpoint}`);
  }
}
app.use(router);

initDb();

// Start API
app.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});
