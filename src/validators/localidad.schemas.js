import { z } from "zod";

/*
  Esquema para listar/filtrar Localidades (GET /localidades)
*/
export const obtenerLocalidadesSchema = z.object({
  nombre: z.string().trim().optional(),
  ordenarPor: z.enum(["id", "nombre", "provincia", "createdAt"]).default("nombre"),
  direccion: z.enum(["asc", "desc"]).default("asc")
});
