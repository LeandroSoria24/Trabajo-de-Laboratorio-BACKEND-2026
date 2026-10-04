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
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearStandSchema,
    actualizarStandSchema,
    obtenerStandsSchema,
    asignarArtesanoSchema
} from '../validators/stand.schemas.js';

const router = Router();

router.get('/', validarSchema(obtenerStandsSchema, 'query'), getStands);
router.get('/:id', validarSchema(idParamSchema, 'params'), getStandPorId);
router.post('/', validarSchema(crearStandSchema, 'body'), createStand);
router.put('/:id', validarSchema(idParamSchema, 'params'), validarSchema(actualizarStandSchema, 'body'), updateStand);
router.patch('/:id/asignar-artesano', validarSchema(idParamSchema, 'params'), validarSchema(asignarArtesanoSchema, 'body'), patchAsignarArtesano);
router.patch('/:id/liberar', validarSchema(idParamSchema, 'params'), patchLiberarStand);
router.delete('/:id', validarSchema(idParamSchema, 'params'), deleteStand);

export default router;
