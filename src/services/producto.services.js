import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';

/**
 * Servicio para la creación de un producto.
 * Recibe el DTO (los datos validados por Zod desde req.body),
 * comprueba la regla de negocio (que el artesano exista) y persiste con Prisma. 🟩
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
 * Comprueba que el producto exista y que el artesano sea válido si se envía. 🟩
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

/**
 * Servicio para obtener la lista de productos.
 * Recibe el DTO con los parámetros de consulta (paginación y filtros). 🟥
 */
export const obtenerProductos = async (obtenerProductosDto) => {
    const { page, limit, nombre } = obtenerProductosDto;
    
    // Cálculo para la paginación de Prisma
    const skip = (page - 1) * limit;
    
    // Filtro dinámico: si viene un nombre, busca coincidencias
    const where = nombre ? { nombre: { contains: nombre } } : {};

    // Ejecuta el conteo total y la búsqueda de forma concurrente
    const [total, productos] = await prisma.$transaction([
        prisma.producto.count({ where }),
        prisma.producto.findMany({
            where,
            skip,
            take: limit,
            include: { artesano: true }
        })
    ]);

    return {
        total,
        page,
        limit,
        productos
    };
};

/**
 * Servicio para obtener un producto específico por su ID.
 * Recibe el ID validado y lanza un error si no existe. 🟩
 */
export const obtenerProductoPorId = async (id) => {
    const producto = await prisma.producto.findUnique({
        where: { id },
        include: { artesano: true }
    });

    if (!producto) {
        throw crearError(`No existe un producto con id ${id}`, 404);
    }

    return producto;
};

/**
 * Servicio para eliminar un producto por su ID.
 * Comprueba que el producto exista antes de eliminarlo. 🟩
 */
export const eliminarProducto = async (id) => {
    // Primero verificar que el producto exista
    const producto = await prisma.producto.findUnique({
        where: { id }
    });
    
    if (!producto) {
        throw crearError(`No existe un producto con id ${id}`, 404);
    }


    await prisma.producto.delete({ // Para eliminar un producto se va anecesitar su id
        where: { id }
    });

    return producto;
};

/* servicio para eliminar un producto logicamente */

export const deleteLogico = async (id) => {
        const producto = await prisma.producto.findUnique({
        where: { id }
    });
    if (!producto) {
        throw crearError(`No existe un producto con id ${id}`, 404);
    }

    return prisma.producto.update({
        where: { id },
        data: {
            eliminado: true
        }
    });

}

