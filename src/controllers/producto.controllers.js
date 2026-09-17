import { crearError } from '../utils/crearError.js';
import prisma from '../config/prisma.js';
import {
    crearProducto,
    actualizarProducto,
    obtenerProductoPorId ,
    eliminarProducto,
    deleteLogico
} from '../services/producto.services.js';

// GETTERS
export const getProductos = async (req, res, next) => {
    try {
        const productos = await prisma.producto.findMany({ // hay que agregar la logica de servicios 
            include: {
                artesano: {
                    select: {
                        nombre: true,
                        apellido: true,
                        localidad: true,
                        rubro: true,
                        nombreEmprendimiento: true
                    }
                }
            }
        });
        res.json(productos);
    }
    catch (error) {
        next(error);
    }
};

export const getProductosFiltrados = async (req, res, next) => {
    try {
        const nombreRecibido = req.query.nombre;

        if (!nombreRecibido) {
            return next(crearError('Debe especificar el parámetro "nombre" para filtrar', 400));
        }

        const productosFiltrados = await prisma.producto.findMany({ // hay que agregar la logica de servicios 
            where: {
                nombre: {
                    contains: nombreRecibido,
                    mode: 'insensitive'
                }
            },
            include: {
                artesano: {
                    select: {
                        nombre: true,
                        apellido: true,
                        localidad: true,
                        rubro: true
                    }
                }
            }
        });
        res.json(productosFiltrados);
    }
    catch (error) {
        next(error);
    }
};

//GET POR ID 🟩-- 
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

// POST 🟩-- 
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

// PUT 🟩-- 
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

// DELETE  🟩-- 
export const deleteProducto = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await eliminarProducto(id) 

        res.status(200).send("Producto eliminado exitosamente");
    } catch (error) {
        next(error);
    }
};

/* DELETE LOGICO  🟩*/
export const deleteProductoLogico= async (req, res,next)=>{
    try{
        const id = Number(req.params.id);
        await deleteLogico(id)
        res.status(200).json({ message: "Producto eliminado logicamente" });
    }catch (error){
        next(error)
    }
}
