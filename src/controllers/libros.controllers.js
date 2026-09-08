import { libros } from '../data/libros.data.js';
import { crearError } from '../utils/crearError.js';

// GETTERS
export const getLibros = (req, res) => {
    res.json(libros);
};

export const getLibrosFiltrados = (req, res, next) => {
    const tituloRecibido = req.query.titulo;

    if (!tituloRecibido) {
        return next(crearError('Debe especificar el parámetro "titulo" para filtrar', 400));
    }

    const libroFiltrado = libros.filter(libro => libro.titulo.toLowerCase().includes(tituloRecibido.toLowerCase()));
    res.json(libroFiltrado);
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
export const createLibro = (req, res, next) => {
    const { titulo, autor, anio } = req.body;

    if (!titulo || !autor) {
        return next(crearError('Faltan datos obligatorios: titulo y autor son requeridos', 400));
    }

    const nuevoLibro = {
        id: libros.length > 0 ? Math.max(...libros.map(l => l.id)) + 1 : 1,
        titulo,
        autor,
        anio: anio ?? null
    };
    libros.push(nuevoLibro);
    res.status(201).json(nuevoLibro);
};

// PUT
export const updateLibro = (req, res, next) => {
    const id = Number(req.params.id);
    const libro = libros.find(libro => libro.id === id);

    if (!libro) {
        return next(crearError(`no existe un libro con id ${id}`, 404));
    }

    const { titulo, autor, anio } = req.body;

    if (!titulo || !autor) {
        return next(crearError('Faltan datos obligatorios: titulo y autor son requeridos', 400));
    }

    libro.titulo = titulo;
    libro.autor = autor;
    libro.anio = anio ?? null;

    res.json(libro);
};

// DELETE
export const deleteLibro = (req, res, next) => {
    const id = Number(req.params.id);
    const indice = libros.findIndex(libro => libro.id === id);

    if (indice === -1) {
        return next(crearError(`no existe un libro con id ${id}`, 404));
    }

    libros.splice(indice, 1);
    res.status(204).send();
};