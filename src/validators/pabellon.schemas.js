import { z } from "zod";

/*
  Esquema para crear un Pabellón (POST /pabellones)
*/
export const crearPabellonSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre del pabellón debe tener al menos 3 caracteres")
    .max(100, "El nombre del pabellón no puede superar los 100 caracteres")
});

/*
  Esquema para actualizar un Pabellón (PUT /pabellones/:id)
*/
export const actualizarPabellonSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre del pabellón debe tener al menos 3 caracteres")
    .max(100, "El nombre del pabellón no puede superar los 100 caracteres")
});

/*
  Esquema para listar/filtrar Pabellones (GET /pabellones)
*/
export const obtenerPabellonesSchema = z.object({
  nombre: z.string().trim().optional(),
  ordenarPor: z.enum(["id", "nombre", "createdAt"]).default("nombre"),
  direccion: z.enum(["asc", "desc"]).default("asc")
});
