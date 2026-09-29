import { Router } from "express";
import {
    getSolicitudes,
    getSolicitudPorId,
    postSolicitud,
    patchEvaluarSolicitud,
    deleteSolicitud
} from '../controllers/solicitud.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearSolicitudSchema,
    evaluarSolicitudSchema,
    obtenerSolicitudesSchema
} from '../validators/solicitud.schemas.js';
/* 🟥 */
const router = Router();

// Endpoint de postulación (público) 🟩
router.post('/', validarSchema(crearSolicitudSchema, 'body'), postSolicitud);

// Endpoints administrativos de gestión y evaluación 🟩
router.get('/', validarSchema(obtenerSolicitudesSchema, 'query'), getSolicitudes);
router.get('/:id', validarSchema(idParamSchema, 'params'), getSolicitudPorId);
router.patch('/:id/evaluar', validarSchema(idParamSchema, 'params'), validarSchema(evaluarSolicitudSchema, 'body'), patchEvaluarSolicitud);
router.delete('/:id', validarSchema(idParamSchema, 'params'), deleteSolicitud);

export default router;
