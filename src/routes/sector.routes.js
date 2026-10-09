import { Router } from "express";
import {
    getSectores,
    getSectorPorId,
    createSector,
    updateSector,
    deleteSector
} from '../controllers/sector.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearSectorSchema,
    actualizarSectorSchema,
    obtenerSectoresSchema
} from '../validators/sector.schemas.js';

const router = Router();


/* todos estos endpoints deberian ser protegidos, lo haremos cuando veamos el tema de autorizaciones */
/* solo un administrador deberia poder acceder a estos endpoints */
router.get('/', validarSchema(obtenerSectoresSchema, 'query'), getSectores);/* 🟩 */
router.get('/:id', validarSchema(idParamSchema, 'params'), getSectorPorId);/* 🟩 */
router.post('/', validarSchema(crearSectorSchema, 'body'), createSector);/* 🟩 */
router.put('/:id', validarSchema(idParamSchema, 'params'), validarSchema(actualizarSectorSchema, 'body'), updateSector);/* 🟩 */
router.delete('/:id', validarSchema(idParamSchema, 'params'), deleteSector);/* 🟩 */

export default router;
