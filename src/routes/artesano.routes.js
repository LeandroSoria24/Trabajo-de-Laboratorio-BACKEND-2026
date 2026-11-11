import { Router } from "express";
import {
  getArtesanos,
  getArtesanoPorId,
  getMiPerfil,
  postCompletarPerfil,
  putMiPerfil,
  createArtesano,
  updateArtesano,
  patchActivoArtesano,
  deleteArtesano
} from '../controllers/artesano.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { autenticarUsuario } from '../middlewares/autenticarUsuario.js';
import { cargarContextoUsuario, autorizarRoles } from '../middlewares/autorizacion.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
  crearArtesanoSchema,
  actualizarArtesanoSchema,
  obtenerArtesanosSchema,
  completarPerfilArtesanoSchema,
  actualizarMiPerfilArtesanoSchema
} from '../validators/artesano.schemas.js';
import { actualizarActivoSchema } from '../validators/estado.schemas.js';

const router = Router();

const soloArtesano = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ARTESANO")];
const soloAdmin = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ADMINISTRADOR")];

// ──────────────────────────────────────────────────────
// GESTIÓN DEL PROPIO PERFIL (Artesano Autenticado)
// ⚠️ IMPORTANTE: '/me' debe ir antes de '/:id' para que Express no lo tome como ID numérico
// ──────────────────────────────────────────────────────

router.get('/me',
  /* #swagger.tags = ["Artesanos"]
     #swagger.summary = "Consultar perfil comercial propio del artesano"
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.responses[200] = {
       description: "Perfil comercial del artesano autenticado.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ArtesanoRespuesta" }
         }
       }
     }
     #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
     #swagger.responses[403] = { description: "Requiere rol ARTESANO." }
     #swagger.responses[404] = { description: "Aún no ha completado su perfil de artesano." }
  */
  ...soloArtesano,
  getMiPerfil
);

router.post('/me',
  /* #swagger.tags = ["Artesanos"]
     #swagger.summary = "Completar perfil de artesano vinculado a la cuenta"
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/CompletarPerfilArtesano" }
         }
       }
     }
     #swagger.responses[201] = {
       description: "Perfil de artesano completado con éxito.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ArtesanoRespuesta" }
         }
       }
     }
     #swagger.responses[400] = { description: "Campos inválidos o localidad inexistente." }
     #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
     #swagger.responses[403] = { description: "Requiere rol ARTESANO." }
     #swagger.responses[409] = { description: "El usuario ya tiene un perfil o el DNI ya está registrado." }
  */
  ...soloArtesano,
  validarSchema(completarPerfilArtesanoSchema, 'body'),
  postCompletarPerfil
);

router.put('/me',
  /* #swagger.tags = ["Artesanos"]
     #swagger.summary = "Modificar datos del propio perfil de artesano"
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ActualizarMiPerfilArtesano" }
         }
       }
     }
     #swagger.responses[200] = {
       description: "Perfil actualizado con éxito.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ArtesanoRespuesta" }
         }
       }
     }
     #swagger.responses[400] = { description: "Datos inválidos." }
     #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
     #swagger.responses[403] = { description: "Requiere rol ARTESANO." }
     #swagger.responses[404] = { description: "Perfil de artesano no encontrado." }
  */
  ...soloArtesano,
  validarSchema(actualizarMiPerfilArtesanoSchema, 'body'),
  putMiPerfil
);

// ──────────────────────────────────────────────────────
// CONSULTA PÚBLICA (Visitantes y catálogo)
// ──────────────────────────────────────────────────────

router.get('/',
  /* #swagger.tags = ["Artesanos"]
     #swagger.summary = "Listar artesanos con paginación y filtros"
     #swagger.auto = false
     #swagger.security = []
     #swagger.parameters['pagina'] = { in: "query", description: "Número de página", "@schema": { type: "integer", default: 1 } }
     #swagger.parameters['limite'] = { in: "query", description: "Elementos por página (máx 50)", "@schema": { type: "integer", default: 10 } }
     #swagger.parameters['nombre'] = { in: "query", description: "Filtrar por nombre", "@schema": { type: "string" } }
     #swagger.parameters['rubro'] = { in: "query", description: "Filtrar por rubro", "@schema": { type: "string" } }
     #swagger.parameters['localidadId'] = { in: "query", description: "Filtrar por ID de localidad", "@schema": { type: "integer" } }
     #swagger.parameters['ordenarPor'] = { in: "query", description: "Campo de ordenamiento", "@schema": { type: "string", default: "nombre" } }
     #swagger.parameters['direccion'] = { in: "query", description: "Dirección (asc o desc)", "@schema": { type: "string", enum: ["asc", "desc"], default: "asc" } }
     #swagger.responses[200] = {
       description: "Listado paginado de artesanos.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ListadoArtesanos" }
         }
       }
     }
     #swagger.responses[400] = { description: "Parámetros de búsqueda inválidos." }
  */
  validarSchema(obtenerArtesanosSchema, 'query'),
  getArtesanos
);

