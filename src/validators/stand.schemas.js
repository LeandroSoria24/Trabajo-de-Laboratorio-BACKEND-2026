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
  pabellonId: z.coerce
    .number("El ID del pabellón es obligatorio")
    .int("El ID del pabellón debe ser un entero")
    .positive("El ID del pabellón debe ser positivo"),
  sectorId: z.coerce
    .number("El ID del sector es obligatorio")
    .int("El ID del sector debe ser un entero")
    .positive("El ID del sector debe ser positivo"),
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
  pabellonId: z.coerce
    .number()
    .int("El ID del pabellón debe ser un entero")
    .positive("El ID del pabellón debe ser positivo")
    .optional(),
  sectorId: z.coerce
    .number()
    .int("El ID del sector debe ser un entero")
    .positive("El ID del sector debe ser positivo")
    .optional(),
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
  pabellonId: z.coerce.number().int().positive().optional(),
  sectorId: z.coerce.number().int().positive().optional(),
  estado: EstadoStandEnum.optional(),
  artesanoId: z.coerce.number().int().positive().optional(),
  ordenarPor: z.enum(["id", "codigo", "numero", "pabellonId", "sectorId", "estado", "createdAt"]).default("codigo"),
  direccion: z.enum(["asc", "desc"]).default("asc"),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(50).default(10)
});

/*
  Esquema para asignar artesano a un Stand (PATCH /stands/:id/asignar-artesano)
*/
export const asignarArtesanoSchema = z.object({
  artesanoId: z.coerce
    .number("El ID del artesano es obligatorio")
    .int("El ID del artesano debe ser un número entero")
    .positive("El ID del artesano debe ser positivo")
});

