import { autores } from '../data/autores.data.js';
import { crearError } from '../utils/crearError.js';
import prisma from '../config/prisma.js';

/* GET de todos los autores */
export const getAutores = async (req, res, next) => {
    try {
        const autores = await prisma.autor.findMany();
        res.json(autores);
    } catch (error) {
        next(error);
    }
};


/* GET Autor por el ID */
export const getAutorPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return next(crearError('El ID proporcionado no es válido', 400));
        }

        const autor = await prisma.autor.findUnique({ where: { id } });

        if (!autor) {
            return next(crearError(`No existe un autor con id ${id}`, 404));
        }

        res.json(autor);
    } catch (error) {
        next(error);
    }
};

/* POST crear Autor */
export const createAutor = async (req, res, next) => {
    try {
        const { nombre, nacionalidad } = req.body;

        if (!nombre) {
            return next(crearError('El campo "nombre" es obligatorio', 400));
        }

        const nuevoAutor = await prisma.autor.create({
            data: {
                nombre,
                nacionalidad: nacionalidad ?? null
            }
        });

        res.status(201).json(nuevoAutor);
    } catch (error) {
        next(error);
    }
};

/* PUT Actualizar Autor */
export const updateAutor = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return next(crearError('El ID proporcionado no es válido', 400));
        }

        const { nombre, nacionalidad } = req.body;

        if (!nombre) {
            return next(crearError('El campo "nombre" es obligatorio', 400));
        }

        // Verificar si el registro existe antes de actualizar
        const existeAutor = await prisma.autor.findUnique({ where: { id } });
        if (!existeAutor) {
            return next(crearError(`No existe un autor con id ${id}`, 404));
        }

        const autorActualizado = await prisma.autor.update({
            where: { id },
            data: {
                nombre,
                nacionalidad: nacionalidad ?? null
            }
        });

        res.json(autorActualizado);
    } catch (error) {
        next(error);
    }
};

/* DELETE Eliminar Autor */
export const deleteAutor = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return next(crearError('El ID proporcionado no es válido', 400));
        }

        const existeAutor = await prisma.autor.findUnique({ where: { id } });
        if (!existeAutor) {
            return next(crearError(`No existe un autor con id ${id}`, 404));
        }

        await prisma.autor.delete({ where: { id } });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};