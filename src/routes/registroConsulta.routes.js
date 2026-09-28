import { Router } from "express";
import {
    getRegistroConsultas,
    getRegistroConsultaPorId,
    postRegistroConsulta,
    deleteRegistroConsulta
} from '../controllers/registroConsulta.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearRegistroConsultaSchema,
    obtenerRegistroConsultasSchema
} from '../validators/registroConsulta.schemas.js';

const router = Router();

router.get('/', validarSchema(obtenerRegistroConsultasSchema, 'query'), getRegistroConsultas);
router.get('/:id', validarSchema(idParamSchema, 'params'), getRegistroConsultaPorId);
router.post('/', validarSchema(crearRegistroConsultaSchema, 'body'), postRegistroConsulta);
router.delete('/:id', validarSchema(idParamSchema, 'params'), deleteRegistroConsulta);

export default router;
