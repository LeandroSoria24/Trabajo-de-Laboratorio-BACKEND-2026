import { crearError } from '../utils/crearError.js';
import prisma from '../config/prisma.js';
import {
    crearProducto,
    actualizarProducto
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

export const getProductoPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const producto = await prisma.producto.findUnique({ // hay que agregar la logica de servicios 
            where: { id },
            include: {
                artesano: true
            }
        });

        if (!producto) {
            return next(crearError(`No existe un producto con id ${id}`, 404));
        }

        res.json(producto);
    }
    catch (error) {
        next(error);
    }
};

// POST
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

// PUT
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

// DELETE
export const deleteProducto = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        const existeProducto = await prisma.producto.findUnique({ where: { id } });
        if (!existeProducto) {
            return next(crearError(`No existe un producto con id ${id}`, 404));
        }

        await prisma.producto.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
