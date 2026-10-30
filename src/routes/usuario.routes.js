import { Router } from "express";
import {
    postUsuario,
    iniciarSesion,
    obtenerMiPerfil,
    crearAdministrador,
    actualizarActivo
} from '../controllers/usuario.controllers.js';
import { cerrarSesion } from "../controllers/sesiones.controllers.js";
import { agregarRol, eliminarRol } from "../controllers/roles.controllers.js";
import { validarSchema, validarBody, validarParametros } from '../middlewares/validarSchema.js';
import { autenticarUsuario } from "../middlewares/autenticarUsuario.js";
import { cargarContextoUsuario, autorizarRoles } from "../middlewares/autorizacion.js";
import {
    registrarUsuarioSchema,
    iniciarSesionSchema,
    registroAdminSchema
} from '../validators/usuario.schemas.js';
import { asignarAdministradorSchema, retirarRolParametrosSchema } from '../validators/roles.schemas.js';
import { actualizarActivoSchema } from '../validators/estado.schemas.js';
import { uuidParamSchema } from '../validators/comun.schemas.js';

const router = Router();

// ──────────────────────────────────────────────────────
// RUTAS PÚBLICAS (sin JWT)
// ──────────────────────────────────────────────────────

router.post("/registro", validarSchema(registrarUsuarioSchema, 'body'), postUsuario);
router.post("/login", validarSchema(iniciarSesionSchema, 'body'), iniciarSesion);

// ──────────────────────────────────────────────────────
// RUTAS PROTEGIDAS (requieren JWT)
// ──────────────────────────────────────────────────────

router.get("/me", autenticarUsuario, cargarContextoUsuario, obtenerMiPerfil);
router.post("/logout", autenticarUsuario, cerrarSesion);

// ──────────────────────────────────────────────────────
// RUTAS DE ADMINISTRACIÓN (requieren rol ADMINISTRADOR)
// ──────────────────────────────────────────────────────

const controlesAdmin = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ADMINISTRADOR")];

router.post("/registro-administrador",
    ...controlesAdmin,
    validarBody(registroAdminSchema),
    crearAdministrador
);

router.post("/:id/roles",
    ...controlesAdmin,
    validarParametros(uuidParamSchema),
    validarBody(asignarAdministradorSchema),
    agregarRol
);

router.delete("/:id/roles/:rol",
    ...controlesAdmin,
    validarParametros(retirarRolParametrosSchema),
    eliminarRol
);

router.patch("/:id/activo",
    ...controlesAdmin,
    validarParametros(uuidParamSchema),
    validarBody(actualizarActivoSchema),
    actualizarActivo
);

export default router;