router.get('/:id',
  /* #swagger.tags = ["Artesanos"]
     #swagger.summary = "Consultar artesano por ID"
     #swagger.auto = false
     #swagger.security = []
     #swagger.parameters['id'] = {
       in: "path",
       required: true,
       description: "ID numérico del artesano",
       "@schema": { type: "integer" }
     }
     #swagger.responses[200] = {
       description: "Detalle del artesano.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ArtesanoRespuesta" }
         }
       }
     }
     #swagger.responses[400] = { description: "ID inválido." }
     #swagger.responses[404] = { description: "Artesano no encontrado." }
  */
  validarSchema(idParamSchema, 'params'),
  getArtesanoPorId
);

// ──────────────────────────────────────────────────────
// ADMINISTRACIÓN DE ARTESANOS (Solo ADMINISTRADOR)
// ──────────────────────────────────────────────────────

router.post('/',
  /* #swagger.tags = ["Artesanos"]
     #swagger.summary = "Alta de perfil de artesano (Administrador)"
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/CrearArtesanoAdmin" }
         }
       }
     }
     #swagger.responses[201] = {
       description: "Artesano creado con éxito.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ArtesanoRespuesta" }
         }
       }
     }
     #swagger.responses[400] = { description: "Datos inválidos." }
     #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
     #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
     #swagger.responses[409] = { description: "El DNI o email ya está registrado o el usuario ya tiene perfil." }
  */
  ...soloAdmin,
  validarSchema(crearArtesanoSchema, 'body'),
  createArtesano
);

router.put('/:id',
  /* #swagger.tags = ["Artesanos"]
     #swagger.summary = "Actualizar perfil de artesano (Administrador)"
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path",
       required: true,
       description: "ID numérico del artesano",
       "@schema": { type: "integer" }
     }
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ActualizarArtesanoAdmin" }
         }
       }
     }
     #swagger.responses[200] = {
       description: "Artesano actualizado con éxito.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ArtesanoRespuesta" }
         }
       }
     }
     #swagger.responses[400] = { description: "Datos inválidos." }
     #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
     #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
     #swagger.responses[404] = { description: "Artesano no encontrado." }
  */
  ...soloAdmin,
  validarSchema(idParamSchema, 'params'),
  validarSchema(actualizarArtesanoSchema, 'body'),
  updateArtesano
);

router.patch('/:id/activo',
  /* #swagger.tags = ["Artesanos"]
     #swagger.summary = "Habilitar o inhabilitar artesano (Administrador)"
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path",
       required: true,
       description: "ID numérico del artesano",
       "@schema": { type: "integer" }
     }
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ActualizarActivoBody" }
         }
       }
     }
     #swagger.responses[200] = { description: "Estado activo actualizado correctamente." }
     #swagger.responses[400] = { description: "Parámetros inválidos." }
     #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
     #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
     #swagger.responses[404] = { description: "Artesano no encontrado." }
  */
  ...soloAdmin,
  validarSchema(idParamSchema, 'params'),
  validarSchema(actualizarActivoSchema, 'body'),
  patchActivoArtesano
);

router.delete('/:id',
  /* #swagger.tags = ["Artesanos"]
     #swagger.summary = "Baja lógica del artesano (activo = false)"
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path",
       required: true,
       description: "ID numérico del artesano",
       "@schema": { type: "integer" }
     }
     #swagger.responses[200] = { description: "Baja lógica realizada (activo = false)." }
     #swagger.responses[400] = { description: "ID inválido o el artesano ya se encuentra inactivo." }
     #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
     #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
     #swagger.responses[404] = { description: "Artesano no encontrado." }
  */
  ...soloAdmin,
  validarSchema(idParamSchema, 'params'),
  deleteArtesano
);

export default router;
