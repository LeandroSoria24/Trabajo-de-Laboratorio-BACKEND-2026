import express from "express";
const app = express();
const PORT = 3000;
app.use(express.json());

const libros = [
    {
        id: 1,
        titulo: 'Cien años de soledad',
        autor: 'Gabriel García Márquez',
        anio: 1967
    },
    {
        id: 2,
        titulo: 'Don Quijote de la Mancha',
        autor: 'Miguel de Cervantes',
        anio: 1605
    }
]

const autores = [
    {
        id: 1,
        nombre: 'Gabriel García Márquez',
        nacionalidad: 'Colombiana'
    },
    {
        id: 2,
        nombre: 'Miguel de Cervantes',
        nacionalidad: 'Española'
    }
];

/* GETTERS */
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Api Laboratorio - Biblioteca',
        version: '1.2',
        estado: 'En desarrollo'
    });
})

app.get('/libros', (req, res) => {
    res.json(libros)
})

app.get('/libros/filtrados', (req, res) => {
    const tituloRecibido = req.query.titulo

    if (!tituloRecibido) {
        return res.status(400).json({ error: 'Debe especificar el parámetro "titulo" para filtrar' })
    }

    const libroFiltrado = libros.filter(libro => libro.titulo.toLowerCase().includes(tituloRecibido.toLowerCase()))
    res.json(libroFiltrado)
})

//ahora vamos a hacer un geter para libros pero con un parametro de identificacion, preferentemten un id por supuesto
app.get('/libros/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'El ID del libro debe ser un número entero positivo' });
    }

    const libro = libros.find(libro => libro.id === id);

    if (!libro) {
        return res.status(404).json({ error: `no existe un libro con id ${id}` });
    }

    res.json(libro);
})



/* POST */
app.post('/libros', (req, res) => {
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
})


/* PUT */
//obviamente hay que filtrar por id primero
app.put('/libros/:id', (req, res) => {
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
});

/* DELETE */
app.delete('/libros/:id', (req, res) => {
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
})

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