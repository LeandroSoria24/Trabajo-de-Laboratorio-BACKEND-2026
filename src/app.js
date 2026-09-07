import express from "express";
import librosRoutes from './routes/libros.routes.js'
import autoresRoutes from './routes/autores.routes.js'
import swaggerRoutes from './swagger.js'//══════════════════════════════════════════════════════


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


app.use('/autores', autoresRoutes); 

/*════════════════════════════════════ DOCUMENTACIÓN INTERACTIVA SWAGGER ══════════════════════════════════════════════════════*/
app.use('/docs', swaggerRoutes);

/* MANEJO DE RUTAS NO ENCONTRADAS (404) */
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' })
})


/* LISTEN */
app.listen(PORT, () => {
    console.log(`servidor iniciado en puerto http://localhost:${PORT}`)
});