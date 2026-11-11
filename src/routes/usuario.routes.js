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

router.post("/registro",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Registro público de usuario (adquiere rol ARTESANO por defecto)"
     #swagger.auto = false
     #swagger.security = []
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/RegistroUsuario" }
         }
       }
     }
     #swagger.responses[201] = {
       description: "Usuario registrado con éxito.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/UsuarioRespuesta" }
         }
       }
     }
     #swagger.responses[400] = { description: "Datos inválidos o campos incompletos." }
     #swagger.responses[409] = { description: "Ya existe un usuario con ese email." }
  */
  validarSchema(registrarUsuarioSchema, 'body'),
  postUsuario
);

router.post("/login",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Iniciar sesión (obtiene token JWT)"
     #swagger.auto = false
     #swagger.security = []
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/LoginUsuario" }
         }
       }
     }
     #swagger.responses[200] = {
       description: "Sesión iniciada con éxito.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/LoginRespuesta" }
         }
       }
     }
     #swagger.responses[400] = { description: "Formato de email o contraseña inválido." }
     #swagger.responses[401] = { description: "Credenciales inválidas o cuenta inactiva." }
  */
  validarSchema(iniciarSesionSchema, 'body'),
  iniciarSesion
);

// ──────────────────────────────────────────────────────
// RUTAS PROTEGIDAS (requieren JWT)
// ──────────────────────────────────────────────────────

router.get("/me",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Consultar perfil de la cuenta autenticada"
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.responses[200] = {
       description: "Datos de la cuenta autenticada.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/UsuarioRespuesta" }
         }
       }
     }
     #swagger.responses[401] = { description: "Token no proporcionado, inválido o revocado." }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  obtenerMiPerfil
);

router.post("/logout",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Cerrar sesión (revoca token JWT agregándolo a la lista negra)"
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.responses[204] = { description: "Sesión cerrada correctamente (sin contenido)." }
     #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
  */
  autenticarUsuario,
  cerrarSesion
);

// ──────────────────────────────────────────────────────
// RUTAS DE ADMINISTRACIÓN (requieren rol ADMINISTRADOR)
// ──────────────────────────────────────────────────────

const controlesAdmin = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ADMINISTRADOR")];

router.post("/registro-administrador",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Alta de cuenta con rol ADMINISTRADOR"
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/RegistroUsuario" }
         }
       }
     }
     #swagger.responses[201] = {
       description: "Administrador creado exitosamente.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/UsuarioRespuesta" }
         }
       }
     }
     #swagger.responses[400] = { description: "Datos inválidos." }
     #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
     #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
     #swagger.responses[409] = { description: "Ya existe un usuario con ese email." }
  */
  ...controlesAdmin,
  validarBody(registroAdminSchema),
  crearAdministrador
);

router.post("/:id/roles",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Asignar rol ADMINISTRADOR a un usuario existente"
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path",
       required: true,
       description: "UUID del usuario",
       "@schema": { type: "string", format: "uuid" }
     }
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/AsignarAdminBody" }
         }
       }
     }
     #swagger.responses[200] = { description: "Rol asignado correctamente." }
     #swagger.responses[400] = { description: "UUID inválido o rol inválido." }
     #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
     #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
     #swagger.responses[404] = { description: "Usuario no encontrado." }
  */
  ...controlesAdmin,
  validarParametros(uuidParamSchema),
  validarBody(asignarAdministradorSchema),
  agregarRol
);

router.delete("/:id/roles/:rol",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Retirar un rol a un usuario"
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path",
       required: true,
       description: "UUID del usuario",
       "@schema": { type: "string", format: "uuid" }
     }
     #swagger.parameters['rol'] = {
       in: "path",
       required: true,
       description: "Nombre del rol a retirar (ADMINISTRADOR o ARTESANO)",
       "@schema": { type: "string", enum: ["ADMINISTRADOR", "ARTESANO"] }
     }
     #swagger.responses[204] = { description: "Rol retirado correctamente (sin contenido)." }
     #swagger.responses[400] = { description: "Parámetros inválidos." }
     #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
     #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
     #swagger.responses[404] = { description: "Usuario no encontrado." }
     #swagger.responses[409] = { description: "Regla violada: debe conservar al menos 1 rol, o quedar al menos 1 admin activo, o tiene postulaciones." }
  */
  ...controlesAdmin,
  validarParametros(retirarRolParametrosSchema),
  eliminarRol
);

router.patch("/:id/activo",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Activar o desactivar cuenta de usuario"
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path",
       required: true,
       description: "UUID del usuario",
       "@schema": { type: "string", format: "uuid" }
     }
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ActualizarActivoBody" }
         }
       }
     }
     #swagger.responses[200] = { description: "Estado activo actualizado." }
     #swagger.responses[400] = { description: "UUID o body inválido." }
     #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
     #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
     #swagger.responses[404] = { description: "Usuario no encontrado." }
     #swagger.responses[409] = { description: "No se puede desactivar al último administrador activo." }
  */
  ...controlesAdmin,
  validarParametros(uuidParamSchema),
  validarBody(actualizarActivoSchema),
  actualizarActivo
);

export default router;
