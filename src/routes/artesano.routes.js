import { Router } from "express";
import {
    getArtesanos,
    getArtesanoPorId,
    createArtesano,
    updateArtesano,
    deleteArtesano
} from '../controllers/artesano.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { idParamSchema } from '../validators/comun.schemas.js';

const router = Router();

router.get('/', getArtesanos);/* 🟥 */
router.get('/:id', validarSchema(idParamSchema, 'params'), getArtesanoPorId);/* 🟥 */
router.post('/', createArtesano);/* 🟥 */
router.put('/:id', validarSchema(idParamSchema, 'params'), updateArtesano);/* 🟥 */
router.delete('/:id', validarSchema(idParamSchema, 'params'), deleteArtesano);/* 🟥 */

export default router;
