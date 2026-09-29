import { z } from "zod";
import { EstadoSolicitudEnum } from "./comun.schemas.js";
/* 🟥 */
export const crearSolicitudSchema = z.object({
  usuarioId: z.coerce.number().int().positive().optional().nullable(),
  datos_personales: z.string("Los datos personales son obligatorios")
    .trim()
    .min(1, "Los datos personales no pueden estar vacíos"),
  datos_emprendimiento: z.string("Los datos del emprendimiento son obligatorios")
    .trim()
    .min(1, "Los datos del emprendimiento no pueden estar vacíos")
});

export const evaluarSolicitudSchema = z.object({
  estado: EstadoSolicitudEnum,
  observaciones: z.string().trim().optional().nullable()
}).refine((data) => {
  if (
    (data.estado === "RECHAZADA" || data.estado === "MODIFICACION_SOLICITADA") &&
    (!data.observaciones || data.observaciones.trim().length === 0)
  ) {
    return false;
  }
  return true;
}, {
  message: "Debe ingresar una observación explicando el motivo del rechazo o las modificaciones requeridas",
  path: ["observaciones"]
});

export const obtenerSolicitudesSchema = z.object({
  estado: EstadoSolicitudEnum.optional(),
  usuarioId: z.coerce.number().int().positive().optional(),
  ordenarPor: z.enum(["id", "estado", "createdAt"]).default("createdAt"),
  direccion: z.enum(["asc", "desc"]).default("desc"),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(50).default(10)
});
