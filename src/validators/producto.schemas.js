import { z } from "zod";

/**
 * Esquema de validación para crear un producto (POST /productos)
 */
export const crearProductoSchema = z.object({
  nombre: z.string().trim().min(1),
  descripcion: z.string().trim().min(1).optional().nullable(),
  precio: z.number().positive(),
  stock: z.number().int().nonnegative().optional(),
  artesanoId: z.number().int().positive()
});

/**
 * Esquema de validación para actualizar un producto (PUT /productos/:id)
 */
export const actualizarProductoSchema = z.object({
  nombre: z.string().trim().min(1),
  descripcion: z.string().trim().min(1).optional().nullable(),
  precio: z.number().positive(),
  stock: z.number().int().nonnegative().optional(),
  artesanoId: z.number().int().positive().optional()
});
