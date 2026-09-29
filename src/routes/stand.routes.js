import { Router } from "express";
import {
    getStands,
    getStandPorId,
    postStand,
    putStand,
    postAsignarStand,
    patchDesasignarStand,
    deleteStand
} from '../controllers/stand.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearStandSchema,
    actualizarStandSchema,
    asignarStandSchema,
    obtenerStandsQuerySchema
} from '../validators/stand.schemas.js';
/* 🟥 */
const router = Router();

// GET /api/stands con filtros por query string (pabellón, sector, estado) 🟩
router.get('/', validarSchema(obtenerStandsQuerySchema, 'query'), getStands);
router.get('/:id', validarSchema(idParamSchema, 'params'), getStandPorId);
router.post('/', validarSchema(crearStandSchema, 'body'), postStand);
router.put('/:id', validarSchema(idParamSchema, 'params'), validarSchema(actualizarStandSchema, 'body'), putStand);
router.delete('/:id', validarSchema(idParamSchema, 'params'), deleteStand);

// Endpoint de asignación artesano-stand 🟩
router.post('/:id/asignar', validarSchema(idParamSchema, 'params'), validarSchema(asignarStandSchema, 'body'), postAsignarStand);
router.patch('/:id/desasignar', validarSchema(idParamSchema, 'params'), patchDesasignarStand);

export default router;
