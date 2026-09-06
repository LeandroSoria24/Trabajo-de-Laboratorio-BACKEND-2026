import express from "express";
import librosRoutes from './routes/libros.routes.js'
const app = express();
const PORT = 3000;
app.use(express.json());




/* GETTERS */

app.get('/', (req, res) => {
    res.json({
        mensaje: 'Api Laboratorio - Biblioteca'
    });
})
app.get('/info', (req, res) => {
    res.json({
        mensaje: 'Api Laboratorio - Biblioteca',
        version: '2.0',
        estado: 'En desarrollo'
    });
})

app.use('/libros', librosRoutes);





























/* GET de todos los autores */
app.get("/autores", (req, res) => {
    res.json(autores);
})

/* GET Autor por el ID */

app.get('/autores/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'El ID del autor debe ser un número entero positivo' });
    }

    const autor = autores.find(a => a.id === id);

    if (!autor) {
        return res.status(404).json({ error: `no existe un autor con id ${id}` });
    }

    res.json(autor);
});

/* POST crear Autor */
app.post('/autores', (req, res) => {
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
});

/* PUT Actualizar Autor */
app.put('/autores/:id', (req, res) => {
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
});

/* DELETE Eliminar Autor */
app.delete('/autores/:id', (req, res) => {
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
});

/* MANEJO DE RUTAS NO ENCONTRADAS (404) */
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' })
})


/* LISTEN */
app.listen(PORT, () => {
    console.log(`servidor iniciado en puerto http://localhost:${PORT}`)
});