import swaggerAutogen from "swagger-autogen";
import { fileURLToPath } from "node:url";
import * as esquemas from "./src/documentacion/esquemas.js";

const doc = {
  info: {
    title: "Poncho Digital — API REST",
    version: "4.0.0",
    description: "Documentación interactiva de la API REST para la Fiesta Nacional e Internacional del Poncho (Catamarca). Proporciona gestión de usuarios, artesanos, catálogo de productos, stands, pabellones, sectores y postulaciones feriales con RBAC y autenticación JWT.",
  },
  servers: [{ url: "/", description: "Servidor actual" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    // @schemas conserva las definiciones explícitas en components.schemas en el swagger-output.json
    "@schemas": esquemas,
  },
};

// Resolver desde este archivo permite ejecutarlo desde cualquier carpeta
const ruta = (archivo) =>
  fileURLToPath(new URL(archivo, import.meta.url)).replaceAll("\\", "/");

const outputFile = ruta("./swagger-output.json");
const routes = [ruta("./src/app.js")];

const generar = swaggerAutogen({ openapi: "3.0.0" });
const resultado = await generar(outputFile, routes, doc);

if (!resultado.success) {
  throw new Error("No se pudo generar la especificación OpenAPI.");
}
