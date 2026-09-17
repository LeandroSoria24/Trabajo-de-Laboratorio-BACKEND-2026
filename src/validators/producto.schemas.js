import { z } from "zod";

/**
 * Esquema de validación para obtener un producto por ID (GET /productos/:id)
 * Valida los parámetros de la ruta (req.params)
 */
export const obtenerProductoPorIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "El ID debe ser un número entero").transform(Number)
});

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


/**
 * Esquema de validación para listar productos (GET /productos)
 * Valida los parámetros de consulta (req.query) para paginación y filtros
 */
export const obtenerProductosSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("10"),
  nombre: z.string().trim().optional()
});