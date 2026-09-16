import { z } from "zod";

/**
 * Esquema de validación para la creación de libros (POST /libros).
 * Sigue la convención declarada en la cátedra para contratos de entrada con Zod.
 */
export const crearLibroSchema = z.object({
  titulo: z.string().trim().min(1),
  autor: z.string().trim().min(1),
  anio: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  categoriaId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  categoriaID: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable()
});

/**
 * Esquema de validación para la actualización de libros (PUT /libros/:id).
 */
export const actualizarLibroSchema = z.object({
  titulo: z.string().trim().min(1),
  autor: z.string().trim().min(1),
  anio: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  categoriaId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  categoriaID: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable()
});
