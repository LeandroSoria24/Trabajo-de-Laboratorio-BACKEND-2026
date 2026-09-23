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
import {
    crearArtesanoSchema,
    actualizarArtesanoSchema,
    obtenerArtesanosSchema
} from '../validators/artesano.schemas.js';

const router = Router();

router.get('/', validarSchema(obtenerArtesanosSchema, 'query'), getArtesanos);/* 🟩 Estándar REST */
router.get('/all', validarSchema(obtenerArtesanosSchema, 'query'), getArtesanos);/* 🟩 */
router.get('/:id', validarSchema(idParamSchema, 'params'), getArtesanoPorId);/* 🟩 */
router.post('/', validarSchema(crearArtesanoSchema, 'body'), createArtesano);/* 🟩 */
router.put('/:id', validarSchema(idParamSchema, 'params'), validarSchema(actualizarArtesanoSchema, 'body'), updateArtesano);/* 🟩 */
router.delete('/:id', validarSchema(idParamSchema, 'params'), deleteArtesano);/* 🟩 */

export default router;
