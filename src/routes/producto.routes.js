import { Router } from "express";
import {
    getProductos,
    getProductoPorId,
    createProducto,
    updateProducto,
    deleteProducto,
    deleteProductoLogico
} from '../controllers/producto.controllers.js';
import { validarId } from '../middlewares/validaciones/validarId.js';
import { validarProducto } from '../middlewares/validaciones/validarProducto.js';
import { validarConsultaProductos } from '../middlewares/validaciones/validarQuerys.js';

const router = Router();

router.get('/', validarConsultaProductos, getProductos);/* 🟩 */
router.get('/:id', validarId, getProductoPorId);/* 🟩 */
router.post('/', validarProducto, createProducto);/* 🟩 */
router.put('/:id', validarId, validarProducto, updateProducto);/* 🟩 */
router.delete('/:id', validarId, deleteProducto);/* 🟩 */
router.patch('/:id', validarId, deleteProductoLogico);/* 🟩 */

export default router;
