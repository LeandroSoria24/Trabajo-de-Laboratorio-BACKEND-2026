import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';

const encontrarId = async (arsetanoID) => {
    return await prisma.artesano.findUnique({
        where: { id: artesanoId }
    });
}

/*
  Servicio para la creación de un producto.
  Recibe el DTO (los datos validados por Zod desde req.body),
  comprueba la regla de negocio (que el artesano exista) y persiste con Prisma. 🟩
 */
export const crearProducto = async (crearProductoDto) => {
    const { nombre, descripcion, precio, stock, artesanoId } = crearProductoDto;

    // Regla de negocio: comprobar que el artesano exista antes de crear (400)
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
            artesano: {
                connect: { id: artesanoId }
            },
            eliminado: false
        },
        include: {
            artesano: true
        }
    });
};

/*
  Servicio para la actualización de un producto.
  Recibe el id y el DTO con los datos a actualizar.
  Comprueba que el producto exista y que el artesano sea válido si se envía. 🟩
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

    const data = {};
    if (nombre !== undefined) data.nombre = nombre;
    if (descripcion !== undefined) data.descripcion = descripcion;
    if (precio !== undefined) data.precio = precio;
    if (stock !== undefined) data.stock = stock;
    if (artesanoId !== undefined) {
        data.artesano = {
            connect: { id: artesanoId }
        };
    }

    return prisma.producto.update({
        where: { id },
        data,
        include: {
            artesano: true
        }
    });
};

/*
  Servicio para obtener la lista de productos.
  Recibe el DTO con los parámetros de consulta (paginación y filtros). 🟩
 */
export const obtenerProductos = async (criterios = {}) => {
    const {
        id,
        nombre,
        descripcion,
        precio,
        stock,
        artesanoId,
        eliminado,


        ordenarPor = 'nombre',
        direccion = 'asc',
        pagina = 1,
        limite = 10


    } = criterios;

    const where = {};

    if (id !== undefined) {
        where.id = id;
    }

    if (nombre !== undefined) {
        where.nombre = { contains: nombre, mode: 'insensitive' };
    }

    if (descripcion !== undefined) {
        where.descripcion = { contains: descripcion, mode: 'insensitive' };
    }

    if (precio !== undefined) {
        where.precio = precio;
    }

    if (stock !== undefined) {
        where.stock = stock;
    }

    if (artesanoId !== undefined) {
        where.artesanoId = artesanoId;
    }

    if (eliminado !== undefined) {
        where.eliminado = eliminado;
    }

    // Cálculo para la paginación de Prisma
    const desplazamiento = (pagina - 1) * limite;

    const [productos, total] = await prisma.$transaction([
        prisma.producto.findMany({
            where,
            orderBy: [{ [ordenarPor]: direccion }, { id: 'asc' }],
            skip: desplazamiento,
            take: limite,
            include: { artesano: true }
        }),
        prisma.producto.count({
            where
        })
    ]);

    return {
        productos,
        paginacion: {
            pagina,
            limite,
            total,
            totalPaginas: Math.ceil(total / limite)
        }
    };
};

/*
  Servicio para obtener un producto específico por su ID.
  Recibe el ID validado y lanza un error si no existe. 🟩
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

/*
  Servicio para eliminar un producto por su ID.
  Comprueba que el producto exista antes de eliminarlo. 🟩
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

/* servicio para eliminar un producto logicamente  🟩*/

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

