import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';

/**
 * Servicio para la creación de un producto.
 * Recibe el DTO (los datos validados por Zod desde req.body),
 * comprueba la regla de negocio (que el artesano exista) y persiste con Prisma.
 */
export const crearProducto = async (crearProductoDto) => {
    const { nombre, descripcion, precio, stock, artesanoId } = crearProductoDto;

    // Regla de negocio: comprobar que el artesano exista
    const artesano = await prisma.artesano.findUnique({
        where: { id: artesanoId }
    });
    if (!artesano) {
        throw crearError("Artesano inexistente.", 400);
    }

    return prisma.producto.create({
        data: {
            nombre,
            descripcion: descripcion ?? null,
            precio: Number(precio),
            stock: stock !== undefined ? Number(stock) : 0,
            artesanoId
        },
        include: {
            artesano: true
        }
    });
};

/**
 * Servicio para la actualización de un producto.
 * Recibe el id y el DTO con los datos a actualizar.
 * Comprueba que el producto exista y que el artesano sea válido si se envía.
 */
export const actualizarProducto = async (id, actualizarProductoDto) => {
    const producto = await prisma.producto.findUnique({
        where: { id }
    });
    if (!producto) {
        throw crearError(`No existe un producto con id ${id}`, 404);
    }

    const { nombre, descripcion, precio, stock, artesanoId } = actualizarProductoDto;

    if (artesanoId) {
        const artesano = await prisma.artesano.findUnique({
            where: { id: artesanoId }
        });
        if (!artesano) {
            throw crearError("Artesano inexistente.", 400);
        }
    }

    return prisma.producto.update({
        where: { id },
        data: {
            nombre,
            descripcion,
            precio,
            stock,
            artesanoId
        },
        include: {
            artesano: true
        }
    }); // buenisimo porque esta actualizando y a la vez devolviendo datos para la respuesta .JSON
};
