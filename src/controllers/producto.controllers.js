import {
    crearProducto,
    actualizarProducto,
    obtenerProductos,
    obtenerProductoPorId ,
    eliminarProducto,
    deleteLogico
} from '../services/producto.services.js';
import { invalidarCache } from '../middlewares/cache.js';

// GETTERS 🟩
export const getProductos = async (req, res, next) => {  
    try {
        const esArtesano = Boolean(req.contextoUsuario?.roles?.some(r => r === "ARTESANO" || r === "ADMINISTRADOR"));
        const resultado = await obtenerProductos(req.consulta || req.query, { esArtesano });
        res.json(resultado);
    }
    catch (error) {
        next(error);
    }
};


//GET POR ID 🟩
export const getProductoPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const esArtesano = Boolean(req.contextoUsuario?.roles?.some(r => r === "ARTESANO" || r === "ADMINISTRADOR"));
        const producto = await obtenerProductoPorId(id, { esArtesano });
        res.json(producto);
    }
    catch (error) {
        next(error);
    }
};

// POST 🟩
export const createProducto = async (req, res, next) => {
    try {
        // req.body ya contiene los datos validados por el middleware Zod (DTO)
        const crearProductoDto = req.body;
        const nuevoProducto = await crearProducto(crearProductoDto);
        invalidarCache('/productos'); // La lista de productos cambió, invalidamos la caché
        return res.status(201).json(nuevoProducto);
    } catch (error) {
        return next(error);
    }
};

// PUT 🟩
export const updateProducto = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const actualizarProductoDto = req.body;
        const productoActualizado = await actualizarProducto(id, actualizarProductoDto);
        invalidarCache('/productos'); // Un producto fue modificado, invalidamos la caché
        return res.json(productoActualizado);
    } catch (error) {
        return next(error);
    }
};

// DELETE 🟩
export const deleteProducto = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await eliminarProducto(id);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// DELETE LOGICO  🟩
export const deleteProductoLogico= async (req, res,next)=>{
    try{
        const id = Number(req.params.id);
        await deleteLogico(id)
        invalidarCache('/productos'); // Un producto fue eliminado, invalidamos la caché
        res.status(200).json({ message: "Producto eliminado logicamente" });
    }catch (error){
        next(error)
    }
}
