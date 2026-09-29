import { Router } from "express";
import {
    getLocalidades,
    getLocalidadPorId,
    postLocalidad,
    putLocalidad,
    deleteLocalidad
} from '../controllers/localidad.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearLocalidadSchema,
    actualizarLocalidadSchema,
    obtenerLocalidadesSchema
} from '../validators/localidad.schemas.js';
/* 🟥 */
const router = Router();

router.get('/', validarSchema(obtenerLocalidadesSchema, 'query'), getLocalidades);
router.get('/:id', validarSchema(idParamSchema, 'params'), getLocalidadPorId);
router.post('/', validarSchema(crearLocalidadSchema, 'body'), postLocalidad);
router.put('/:id', validarSchema(idParamSchema, 'params'), validarSchema(actualizarLocalidadSchema, 'body'), putLocalidad);
router.delete('/:id', validarSchema(idParamSchema, 'params'), deleteLocalidad);

export default router;
