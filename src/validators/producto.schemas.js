import { z } from "zod";







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
 * Esquema de validación para eliminar un producto (DELETE /productos/:id)
 * y para validar que exista un producto por ID (GET /productos/:id) 🟩
 * Valida el ID en los parámetros de ruta (req.params) 
 */
export const FiltrarProductoPorIDSchema = z.object({
  id: z.coerce.number("El ID debe ser un número")
    .int("El ID debe ser un número entero")
    .positive("El ID debe ser un número entero positivo")
});


/**
 * Esquema de validación para listar productos (GET /productos)
 * Valida los parámetros de consulta (req.query) para paginación y filtros 🟩
 */
export const obtenerProductosSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  nombre: z.string().trim().min(1).optional(),
  descripcion: z.string().trim().min(1).optional().nullable(),
  precio: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  artesanoId: z.coerce.number().int().positive().optional(),
  eliminado: z.preprocess(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()),
  ordenarPor: z.enum(["id", "nombre", "precio", "stock", "artesanoId"]).default("nombre"),
  direccion: z.enum(["asc", "desc"]).default("asc"),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(50).default(10)
});

