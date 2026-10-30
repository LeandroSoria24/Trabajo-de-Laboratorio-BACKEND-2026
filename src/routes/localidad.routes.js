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


/* todos estos endpoints deberian ser protegidos, lo haremos cuando veamos el tema de autorizaciones */
/* solo un administrador deberia poder acceder a estos endpoints */
router.get('/', validarSchema(obtenerLocalidadesSchema, 'query'), getLocalidades); /* 🟩 */
router.get('/:id', validarSchema(idParamSchema, 'params'), getLocalidadPorId);/* 🟩 */
/* router.post('/sincronizar-georef', postSincronizarGeoref);  servicio para sincronizar todas las localidad de argentina */
/* solo hay que hacer un post sin nada en el body a este endpoint para poblar la bd*/
export default router;
