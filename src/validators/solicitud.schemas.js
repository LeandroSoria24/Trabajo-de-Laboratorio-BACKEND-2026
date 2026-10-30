import { z } from "zod";

export const crearSolicitudSchema = z.object({
  observaciones: z.string().trim().optional().nullable()
}).strict();

export const evaluarSolicitudSchema = z.object({
  estado: z.enum(["APROBADA", "RECHAZADA"]),
  observaciones: z.string().trim().optional().nullable()
}).strict();

export const asignarStandSolicitudSchema = z.object({
  standId: z.coerce.number().int().positive().optional()
}).strict();

export const filtrarSolicitudesSchema = z.object({
  estado: z.enum(["PENDIENTE", "EN_REVISION", "APROBADA", "RECHAZADA", "CANCELADA"]).optional(),
  artesanoId: z.coerce.number().int().positive().optional(),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(50).default(10)
});
