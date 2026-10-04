import { Router } from "express";
import {
    getLocalidades,
    getLocalidadPorId,
    /* postSincronizarGeoref */
} from '../controllers/localidad.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import { obtenerLocalidadesSchema } from '../validators/localidad.schemas.js';

const router = Router();

router.get('/', validarSchema(obtenerLocalidadesSchema, 'query'), getLocalidades);
router.get('/:id', validarSchema(idParamSchema, 'params'), getLocalidadPorId);
/* router.post('/sincronizar-georef', postSincronizarGeoref); */

export default router;
