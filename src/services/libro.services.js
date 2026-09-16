import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';

/**
 * Servicio para la creación de un libro.
 * Recibe el DTO (los datos validados por Zod desde req.body),
 * aplica las reglas de negocio y persiste mediante Prisma Client.
 */
export const crearLibro = async (crearLibroDto) => {
    const { titulo, autor, anio, categoriaId, categoriaID } = crearLibroDto;
    const catId = categoriaId ?? categoriaID;

    // Regla de negocio: si se especifica una categoría, debe existir
    if (catId) {
        const categoria = await prisma.categoria.findUnique({
            where: { id: catId }
        });
        if (!categoria) {
            throw crearError("Categoría inexistente.", 400);
        }
    }

    return prisma.libro.create({
        data: {
            titulo,
            autor: String(autor),
            anio: anio ? Number(anio) : null,
            ...(catId ? { categoria: { connect: { id: catId } } } : {})
        },
        include: {
            categoria: true
        }
    });
};

/**
 * Servicio para la actualización de un libro.
 * Recibe el id y el DTO con los datos a actualizar.
 * Comprueba que el libro exista (regla de negocio) y persiste con Prisma.
 */
export const actualizarLibro = async (id, actualizarLibroDto) => {
    const libro = await prisma.libro.findUnique({
        where: { id }
    });
    if (!libro) {
        throw crearError(`No existe un libro con id ${id}`, 404);
    }

    const { titulo, autor, anio, categoriaId, categoriaID } = actualizarLibroDto;
    const catId = categoriaId ?? categoriaID;

    if (catId) {
        const categoria = await prisma.categoria.findUnique({
            where: { id: catId }
        });
        if (!categoria) {
            throw crearError("Categoría inexistente.", 400);
        }
    }

    return prisma.libro.update({
        where: { id },
        data: {
            titulo,
            autor: String(autor),
            anio: anio ? Number(anio) : null,
            ...(catId ? { categoria: { connect: { id: catId } } } : {})
        },
        include: {
            categoria: true
        }
    });
};

// Aliases para máxima compatibilidad
export const crearLibroService = crearLibro;
export const actualizarLibroService = actualizarLibro;
