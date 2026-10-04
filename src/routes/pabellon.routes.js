import { Router } from "express";
import {
    getPabellones,
    getPabellonPorId,
    createPabellon,
    updatePabellon,
    deletePabellon
} from '../controllers/pabellon.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearPabellonSchema,
    actualizarPabellonSchema,
    obtenerPabellonesSchema
} from '../validators/pabellon.schemas.js';

const router = Router();

router.get('/', validarSchema(obtenerPabellonesSchema, 'query'), getPabellones);
router.get('/:id', validarSchema(idParamSchema, 'params'), getPabellonPorId);
router.post('/', validarSchema(crearPabellonSchema, 'body'), createPabellon);
router.put('/:id', validarSchema(idParamSchema, 'params'), validarSchema(actualizarPabellonSchema, 'body'), updatePabellon);
router.delete('/:id', validarSchema(idParamSchema, 'params'), deletePabellon);

export default router;
