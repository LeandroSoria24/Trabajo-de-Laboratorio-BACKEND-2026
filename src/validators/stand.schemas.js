import { z } from "zod";
import { EstadoStandEnum } from "./comun.schemas.js";

/*
  Esquema para crear un Stand (POST /stands)
*/
export const crearStandSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(1, "El código del stand es obligatorio"),
  numero: z.coerce
    .number()
    .int("El número debe ser un entero")
    .positive("El número debe ser positivo")
    .optional()
    .nullable(),
  pabellon: z
    .string()
    .trim()
    .min(1, "El pabellón es obligatorio"),
  sector: z
    .string()
    .trim()
    .min(1, "El sector es obligatorio"),
  coordenadas: z
    .string()
    .trim()
    .min(1)
    .optional()
    .nullable(),
  estado: EstadoStandEnum.optional().default("DISPONIBLE"),
  artesanoId: z.coerce
    .number()
    .int("El ID del artesano debe ser un número entero")
    .positive("El ID del artesano debe ser positivo")
    .optional()
    .nullable()
});

/*
  Esquema para actualizar un Stand (PUT / PATCH /stands/:id)
*/
export const actualizarStandSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(1, "El código no puede estar vacío")
    .optional(),
  numero: z.coerce
    .number()
    .int("El número debe ser un entero")
    .positive("El número debe ser positivo")
    .optional()
    .nullable(),
  pabellon: z
    .string()
    .trim()
    .min(1, "El pabellón no puede estar vacío")
    .optional(),
  sector: z
    .string()
    .trim()
    .min(1, "El sector no puede estar vacío")
    .optional(),
  coordenadas: z
    .string()
    .trim()
    .min(1)
    .optional()
    .nullable(),
  estado: EstadoStandEnum.optional(),
  artesanoId: z.coerce
    .number()
    .int("El ID del artesano debe ser un número entero")
    .positive("El ID del artesano debe ser positivo")
    .optional()
    .nullable()
});

/*
  Esquema para listar/filtrar Stands (GET /stands)
*/
export const obtenerStandsSchema = z.object({
  pabellon: z.string().trim().min(1).optional(),
  sector: z.string().trim().min(1).optional(),
  estado: EstadoStandEnum.optional(),
  artesanoId: z.coerce.number().int().positive().optional(),
  ordenarPor: z.enum(["id", "codigo", "numero", "pabellon", "sector", "estado", "createdAt"]).default("codigo"),
  direccion: z.enum(["asc", "desc"]).default("asc"),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(50).default(10)
});
