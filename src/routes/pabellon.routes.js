import { Router } from "express";
import {
    getPabellones,
    getPabellonPorId,
    createPabellon,
    updatePabellon,
    deletePabellon
} from '../controllers/pabellon.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { autenticarUsuario } from '../middlewares/autenticarUsuario.js';
import { cargarContextoUsuario, autorizarRoles } from '../middlewares/autorizacion.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearPabellonSchema,
    actualizarPabellonSchema,
    obtenerPabellonesSchema
} from '../validators/pabellon.schemas.js';

const router = Router();

// Rutas públicas de consulta
router.get('/',
    /* #swagger.tags = ["Pabellones y Sectores"]
       #swagger.summary = "Listar pabellones del predio ferial"
       #swagger.auto = false
       #swagger.security = []
       #swagger.parameters['nombre'] = { in: "query", description: "Filtrar por nombre", "@schema": { type: "string" } }
       #swagger.parameters['ordenarPor'] = { in: "query", description: "Campo de ordenamiento", "@schema": { type: "string", default: "nombre" } }
       #swagger.parameters['direccion'] = { in: "query", description: "Dirección (asc o desc)", "@schema": { type: "string", enum: ["asc", "desc"], default: "asc" } }
       #swagger.responses[200] = {
         description: "Listado de pabellones.",
         content: {
           "application/json": {
             schema: {
               type: "array",
               items: { $ref: "#/components/schemas/PabellonRespuesta" }
             }
           }
         }
       }
       #swagger.responses[400] = { description: "Parámetros inválidos." }
    */
    validarSchema(obtenerPabellonesSchema, 'query'),
    getPabellones
);

router.get('/:id',
    /* #swagger.tags = ["Pabellones y Sectores"]
       #swagger.summary = "Consultar pabellón por ID"
       #swagger.auto = false
       #swagger.security = []
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID numérico del pabellón",
         "@schema": { type: "integer" }
       }
       #swagger.responses[200] = {
         description: "Detalle del pabellón.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/PabellonRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "ID inválido." }
       #swagger.responses[404] = { description: "Pabellón no encontrado." }
    */
    validarSchema(idParamSchema, 'params'),
    getPabellonPorId
);

// Rutas de administración
const soloAdmin = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ADMINISTRADOR")];

router.post('/',
    /* #swagger.tags = ["Pabellones y Sectores"]
       #swagger.summary = "Crear un pabellón (Solo Administrador)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.requestBody = {
         required: true,
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/NuevoPabellon" }
           }
         }
       }
       #swagger.responses[201] = {
         description: "Pabellón creado con éxito.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/PabellonRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "Datos inválidos." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
       #swagger.responses[409] = { description: "Ya existe un pabellón con ese nombre." }
    */
    ...soloAdmin,
    validarSchema(crearPabellonSchema, 'body'),
    createPabellon
);

router.put('/:id',
    /* #swagger.tags = ["Pabellones y Sectores"]
       #swagger.summary = "Actualizar un pabellón (Solo Administrador)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID numérico del pabellón",
         "@schema": { type: "integer" }
       }
       #swagger.requestBody = {
         required: true,
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/ActualizarPabellon" }
           }
         }
       }
       #swagger.responses[200] = {
         description: "Pabellón actualizado con éxito.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/PabellonRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "Datos inválidos." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
       #swagger.responses[404] = { description: "Pabellón no encontrado." }
       #swagger.responses[409] = { description: "Ya existe un pabellón con ese nombre." }
    */
    ...soloAdmin,
    validarSchema(idParamSchema, 'params'),
    validarSchema(actualizarPabellonSchema, 'body'),
    updatePabellon
);

router.delete('/:id',
    /* #swagger.tags = ["Pabellones y Sectores"]
       #swagger.summary = "Eliminar un pabellón (Solo Administrador)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID numérico del pabellón",
         "@schema": { type: "integer" }
       }
       #swagger.responses[204] = { description: "Pabellón eliminado correctamente (sin contenido)." }
       #swagger.responses[400] = { description: "ID inválido." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
       #swagger.responses[404] = { description: "Pabellón no encontrado." }
       #swagger.responses[409] = { description: "No se puede eliminar un pabellón que tiene stands asignados." }
    */
    ...soloAdmin,
    validarSchema(idParamSchema, 'params'),
    deletePabellon
);

export default router;
