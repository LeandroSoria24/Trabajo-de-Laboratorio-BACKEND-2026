import { Router } from "express";
import {
    getStands,
    getStandPorId,
    createStand,
    updateStand,
    patchAsignarArtesano,
    patchLiberarStand,
    deleteStand
} from '../controllers/stand.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { autenticarUsuario } from '../middlewares/autenticarUsuario.js';
import { cargarContextoUsuario, autorizarRoles } from '../middlewares/autorizacion.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearStandSchema,
    actualizarStandSchema,
    obtenerStandsSchema,
    asignarArtesanoSchema
} from '../validators/stand.schemas.js';

const router = Router();

// ──────────────────────────────────────────────────────
// RUTAS PÚBLICAS (Visitantes y consulta de catálogo)
// ──────────────────────────────────────────────────────

router.get('/',
    /* #swagger.tags = ["Stands"]
       #swagger.summary = "Listar stands con paginación y filtros"
       #swagger.auto = false
       #swagger.security = []
       #swagger.parameters['pagina'] = { in: "query", description: "Número de página", "@schema": { type: "integer", default: 1 } }
       #swagger.parameters['limite'] = { in: "query", description: "Elementos por página (máx 50)", "@schema": { type: "integer", default: 10 } }
       #swagger.parameters['estado'] = { in: "query", description: "Filtrar por estado", "@schema": { type: "string", enum: ["DISPONIBLE", "OCUPADO", "MANTENIMIENTO"] } }
       #swagger.parameters['pabellonId'] = { in: "query", description: "Filtrar por ID de pabellón", "@schema": { type: "integer" } }
       #swagger.parameters['sectorId'] = { in: "query", description: "Filtrar por ID de sector", "@schema": { type: "integer" } }
       #swagger.responses[200] = {
         description: "Listado de stands.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/ListadoStands" }
           }
         }
       }
       #swagger.responses[400] = { description: "Parámetros inválidos." }
    */
    validarSchema(obtenerStandsSchema, 'query'),
    getStands
);

router.get('/:id',
    /* #swagger.tags = ["Stands"]
       #swagger.summary = "Consultar stand por ID"
       #swagger.auto = false
       #swagger.security = []
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID numérico del stand",
         "@schema": { type: "integer" }
       }
       #swagger.responses[200] = {
         description: "Detalle del stand.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/StandRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "ID inválido." }
       #swagger.responses[404] = { description: "Stand no encontrado." }
    */
    validarSchema(idParamSchema, 'params'),
    getStandPorId
);

// ──────────────────────────────────────────────────────
// RUTAS PROTEGIDAS - SOLO ADMINISTRADOR
// ──────────────────────────────────────────────────────

const soloAdmin = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ADMINISTRADOR")];

router.post('/',
    /* #swagger.tags = ["Stands"]
       #swagger.summary = "Crear un stand ferial (Solo Administrador)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.requestBody = {
         required: true,
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/NuevoStand" }
           }
         }
       }
       #swagger.responses[201] = {
         description: "Stand creado con éxito.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/StandRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "Datos inválidos o pabellón/sector inexistente." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
       #swagger.responses[409] = { description: "El código de stand ya existe o el artesano ya tiene un stand." }
    */
    ...soloAdmin,
    validarSchema(crearStandSchema, 'body'),
    createStand
);

router.put('/:id',
    /* #swagger.tags = ["Stands"]
       #swagger.summary = "Actualizar datos de un stand (Solo Administrador)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID numérico del stand",
         "@schema": { type: "integer" }
       }
       #swagger.requestBody = {
         required: true,
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/ActualizarStand" }
           }
         }
       }
       #swagger.responses[200] = {
         description: "Stand actualizado con éxito.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/StandRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "Datos inválidos." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
       #swagger.responses[404] = { description: "Stand no encontrado." }
       #swagger.responses[409] = { description: "Conflicto con código o artesano asignado." }
    */
    ...soloAdmin,
    validarSchema(idParamSchema, 'params'),
    validarSchema(actualizarStandSchema, 'body'),
    updateStand
);

router.patch('/:id/asignar-artesano',
    /* #swagger.tags = ["Stands"]
       #swagger.summary = "Asignar un artesano al stand (Solo Administrador)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID numérico del stand",
         "@schema": { type: "integer" }
       }
       #swagger.requestBody = {
         required: true,
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/AsignarArtesanoStand" }
           }
         }
       }
       #swagger.responses[200] = {
         description: "Artesano asignado al stand con éxito.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/StandRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "Parámetros inválidos." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
       #swagger.responses[404] = { description: "Stand o artesano no encontrado." }
       #swagger.responses[409] = { description: "El stand ya está ocupado o el artesano ya tiene un stand asignado." }
    */
    ...soloAdmin,
    validarSchema(idParamSchema, 'params'),
    validarSchema(asignarArtesanoSchema, 'body'),
    patchAsignarArtesano
);

router.patch('/:id/liberar',
    /* #swagger.tags = ["Stands"]
       #swagger.summary = "Liberar stand desvinculando al artesano (Solo Administrador)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID numérico del stand",
         "@schema": { type: "integer" }
       }
       #swagger.responses[200] = {
         description: "Stand liberado con éxito (pasa a DISPONIBLE).",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/StandRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "ID inválido." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
       #swagger.responses[404] = { description: "Stand no encontrado." }
    */
    ...soloAdmin,
    validarSchema(idParamSchema, 'params'),
    patchLiberarStand
);

router.delete('/:id',
    /* #swagger.tags = ["Stands"]
       #swagger.summary = "Eliminar stand físico (Solo Administrador)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID numérico del stand",
         "@schema": { type: "integer" }
       }
       #swagger.responses[204] = { description: "Stand eliminado correctamente (sin contenido)." }
       #swagger.responses[400] = { description: "ID inválido." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
       #swagger.responses[404] = { description: "Stand no encontrado." }
       #swagger.responses[409] = { description: "No se puede eliminar un stand que tiene un artesano asignado o postulaciones." }
    */
    ...soloAdmin,
    validarSchema(idParamSchema, 'params'),
    deleteStand
);

export default router;
