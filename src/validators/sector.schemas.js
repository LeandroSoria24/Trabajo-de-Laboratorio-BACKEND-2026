import { z } from "zod";

/*
  Esquema para crear un Sector (POST /sectores)
*/
export const crearSectorSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre del sector debe tener al menos 2 caracteres")
    .max(100, "El nombre del sector no puede superar los 100 caracteres")
});

/*
  Esquema para actualizar un Sector (PUT /sectores/:id)
*/
export const actualizarSectorSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre del sector debe tener al menos 2 caracteres")
    .max(100, "El nombre del sector no puede superar los 100 caracteres")
});

/*
  Esquema para listar/filtrar Sectores (GET /sectores)
*/
export const obtenerSectoresSchema = z.object({
  nombre: z.string().trim().optional(),
  ordenarPor: z.enum(["id", "nombre", "createdAt"]).default("nombre"),
  direccion: z.enum(["asc", "desc"]).default("asc")
});
