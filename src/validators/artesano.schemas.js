import { z } from "zod";

/*   eliminado: z.preprocess(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()).default(false), */

/*
  Esquema de validación para crear un artesano (POST /artesanos) 🟩
 */
export const crearArtesanoSchema = z.object({
  nombre: z.string("El campo 'nombre' es obligatorio")
    .trim()
    .min(1, "El nombre no puede estar vacío"),
  apellido: z.string("El campo 'apellido' es obligatorio")
    .trim()
    .min(1, "El apellido no puede estar vacío"),
  dni: z.string("El campo 'dni' es obligatorio")
    .trim()
    .min(1, "El DNI no puede estar vacío"),
  email: z.string("El campo 'email' es obligatorio")
    .trim()
    .email("El email debe tener un formato válido"),
  telefono: z.string().trim().min(1).optional().nullable(),
  localidadId: z.coerce.number("El campo 'localidadId' es obligatorio")
    .int("El ID de localidad debe ser un entero")
    .positive("Debe ingresar un ID de localidad válido"),
  rubro: z.string("El campo 'rubro' es obligatorio")
    .trim()
    .min(1, "El rubro no puede estar vacío"),
  nombreEmprendimiento: z.string("El campo 'nombreEmprendimiento' es obligatorio")
    .trim()
    .min(1, "El nombre del emprendimiento no puede estar vacío"),
  descripcionTrayectoria: z.string().trim().min(1).optional().nullable(),
  usuarioId: z.coerce.number().int().positive().optional().nullable(),
  activo: z.boolean().optional().default(true)
});

/*
  Esquema de validación para actualizar un artesano (PUT /artesanos/:id) 🟩
 */
export const actualizarArtesanoSchema = z.object({
  nombre: z.string("El campo 'nombre' debe ser un texto")
    .trim()
    .min(1, "El nombre no puede estar vacío")
    .optional(),
  apellido: z.string("El campo 'apellido' debe ser un texto")
    .trim()
    .min(1, "El apellido no puede estar vacío")
    .optional(),
  dni: z.string("El campo 'dni' debe ser un texto")
    .trim()
    .min(1, "El DNI no puede estar vacío")
    .optional(),
  email: z.string("El campo 'email' debe ser un texto")
    .trim()
    .email("El email debe tener un formato válido")
    .optional(),
  telefono: z.string().trim().min(1).optional().nullable(),
  localidadId: z.coerce.number().int().positive("ID de localidad inválido").optional(),
  rubro: z.string("El campo 'rubro' debe ser un texto")
    .trim()
    .min(1, "El rubro no puede estar vacío")
    .optional(),
  nombreEmprendimiento: z.string("El campo 'nombreEmprendimiento' debe ser un texto")
    .trim()
    .min(1, "El nombre del emprendimiento no puede estar vacío")
    .optional(),
  descripcionTrayectoria: z.string().trim().min(1).optional().nullable(),
  usuarioId: z.coerce.number().int().positive().optional().nullable(),
  activo: z.boolean().optional()
});

/*
  Esquema de validación para listar artesanos (GET /artesanos)
  Valida los parámetros de consulta (req.query) para paginación y filtros 🟩
 */
export const obtenerArtesanosSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  nombre: z.string().trim().min(1).optional(),
  apellido: z.string().trim().min(1).optional(),
  dni: z.string().trim().min(1).optional(),
  email: z.string().trim().min(1).optional(),
  telefono: z.string().trim().min(1).optional(),
  localidadId: z.coerce.number().int().positive().optional(),
  rubro: z.string().trim().min(1).optional(),
  nombreEmprendimiento: z.string().trim().min(1).optional(),
  activo: z.preprocess(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()).default(true),
  ordenarPor: z.enum(["id", "nombre", "apellido", "dni", "email", "localidadId", "rubro", "nombreEmprendimiento"]).default("nombre"),
  direccion: z.enum(["asc", "desc"]).default("asc"),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(50).default(10)
});
