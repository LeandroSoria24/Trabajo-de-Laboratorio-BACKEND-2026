import { z } from "zod";
import { EstadoStandEnum } from "./comun.schemas.js";

export const crearStandSchema = z.object({
  codigo: z.string("El código del stand es obligatorio")
    .trim()
    .min(1, "El código no puede estar vacío"),
  numero: z.coerce.number().int().positive().optional().nullable(),
  pabellon: z.string("El pabellón es obligatorio")
    .trim()
    .min(1, "El pabellón no puede estar vacío"),
  sector: z.string("El sector es obligatorio")
    .trim()
    .min(1, "El sector no puede estar vacío"),
  coordenadas: z.string().trim().optional().nullable(),
  estado: EstadoStandEnum.optional().default("DISPONIBLE"),
  artesanoId: z.coerce.number().int().positive().optional().nullable()
});

export const actualizarStandSchema = z.object({
  codigo: z.string().trim().min(1, "El código no puede estar vacío").optional(),
  numero: z.coerce.number().int().positive().optional().nullable(),
  pabellon: z.string().trim().min(1, "El pabellón no puede estar vacío").optional(),
  sector: z.string().trim().min(1, "El sector no puede estar vacío").optional(),
  coordenadas: z.string().trim().optional().nullable(),
  estado: EstadoStandEnum.optional(),
  artesanoId: z.coerce.number().int().positive().optional().nullable()
});

export const asignarStandSchema = z.object({
  artesanoId: z.coerce.number("El artesanoId es obligatorio para asignar el stand")
    .int("El ID del artesano debe ser un número entero")
    .positive("El ID del artesano debe ser positivo")
});

export const obtenerStandsQuerySchema = z.object({
  pabellon: z.string().trim().min(1).optional(),
  sector: z.string().trim().min(1).optional(),
  estado: EstadoStandEnum.optional(),
  artesanoId: z.coerce.number().int().positive().optional(),
  ordenarPor: z.enum(["id", "codigo", "pabellon", "sector", "estado"]).default("codigo"),
  direccion: z.enum(["asc", "desc"]).default("asc"),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20)
});
