import { autores } from '../data/autores.data.js';
import { crearError } from '../utils/crearError.js';

/* GET de todos los autores */
export const getAutores = (req, res) => {
    res.json(autores);
};

/* GET Autor por el ID */
export const getAutorPorId = (req, res, next) => {
    const id = Number(req.params.id);
    const autor = autores.find(a => a.id === id);

    if (!autor) {
        return next(crearError(`no existe un autor con id ${id}`, 404));
    }

    res.json(autor);
};

/* POST crear Autor */
export const createAutor = (req, res, next) => {
    const { nombre, nacionalidad } = req.body;

    if (!nombre) {
        return next(crearError('El campo "nombre" es obligatorio', 400));
    }

    const nuevoAutor = {
        id: autores.length > 0 ? Math.max(...autores.map(a => a.id)) + 1 : 1,
        nombre,
        nacionalidad: nacionalidad ?? null
    };

    autores.push(nuevoAutor);
    res.status(201).json(nuevoAutor);
};

/* PUT Actualizar Autor */
export const updateAutor = (req, res, next) => {
    const id = Number(req.params.id);
    const autor = autores.find(a => a.id === id);

    if (!autor) {
        return next(crearError(`no existe un autor con id ${id}`, 404));
    }

    const { nombre, nacionalidad } = req.body;

    if (!nombre) {
        return next(crearError('El campo "nombre" es obligatorio', 400));
    }

    autor.nombre = nombre;
    autor.nacionalidad = nacionalidad ?? null;

    res.json(autor);
};

/* DELETE Eliminar Autor */
export const deleteAutor = (req, res, next) => {
    const id = Number(req.params.id);
    const indice = autores.findIndex(a => a.id === id);

    if (indice === -1) {
        return next(crearError(`no existe un autor con id ${id}`, 404));
    }

    autores.splice(indice, 1);
    res.status(204).send();
};