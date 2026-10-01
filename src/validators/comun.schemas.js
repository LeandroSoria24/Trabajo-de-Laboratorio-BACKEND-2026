import { z } from "zod";

/*
  Esquema común para validar parámetros de ruta con identificador numérico (:id).
  Asegura que el valor sea un entero positivo y lo transforma automáticamente a Number.
*/
export const idParamSchema = z.object({
  id: z.coerce.number("El ID debe ser un número")
    .int("El ID debe ser un número entero")
    .positive("El ID debe ser un número entero positivo")
});

/*
  Enums coincidentes con schema.prisma para Zod 4
*/
export const RolUsuarioEnum = z.enum(["ADMINISTRADOR", "EVALUADOR", "ARTESANO", "VISITANTE"]);

export const EstadoSolicitudEnum = z.enum([
  "PENDIENTE",
  "EN_REVISION",
  "APROBADA",
  "RECHAZADA"
]);

export const EstadoStandEnum = z.enum(["DISPONIBLE", "OCUPADO", "MANTENIMIENTO"]);
