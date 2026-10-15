import { z } from "zod";

/*
  Esquema de validación para completar el propio perfil de artesano (POST /artesanos/me)
 */
export const completarPerfilArtesanoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre no puede estar vacío"),
  apellido: z.string().trim().min(1, "El apellido no puede estar vacío"),
  dni: z.string().trim().min(1, "El DNI no puede estar vacío"),
  telefono: z.string().trim().min(1).optional().nullable(),
  localidadId: z.coerce.number().int().positive("Debe ingresar un ID de localidad válido"),
  rubro: z.string().trim().min(1, "El rubro no puede estar vacío"),
  nombreEmprendimiento: z.string().trim().min(1, "El nombre del emprendimiento no puede estar vacío"),
  descripcionTrayectoria: z.string().trim().min(1).optional().nullable()
}).strict();

/*
  Esquema para modificar los propios datos de artesano (PUT /artesanos/me)
 */
export const actualizarMiPerfilArtesanoSchema = completarPerfilArtesanoSchema.partial();

/*
  Esquema de validación para crear un artesano como administrador (POST /artesanos)
 */
export const crearArtesanoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre no puede estar vacío"),
  apellido: z.string().trim().min(1, "El apellido no puede estar vacío"),
  dni: z.string().trim().min(1, "El DNI no puede estar vacío"),
  email: z.string().trim().email("El email debe tener un formato válido"),
  telefono: z.string().trim().min(1).optional().nullable(),
  localidadId: z.coerce.number().int().positive("Debe ingresar un ID de localidad válido"),
  rubro: z.string().trim().min(1, "El rubro no puede estar vacío"),
  nombreEmprendimiento: z.string().trim().min(1, "El nombre del emprendimiento no puede estar vacío"),
  descripcionTrayectoria: z.string().trim().min(1).optional().nullable(),
  usuarioId: z.string().uuid("El usuarioId debe ser un UUID válido"),
  activo: z.boolean().optional().default(false)
});

/*
  Esquema de validación para actualizar un artesano (PUT /artesanos/:id)
 */
export const actualizarArtesanoSchema = z.object({
  nombre: z.string().trim().min(1).optional(),
  apellido: z.string().trim().min(1).optional(),
  dni: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  telefono: z.string().trim().min(1).optional().nullable(),
  localidadId: z.coerce.number().int().positive().optional(),
  rubro: z.string().trim().min(1).optional(),
  nombreEmprendimiento: z.string().trim().min(1).optional(),
  descripcionTrayectoria: z.string().trim().min(1).optional().nullable(),
  usuarioId: z.string().uuid().optional(),
  activo: z.boolean().optional()
});

/*
  Esquema de validación para listar artesanos (GET /artesanos)
 */
export const obtenerArtesanosSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  nombre: z.string().trim().min(1).optional(),
  apellido: z.string().trim().min(1).optional(),
  dni: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
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
