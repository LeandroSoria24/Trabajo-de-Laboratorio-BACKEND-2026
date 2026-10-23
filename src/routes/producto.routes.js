import { Router } from "express";
import {
    getProductos,
    getProductoPorId,
    createProducto,
    updateProducto,
    deleteProductoLogico
} from '../controllers/producto.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { autenticarUsuario, autenticarUsuarioOpcional } from '../middlewares/autenticarUsuario.js';
import { cargarContextoUsuario, autorizarRoles } from '../middlewares/autorizacion.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearProductoSchema,
    actualizarProductoSchema,
    obtenerProductosSchema
} from '../validators/producto.schemas.js';

const router = Router();

// ──────────────────────────────────────────────────────
// CONSULTA PÚBLICA (Visitantes y catálogo)
// Dinámica: Un visitante sin registrar solo ve lo básico ({ id, nombre, precio, descripcion, stock }).
// Si se envía token de ARTESANO o ADMINISTRADOR, se muestra toda la información.
// ──────────────────────────────────────────────────────

router.get('/', autenticarUsuarioOpcional, validarSchema(obtenerProductosSchema, 'query'), getProductos);
router.get('/all', autenticarUsuarioOpcional, validarSchema(obtenerProductosSchema, 'query'), getProductos);
router.get('/:id', autenticarUsuarioOpcional, validarSchema(idParamSchema, 'params'), getProductoPorId);

// ──────────────────────────────────────────────────────
// GESTIÓN DE PRODUCTOS (Artesano autenticado o Administrador)
// ──────────────────────────────────────────────────────

const artesanoOAdmin = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ARTESANO", "ADMINISTRADOR")];

router.post('/', ...artesanoOAdmin, validarSchema(crearProductoSchema, 'body'), createProducto);
router.put('/:id', ...artesanoOAdmin, validarSchema(idParamSchema, 'params'), validarSchema(actualizarProductoSchema, 'body'), updateProducto);
router.delete('/:id', ...artesanoOAdmin, validarSchema(idParamSchema, 'params'), deleteProductoLogico);

export default router;
