import { Router } from "express";
import {
    getSectores,
    getSectorPorId,
    createSector,
    updateSector,
    deleteSector
} from '../controllers/sector.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { autenticarUsuario } from '../middlewares/autenticarUsuario.js';
import { cargarContextoUsuario, autorizarRoles } from '../middlewares/autorizacion.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearSectorSchema,
    actualizarSectorSchema,
    obtenerSectoresSchema
} from '../validators/sector.schemas.js';

const router = Router();

// Rutas públicas de consulta
router.get('/',
    /* #swagger.tags = ["Pabellones y Sectores"]
       #swagger.summary = "Listar sectores del predio ferial"
       #swagger.auto = false
       #swagger.security = []
       #swagger.parameters['nombre'] = { in: "query", description: "Filtrar por nombre", "@schema": { type: "string" } }
       #swagger.parameters['ordenarPor'] = { in: "query", description: "Campo de ordenamiento", "@schema": { type: "string", default: "nombre" } }
       #swagger.parameters['direccion'] = { in: "query", description: "Dirección (asc o desc)", "@schema": { type: "string", enum: ["asc", "desc"], default: "asc" } }
       #swagger.responses[200] = {
         description: "Listado de sectores.",
         content: {
           "application/json": {
             schema: {
               type: "array",
               items: { $ref: "#/components/schemas/SectorRespuesta" }
             }
           }
         }
       }
       #swagger.responses[400] = { description: "Parámetros inválidos." }
    */
    validarSchema(obtenerSectoresSchema, 'query'),
    getSectores
);

router.get('/:id',
    /* #swagger.tags = ["Pabellones y Sectores"]
       #swagger.summary = "Consultar sector por ID"
       #swagger.auto = false
       #swagger.security = []
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID numérico del sector",
         "@schema": { type: "integer" }
       }
       #swagger.responses[200] = {
         description: "Detalle del sector.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/SectorRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "ID inválido." }
       #swagger.responses[404] = { description: "Sector no encontrado." }
    */
    validarSchema(idParamSchema, 'params'),
    getSectorPorId
);

// Rutas de administración
const soloAdmin = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ADMINISTRADOR")];

router.post('/',
    /* #swagger.tags = ["Pabellones y Sectores"]
       #swagger.summary = "Crear un sector (Solo Administrador)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.requestBody = {
         required: true,
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/NuevoSector" }
           }
         }
       }
       #swagger.responses[201] = {
         description: "Sector creado con éxito.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/SectorRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "Datos inválidos." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
       #swagger.responses[409] = { description: "Ya existe un sector con ese nombre." }
    */
    ...soloAdmin,
    validarSchema(crearSectorSchema, 'body'),
    createSector
);

router.put('/:id',
    /* #swagger.tags = ["Pabellones y Sectores"]
       #swagger.summary = "Actualizar un sector (Solo Administrador)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID numérico del sector",
         "@schema": { type: "integer" }
       }
       #swagger.requestBody = {
         required: true,
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/ActualizarSector" }
           }
         }
       }
       #swagger.responses[200] = {
         description: "Sector actualizado con éxito.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/SectorRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "Datos inválidos." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
       #swagger.responses[404] = { description: "Sector no encontrado." }
       #swagger.responses[409] = { description: "Ya existe un sector con ese nombre." }
    */
    ...soloAdmin,
    validarSchema(idParamSchema, 'params'),
    validarSchema(actualizarSectorSchema, 'body'),
    updateSector
);

router.delete('/:id',
    /* #swagger.tags = ["Pabellones y Sectores"]
       #swagger.summary = "Eliminar un sector (Solo Administrador)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID numérico del sector",
         "@schema": { type: "integer" }
       }
       #swagger.responses[204] = { description: "Sector eliminado correctamente (sin contenido)." }
       #swagger.responses[400] = { description: "ID inválido." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ADMINISTRADOR." }
       #swagger.responses[404] = { description: "Sector no encontrado." }
       #swagger.responses[409] = { description: "No se puede eliminar un sector que tiene stands asignados." }
    */
    ...soloAdmin,
    validarSchema(idParamSchema, 'params'),
    deleteSector
);

export default router;
