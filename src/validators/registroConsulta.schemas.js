import { z } from "zod";

export const crearRegistroConsultaSchema = z.object({
  visitanteId: z.coerce.number().int().positive().optional().nullable(),
  termino_busqueda: z.string("El término de búsqueda es obligatorio")
    .trim()
    .min(1, "El término de búsqueda no puede estar vacío")
});

export const obtenerRegistroConsultasSchema = z.object({
  termino_busqueda: z.string().trim().min(1).optional(),
  visitanteId: z.coerce.number().int().positive().optional(),
  ordenarPor: z.enum(["id", "fecha"]).default("fecha"),
  direccion: z.enum(["asc", "desc"]).default("desc"),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20)
});
