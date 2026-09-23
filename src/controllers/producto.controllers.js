import {
    crearProducto,
    actualizarProducto,
    obtenerProductos,
    obtenerProductoPorId ,
    eliminarProducto,
    deleteLogico
} from '../services/producto.services.js';

// GETTERS 🟩
export const getProductos = async (req, res, next) => {  
    try {
        const resultado = await obtenerProductos(req.consulta);
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
        const producto = await obtenerProductoPorId(id)
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
        res.status(200).json({ message: "Producto eliminado logicamente" });
    }catch (error){
        next(error)
    }
}
