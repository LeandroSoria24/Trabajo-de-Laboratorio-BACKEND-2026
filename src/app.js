import express from "express";
import librosRoutes from './routes/libros.routes.js'
import autoresRoutes from './routes/autores.routes.js'
import swaggerRoutes from './swagger.js'//══════════════════════════════════════════════════════
import { logger } from "./middlewares/logger.js"
import {manejoErrores} from "./middlewares/manejoErrores.js"
import {rutaNoEncontrada} from "./middlewares/rutaNoEncontrada.js"

const app = express();
const PORT = 3000;
app.use(express.json());

/* 1 middleware de informacion */
app.use(logger); 
// el logger tiene un res.on , eso significa que va a esperar la respuesta de manejoErrores (2)
// y hasta que este no termine de procesar el error, no se va a cerrar la peticion




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
app.use(rutaNoEncontrada);

/* 2 middleware para manejo de errores (siempre al final de todo) */
app.use(manejoErrores);


/* LISTEN */
app.listen(PORT, () => {
    console.log(`servidor iniciado en puerto http://localhost:${PORT}`)
});