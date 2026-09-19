import { z } from "zod";

/**
 * Esquema común para validar parámetros de ruta con identificador numérico (:id).
 * Asegura que el valor sea un entero positivo y lo transforma automáticamente a Number.
 */
export const idParamSchema = z.object({
  id: z.coerce.number("El ID debe ser un número")
    .int("El ID debe ser un número entero")
    .positive("El ID debe ser un número entero positivo")
});
