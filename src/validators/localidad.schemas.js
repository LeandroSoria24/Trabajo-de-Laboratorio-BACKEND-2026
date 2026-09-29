import { z } from "zod";
/* 🟥 */
export const crearLocalidadSchema = z.object({
  nombre: z.string("El nombre de la localidad es obligatorio")
    .trim()
    .min(1, "El nombre de la localidad no puede estar vacío"),
  provincia: z.string().trim().min(1).optional().default("Catamarca")
});

export const actualizarLocalidadSchema = z.object({
  nombre: z.string("El nombre debe ser un texto")
    .trim()
    .min(1, "El nombre no puede estar vacío")
    .optional(),
  provincia: z.string().trim().min(1).optional()
});

export const obtenerLocalidadesSchema = z.object({
  nombre: z.string().trim().min(1).optional(),
  provincia: z.string().trim().min(1).optional(),
  ordenarPor: z.enum(["id", "nombre", "provincia"]).default("nombre"),
  direccion: z.enum(["asc", "desc"]).default("asc"),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20)
});
