import { Router } from "express";
import {
    postCrearMiSolicitud,
    getMisSolicitudes,
    patchCancelarMiSolicitud,
    getTodasSolicitudes,
    patchEvaluarSolicitud,
    patchAsignarStand
} from '../controllers/solicitud.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { autenticarUsuario } from '../middlewares/autenticarUsuario.js';
import { cargarContextoUsuario, autorizarRoles } from '../middlewares/autorizacion.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearSolicitudSchema,
    evaluarSolicitudSchema,
    asignarStandSolicitudSchema,
    filtrarSolicitudesSchema
} from '../validators/solicitud.schemas.js';

const router = Router();

const soloArtesano = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ARTESANO")];
const soloAdmin = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ADMINISTRADOR")];

// ──────────────────────────────────────────────────────
// GESTIÓN DEL ARTESANO (Recursos propios)
// ⚠️ /me debe ir antes de /:id
// ──────────────────────────────────────────────────────

router.get('/me',
    /* #swagger.tags = ["Solicitudes de Postulación"]
       #swagger.summary = "Consultar estado de las postulaciones propias del artesano"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.responses[200] = {
         description: "Listado de postulaciones propias.",
         content: {
           "application/json": {
             schema: {
               type: "array",
               items: { $ref: "#/components/schemas/SolicitudRespuesta" }
             }
           }
         }
       }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ARTESANO." }
    */
    ...soloArtesano,
    getMisSolicitudes
);

router.post('/',
    /* #swagger.tags = ["Solicitudes de Postulación"]
       #swagger.summary = "Presentar postulación para participar en la fiesta (estado PENDIENTE)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.requestBody = {
         required: true,
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/NuevaSolicitud" }
           }
         }
       }
       #swagger.responses[201] = {
         description: "Postulación presentada con éxito.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/SolicitudRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "Datos inválidos." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ARTESANO." }
       #swagger.responses[409] = { description: "El artesano ya tiene una solicitud en curso (PENDIENTE, EN_REVISION o APROBADA)." }
    */
    ...soloArtesano,
    validarSchema(crearSolicitudSchema, 'body'),
    postCrearMiSolicitud
);

router.patch('/:id/cancelar',
    /* #swagger.tags = ["Solicitudes de Postulación"]
       #swagger.summary = "Cancelar postulación propia (si está en estado PENDIENTE)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID de la postulación",
         "@schema": { type: "integer" }
       }
       #swagger.responses[200] = {
         description: "Postulación cancelada con éxito.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/SolicitudRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "ID inválido." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "No tiene permiso sobre esta solicitud." }
       #swagger.responses[404] = { description: "Solicitud no encontrada." }
       #swagger.responses[409] = { description: "Solo se pueden cancelar solicitudes en estado PENDIENTE." }
    */
    ...soloArtesano,
    validarSchema(idParamSchema, 'params'),
    patchCancelarMiSolicitud
);

// ──────────────────────────────────────────────────────
// GESTIÓN DE ADMINISTRACIÓN (Auditoría, evaluación y stands)
// ──────────────────────────────────────────────────────

router.get('/',
    /* #swagger.tags = ["Solicitudes de Postulación"]
       #swagger.summary = "Auditoría global: listar todas las postulaciones (Solo Administrador)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.parameters['pagina'] = { in: "query", description: "Número de página", "@schema": { type: "integer", default: 1 } }
       #swagger.parameters['limite'] = { in: "query", description: "Elementos por página (máx 50)", "@schema": { type: "integer", default: 10 } }
       #swagger.parameters['estado'] = { in: "query", description: "Filtrar por estado", "@schema": { type: "string", enum: ["PENDIENTE", "EN_REVISION", "APROBADA", "RECHAZADA", "CANCELADA"] } }
       #swagger.parameters['artesanoId'] = { in: "query", description: "Filtrar por ID de artesano", "@schema": { type: "integer" } }
       #swagger.responses[200] = {
         description: "Listado de todas las postulaciones.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/ListadoSolicitudes" }
           }
         }
       }
       #swagger.responses[400] = { description: "Parámetros inválidos." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
    */
    ...soloAdmin,
    validarSchema(filtrarSolicitudesSchema, 'query'),
    getTodasSolicitudes
);

router.patch('/:id/evaluar',
    /* #swagger.tags = ["Solicitudes de Postulación"]
       #swagger.summary = "Dictaminar postulación (APROBADA o RECHAZADA) (Solo Administrador)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID de la postulación",
         "@schema": { type: "integer" }
       }
       #swagger.requestBody = {
         required: true,
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/EvaluarSolicitud" }
           }
         }
       }
       #swagger.responses[200] = {
         description: "Postulación evaluada con éxito (al aprobar activa al artesano automáticamente).",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/SolicitudRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "Datos inválidos." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
       #swagger.responses[404] = { description: "Solicitud no encontrada." }
       #swagger.responses[409] = { description: "La solicitud no se encuentra en estado PENDIENTE." }
    */
    ...soloAdmin,
    validarSchema(idParamSchema, 'params'),
    validarSchema(evaluarSolicitudSchema, 'body'),
    patchEvaluarSolicitud
);

router.patch('/:id/asignar-stand',
    /* #swagger.tags = ["Solicitudes de Postulación"]
       #swagger.summary = "Asignar stand a una postulación aprobada (Solo Administrador)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID de la postulación",
         "@schema": { type: "integer" }
       }
       #swagger.requestBody = {
         required: false,
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/AsignarStandSolicitud" }
           }
         }
       }
       #swagger.responses[200] = {
         description: "Stand asignado con éxito a la postulación.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/SolicitudRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "Parámetros inválidos." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
       #swagger.responses[404] = { description: "Solicitud o stand no encontrado." }
       #swagger.responses[409] = { description: "La solicitud debe estar APROBADA o el stand no está disponible." }
    */
    ...soloAdmin,
    validarSchema(idParamSchema, 'params'),
    validarSchema(asignarStandSolicitudSchema, 'body'),
    patchAsignarStand
);

export default router;
