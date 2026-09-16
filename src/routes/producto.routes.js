import { Router } from "express";
import {
    getProductos,
    getProductosFiltrados,
    getProductoPorId,
    createProducto,
    updateProducto,
    deleteProducto
} from '../controllers/producto.controllers.js';
import { validarId } from '../middlewares/validaciones/validarId.js';
import { validarProducto } from '../middlewares/validaciones/validarProducto.js';

const router = Router();

router.get('/', getProductos);
router.get('/filtrados', getProductosFiltrados);
router.get('/:id', validarId, getProductoPorId);
router.post('/', validarProducto, createProducto);
router.put('/:id', validarId, validarProducto, updateProducto);
router.delete('/:id', validarId, deleteProducto);

export default router;
