import { libros } from '../data/libros.data.js';
import { crearError } from '../utils/crearError.js';
import prisma from '../config/prisma.js';

// GETTERS
export const getLibros = async (req, res, next) => {
    try {
        const libros = await prisma.libro.findMany();
        res.json(libros);
    }
    catch (error) {
        next(error);
    }
};

export const getLibrosFiltrados = async (req, res, next) => {
    try {
        const tituloRecibido = req.query.titulo;

        if (!tituloRecibido) {
            return next(crearError('Debe especificar el parámetro "titulo" para filtrar', 400));
        }

        const libroFiltrado = await prisma.libro.findMany({
            where: {
                titulo: {
                    contains: tituloRecibido,
                    mode: 'insensitive'
                }
            }
        })
        res.json(libroFiltrado)
        
    }
    catch (error) {
        next(error);
    }
};

export const getLibroPorId = (req, res, next) => {
    const id = Number(req.params.id);
    const libro = libros.find(libro => libro.id === id);

    if (!libro) {
        return next(crearError(`no existe un libro con id ${id}`, 404));
    }

    res.json(libro);
};

// POST
export const createLibro = async (req, res, next) => {
    try {
        const { titulo, autorId, anio } = req.body;

        if (!titulo || !autorId) {
            return next(crearError('Faltan datos obligatorios: titulo y autorId son requeridos', 400));
        }

        // Si existe relación con la tabla Autor, se recomienda validar la existencia del autor primero
        const existeAutor = await prisma.autor.findUnique({ where: { id: Number(autorId) } });
        if (!existeAutor) {
            return next(crearError(`No existe un autor con el ID ${autorId}`, 404));
        }

        const nuevoLibro = await prisma.libro.create({
            data: {
                titulo,
                autorId: Number(autorId),
                anio: anio ? Number(anio) : null
            }
        });

        res.status(201).json(nuevoLibro);
    } catch (error) {
        next(error);
    }
};

// PUT
export const updateLibro = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return next(crearError('El ID proporcionado no es válido', 400));
        }

        const { titulo, autorId, anio } = req.body;

        if (!titulo || !autorId) {
            return next(crearError('Faltan datos obligatorios: titulo y autorId son requeridos', 400));
        }

        // Verificar si el libro existe antes de intentar actualizarlo
        const existeLibro = await prisma.libro.findUnique({ where: { id } });
        if (!existeLibro) {
            return next(crearError(`No existe un libro con id ${id}`, 404));
        }

        const libroActualizado = await prisma.libro.update({
            where: { id },
            data: {
                titulo,
                autorId: Number(autorId),
                anio: anio ? Number(anio) : null
            }
        });

        res.json(libroActualizado);
    } catch (error) {
        next(error);
    }
};

// DELETE
export const deleteLibro = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return next(crearError('El ID proporcionado no es válido', 400));
        }

        const existeLibro = await prisma.libro.findUnique({ where: { id } });
        if (!existeLibro) {
            return next(crearError(`No existe un libro con id ${id}`, 404));
        }

        await prisma.libro.delete({ where: { id } });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};