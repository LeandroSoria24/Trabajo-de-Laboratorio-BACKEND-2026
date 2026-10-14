import { Router } from "express";
import {
    postUsuario,
    iniciarSesion,
    obtenerMiPerfil,
    registrarUsuarioParticipante
} from '../controllers/usuario.controllers.js';
import { cerrarSesion } from "../controllers/sesiones.controllers.js";
import { validarSchema } from '../middlewares/validarSchema.js';
import { autenticarUsuario } from "../middlewares/autenticarUsuario.js";
import {
    registrarUsuarioSchema,
    iniciarSesionSchema,
    registroParticipanteSchema
} from '../validators/usuario.schemas.js';

const router = Router();

// Rutas públicas de autenticación y registro
router.post("/registro", validarSchema(registrarUsuarioSchema, 'body'), postUsuario);
router.post("/login", validarSchema(iniciarSesionSchema, 'body'), iniciarSesion);
router.post(
    "/registro-participante",
    validarSchema(registroParticipanteSchema, 'body'),
    registrarUsuarioParticipante
);

// Rutas protegidas (requieren token JWT)
router.get("/me", autenticarUsuario, obtenerMiPerfil);
router.post("/logout", autenticarUsuario, cerrarSesion);

export default router;