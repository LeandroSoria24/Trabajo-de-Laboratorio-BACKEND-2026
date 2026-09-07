import { autores } from '../data/autores.data.js'

/* GET de todos los autores */
export const getAutores = (req, res) => {
    res.json(autores);
}

/* GET Autor por el ID */
export const getAutorPorId = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'El ID del autor debe ser un número entero positivo' });
    }

    const autor = autores.find(a => a.id === id);

    if (!autor) {
        return res.status(404).json({ error: `no existe un autor con id ${id}` });
    }

    res.json(autor);
}

/* POST crear Autor */
export const createAutor = (req, res) => {
    const { nombre, nacionalidad } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'El campo "nombre" es obligatorio' });
    }

    const nuevoAutor = {
        id: autores.length > 0 ? Math.max(...autores.map(a => a.id)) + 1 : 1,
        nombre,
        nacionalidad: nacionalidad ?? null
    };

    autores.push(nuevoAutor);
    res.status(201).json(nuevoAutor);
}

/* PUT Actualizar Autor */
export const updateAutor = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'El ID del autor debe ser un número entero positivo' });
    }

    const autor = autores.find(a => a.id === id);

    if (!autor) {
        return res.status(404).json({ error: `no existe un autor con id ${id}` });
    }

    const { nombre, nacionalidad } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'El campo "nombre" es obligatorio' });
    }

    autor.nombre = nombre;
    autor.nacionalidad = nacionalidad ?? null;

    res.json(autor);
}

/* DELETE Eliminar Autor */
export const deleteAutor = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'El ID del autor debe ser un número entero positivo' });
    }

    const indice = autores.findIndex(a => a.id === id);

    if (indice === -1) {
        return res.status(404).json({ error: `no existe un autor con id ${id}` });
    }

    autores.splice(indice, 1);

    res.status(204).send();
}