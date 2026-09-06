import { libros } from '../data/libros.data.js';

//GETTERS
export const getLibros = (req, res) => {
    res.json(libros)
}

export const getLibrosFiltrados = (req, res) => {
    const tituloRecibido = req.query.titulo

    if (!tituloRecibido) {
        return res.status(400).json({ error: 'Debe especificar el parámetro "titulo" para filtrar' })
    }

    const libroFiltrado = libros.filter(libro => libro.titulo.toLowerCase().includes(tituloRecibido.toLowerCase()))
    res.json(libroFiltrado)
}

export const getLibroPorId = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'El ID del libro debe ser un número entero positivo' });
    }

    const libro = libros.find(libro => libro.id === id);

    if (!libro) {
        return res.status(404).json({ error: `no existe un libro con id ${id}` });
    }

    res.json(libro);
}



//POST
export const createLibro = (req, res) => {
    const { titulo, autor, anio } = req.body;

    if (!titulo || !autor) {
        return res.status(400).json({ error: 'Faltan datos obligatorios: titulo y autor son requeridos' });
    }

    const nuevoLibro = {
        id: libros.length > 0 ? Math.max(...libros.map(l => l.id)) + 1 : 1,
        titulo,
        autor,
        anio: anio ?? null
    };
    libros.push(nuevoLibro);
    res.status(201).json(nuevoLibro);
}


//PUT
export const updateLibro = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'El ID del libro debe ser un número entero positivo' });
    }

    const libro = libros.find(libro => libro.id === id);

    if (!libro) {
        return res.status(404).json({ error: `no existe un libro con id ${id}` });
    }

    const { titulo, autor, anio } = req.body;

    if (!titulo || !autor) {
        return res.status(400).json({ error: 'Faltan datos obligatorios: titulo y autor son requeridos' });
    }

    libro.titulo = titulo;
    libro.autor = autor;
    libro.anio = anio ?? null;

    res.json(libro);
}


//DELETE
export const deleteLibro = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'El ID del libro debe ser un número entero positivo' });
    }

    const indice = libros.findIndex(libro => libro.id === id);

    if (indice === -1) {
        return res.status(404).json({ error: `no existe un libro con id ${id}` });
    }

    libros.splice(indice, 1);

    res.status(204).send();
}