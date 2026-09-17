import { Router } from "express";
import {
    getArtesanos,
    getArtesanoPorId,
    createArtesano,
    updateArtesano,
    deleteArtesano
} from '../controllers/artesano.controllers.js';
import { validarId } from '../middlewares/validaciones/validarId.js';

const router = Router();

router.get('/', getArtesanos);/* 🟥 */
router.get('/:id', validarId, getArtesanoPorId);/* 🟥 */
router.post('/', createArtesano);/* 🟥 */
router.put('/:id', validarId, updateArtesano);/* 🟥 */
router.delete('/:id', validarId, deleteArtesano);/* 🟥 */

export default router;
