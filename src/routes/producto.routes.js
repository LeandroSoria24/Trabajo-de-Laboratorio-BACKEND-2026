import { Router } from "express";
import { cacheMiddleware } from '../middlewares/cache.js';
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

router.get('/',
    /* #swagger.tags = ["Productos"]
       #swagger.summary = "Listar catálogo de productos con paginación y filtros (Caché 30s)"
       #swagger.auto = false
       #swagger.security = []
       #swagger.parameters['pagina'] = { in: "query", description: "Número de página", "@schema": { type: "integer", default: 1 } }
       #swagger.parameters['limite'] = { in: "query", description: "Elementos por página (máx 50)", "@schema": { type: "integer", default: 10 } }
       #swagger.parameters['nombre'] = { in: "query", description: "Filtrar por nombre", "@schema": { type: "string" } }
       #swagger.parameters['artesanoId'] = { in: "query", description: "Filtrar por ID del artesano", "@schema": { type: "integer" } }
       #swagger.parameters['ordenarPor'] = { in: "query", description: "Campo de ordenamiento", "@schema": { type: "string", default: "nombre" } }
       #swagger.parameters['direccion'] = { in: "query", description: "Dirección (asc o desc)", "@schema": { type: "string", enum: ["asc", "desc"], default: "asc" } }
       #swagger.responses[200] = {
         description: "Catálogo de productos obtenido con éxito.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/ListadoProductos" }
           }
         }
       }
       #swagger.responses[400] = { description: "Parámetros de búsqueda inválidos." }
    */
    autenticarUsuarioOpcional,
    validarSchema(obtenerProductosSchema, 'query'),
    cacheMiddleware(30),
    getProductos
);

router.get('/all',
    /* #swagger.tags = ["Productos"]
       #swagger.summary = "Listar catálogo completo de productos (alias de /productos)"
       #swagger.auto = false
       #swagger.security = []
       #swagger.responses[200] = {
         description: "Catálogo de productos.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/ListadoProductos" }
           }
         }
       }
    */
    autenticarUsuarioOpcional,
    validarSchema(obtenerProductosSchema, 'query'),
    cacheMiddleware(30),
    getProductos
);

router.get('/:id',
    /* #swagger.tags = ["Productos"]
       #swagger.summary = "Consultar producto por ID (Caché 30s)"
       #swagger.auto = false
       #swagger.security = []
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID numérico del producto",
         "@schema": { type: "integer" }
       }
       #swagger.responses[200] = {
         description: "Detalle del producto.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/ProductoRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "ID inválido." }
       #swagger.responses[404] = { description: "Producto no encontrado." }
    */
    autenticarUsuarioOpcional,
    validarSchema(idParamSchema, 'params'),
    cacheMiddleware(30),
    getProductoPorId
);

// ──────────────────────────────────────────────────────
// GESTIÓN DE PRODUCTOS (Artesano autenticado o Administrador)
// ──────────────────────────────────────────────────────

const artesanoOAdmin = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ARTESANO", "ADMINISTRADOR")];

router.post('/',
    /* #swagger.tags = ["Productos"]
       #swagger.summary = "Crear un producto (Artesano o Administrador)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.requestBody = {
         required: true,
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/NuevoProducto" }
           }
         }
       }
       #swagger.responses[201] = {
         description: "Producto creado con éxito.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/ProductoRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "Datos inválidos." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "Requiere rol ARTESANO o ADMINISTRADOR (y propiedad si es artesano)." }
    */
    ...artesanoOAdmin,
    validarSchema(crearProductoSchema, 'body'),
    createProducto
);

router.put('/:id',
    /* #swagger.tags = ["Productos"]
       #swagger.summary = "Actualizar un producto (respetando propiedad)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID numérico del producto",
         "@schema": { type: "integer" }
       }
       #swagger.requestBody = {
         required: true,
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/ActualizarProducto" }
           }
         }
       }
       #swagger.responses[200] = {
         description: "Producto actualizado con éxito.",
         content: {
           "application/json": {
             schema: { $ref: "#/components/schemas/ProductoRespuesta" }
           }
         }
       }
       #swagger.responses[400] = { description: "Datos inválidos." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "No tiene permiso para editar este producto (no es de su propiedad)." }
       #swagger.responses[404] = { description: "Producto no encontrado." }
    */
    ...artesanoOAdmin,
    validarSchema(idParamSchema, 'params'),
    validarSchema(actualizarProductoSchema, 'body'),
    updateProducto
);

router.delete('/:id',
    /* #swagger.tags = ["Productos"]
       #swagger.summary = "Baja lógica de un producto (activo = false)"
       #swagger.auto = false
       #swagger.security = [{ bearerAuth: [] }]
       #swagger.parameters['id'] = {
         in: "path",
         required: true,
         description: "ID numérico del producto",
         "@schema": { type: "integer" }
       }
       #swagger.responses[204] = { description: "Producto dado de baja lógicamente (sin contenido)." }
       #swagger.responses[400] = { description: "ID inválido." }
       #swagger.responses[401] = { description: "Token no proporcionado o inválido." }
       #swagger.responses[403] = { description: "No tiene permiso sobre este producto." }
       #swagger.responses[404] = { description: "Producto no encontrado." }
    */
    ...artesanoOAdmin,
    validarSchema(idParamSchema, 'params'),
    deleteProductoLogico
);

export default router;
