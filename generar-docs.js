import swaggerAutogen from "swagger-autogen";
import { fileURLToPath } from "node:url";

const doc = {
info: { title: "API de Gestión de Eventos", version: "1.0.0",
description: "Borrador: revisar esquemas, errores y permisos." },
servers: [{ url: "/", description: "Servidor actual" }],
};
const ruta = (archivo) =>
fileURLToPath(new URL(archivo, import.meta.url)).replaceAll("\\", "/");
const outputFile = ruta("./swagger-output.json");
const routes = [ruta("./src/app.js")];
const generar = swaggerAutogen({ openapi: "3.0.0" });
const resultado = await generar(outputFile, routes, doc);
if (!resultado.success) {
throw new Error("No se pudo generar la especificación OpenAPI.");
}