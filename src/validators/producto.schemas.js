import { z } from "zod";

/**
 * Esquema de validación para obtener un producto por ID (GET /productos/:id) 🟩
 * Valida los parámetros de la ruta (req.params)
 */
export const obtenerProductoPorIdSchema = z.object({
  id: z.coerce.number().int().positive("El ID debe ser un número entero positivo")
});

/**
 * Esquema de validación para crear un producto (POST /productos) 🟩
 */
export const crearProductoSchema = z.object({
  nombre: z.string("El campo 'nombre' es obligatorio")
    .trim()
    .min(1, "El nombre no puede estar vacío"),
  descripcion: z.string().trim().min(1).optional().nullable(),
  precio: z.coerce.number("El campo 'precio' es obligatorio")
    .positive("El precio debe ser mayor a 0"),
  stock: z.coerce.number().int().nonnegative().optional().default(0),
  artesanoId: z.coerce.number("El 'artesanoId' es obligatorio para asociar el producto")
    .int()
    .positive()
});

/**
 * Esquema de validación para actualizar un producto (PUT /productos/:id) 🟩
 */
export const actualizarProductoSchema = z.object({
  nombre: z.string("El campo 'nombre' es obligatorio")
    .trim()
    .min(1, "El nombre no puede estar vacío"),
  descripcion: z.string().trim().min(1).optional().nullable(),
  precio: z.coerce.number("El campo 'precio' es obligatorio")
    .positive("El precio debe ser mayor a 0"),
  stock: z.coerce.number().int().nonnegative("El stock no puede ser negativo").optional(),
  artesanoId: z.coerce.number("El 'artesanoId' debe ser un número válido")
    .int()
    .positive()
    .optional()
});

/**
 * Esquema de validación para eliminar un producto (DELETE /productos/:id) 🟩
 * Valida el ID en los parámetros de ruta (req.params) 
 */
export const eliminarProductoSchema = z.object({
  id: z.coerce.number("El ID debe ser un número")
    .int("El ID debe ser un número entero")
    .positive("El ID debe ser un número entero positivo")
});


/**
 * Esquema de validación para listar productos (GET /productos)
 * Valida los parámetros de consulta (req.query) para paginación y filtros 🟥
 */
export const obtenerProductosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  nombre: z.string().trim().optional()
});
