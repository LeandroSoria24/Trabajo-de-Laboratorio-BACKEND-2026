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

import { cargarContextoUsuario } from "../middlewares/autorizacion.js";

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
router.get("/me", autenticarUsuario,
    cargarContextoUsuario, obtenerMiPerfil)
router.post("/logout", autenticarUsuario, cerrarSesion);

export default router;

router.post("/registro-administrador",
autenticarUsuario,
cargarContextoUsuario,
autorizarRoles("ADMINISTRADOR"),
validarBody(registroAdminSchema),
crearAdministrador
)

router.post("/asignar-participante",
autenticarUsuario,
cargarContextoUsuario,
autorizarRoles("ADMINISTRADOR"),
validarBody(asignarParticipanteSchema),
asociarParticipante
)