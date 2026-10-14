import { z } from "zod";

export const registrarUsuarioSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Debe tener al menos 2 caracteres."),
  email: z.email("El email no tiene un formato válido."),
  password: z
    .string()
    .min(8, "Debe tener al menos 8 caracteres.")
});

export const iniciarSesionSchema = z.object({
  email: z.email("El email no tiene un formato válido."),
  password: z
    .string()
    .min(8, "Debe tener al menos 8 caracteres.")
});

export const participanteSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  dni: z.string().trim().regex(/^\d{7,8}$/),
  direccion: z.string().trim().min(5).max(200)
}).strict();

export const registroParticipanteSchema =
  registrarUsuarioSchema.extend({
    nombre: participanteSchema.shape.nombre,
    dni: participanteSchema.shape.dni,
    direccion: participanteSchema.shape.direccion
  }).strict();