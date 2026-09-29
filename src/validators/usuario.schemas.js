import { z } from "zod";
import { RolUsuarioEnum } from "./comun.schemas.js";
/* 🟥 */
export const crearUsuarioSchema = z.object({
  email: z.string("El email es obligatorio")
    .trim()
    .email("El email debe tener un formato válido"),
  password: z.string("La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: RolUsuarioEnum.optional().default("VISITANTE"),
  activo: z.boolean().optional().default(true)
});

export const actualizarUsuarioSchema = z.object({
  email: z.string().trim().email("El email debe tener un formato válido").optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  rol: RolUsuarioEnum.optional(),
  activo: z.boolean().optional()
});

export const obtenerUsuariosSchema = z.object({
  email: z.string().trim().min(1).optional(),
  rol: RolUsuarioEnum.optional(),
  activo: z.preprocess(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()).default(true),
  ordenarPor: z.enum(["id", "email", "rol", "createdAt"]).default("createdAt"),
  direccion: z.enum(["asc", "desc"]).default("desc"),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(50).default(10)
});
