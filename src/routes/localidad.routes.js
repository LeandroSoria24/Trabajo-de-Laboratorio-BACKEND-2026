import { Router } from "express";
import {
    getLocalidades,
    getLocalidadPorId
} from '../controllers/localidad.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import { obtenerLocalidadesSchema } from '../validators/localidad.schemas.js';

const router = Router();

router.get('/',
    /* #swagger.tags = ["Localidades"]
       #swagger.summary = "Listar localidades de Catamarca"
       #swagger.auto = false
       #swagger.security = []
       #swagger.parameters['nombre'] = { in: "query", description: "Filtrar por nombre", "@schema": { type: "string" } }
       #swagger.parameters['ordenarPor'] = { in: "query", description: "Campo de ordenamiento", "@schema": { type: "string", default: "nombre" } }
       #swagger.parameters['direccion'] = { in: "query", description: "Dirección (asc o desc)", "@schema": { type: "string", enum: ["asc", "desc"], default: "asc" } }
       #swagger.responses[200] = {
         description: "Listado de localidades registradas.",
         content: {
           "application/json": {
             schema: {
               type: "array",
               items: { $ref: "#/components/schemas/LocalidadRespuesta" }
             }
           }
         }
       }
       #swagger.responses[400] = { description: "Parámetros inválidos." }
    */
    validarSchema(obtenerLocalidadesSchema, 'query'),
    getLocalidades
);

router.get('/:id',
    /* #swagger.tags = ["Localidades"]
       #swagger.summary = "Consultar localidad por ID"
       #swagger.auto = false
       #swagger.security = []
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID numérico de la localidad",
         "@schema": { type: "integer" }
       }
       #swagger.responses[200] = {
         description: "Detalle de la localidad.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/LocalidadRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "ID inválido." }
       #swagger.responses[404] = { description: "Localidad no encontrada." }
    */
    validarSchema(idParamSchema, 'params'),
    getLocalidadPorId
);

export default router;
