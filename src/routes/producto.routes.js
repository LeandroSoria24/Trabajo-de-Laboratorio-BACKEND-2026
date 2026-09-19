import { Router } from "express";
import {
    getProductos,
    getProductoPorId,
    createProducto,
    updateProducto,
    deleteProducto,
    deleteProductoLogico
} from '../controllers/producto.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearProductoSchema,
    actualizarProductoSchema,
    obtenerProductosSchema
} from '../validators/producto.schemas.js';

const router = Router();

router.get('/', validarSchema(obtenerProductosSchema, 'query'), getProductos);/* 🟩 */
router.get('/:id', validarSchema(idParamSchema, 'params'), getProductoPorId);/* 🟩 */
router.post('/', validarSchema(crearProductoSchema, 'body'), createProducto);/* 🟩 */
router.put('/:id', validarSchema(idParamSchema, 'params'), validarSchema(actualizarProductoSchema, 'body'), updateProducto);/* 🟩 */
router.delete('/:id', validarSchema(idParamSchema, 'params'), deleteProducto);/* 🟩 */
router.patch('/:id', validarSchema(idParamSchema, 'params'), deleteProductoLogico);/* 🟩 */

export default router;
