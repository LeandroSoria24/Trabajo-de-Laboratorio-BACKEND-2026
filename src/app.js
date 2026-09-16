import express from "express";
import artesanosRoutes from './routes/artesano.routes.js';
import productosRoutes from './routes/producto.routes.js';
import { logger } from "./middlewares/logger.js"
import {manejoErrores} from "./middlewares/manejoErrores.js"
import {rutaNoEncontrada} from "./middlewares/rutaNoEncontrada.js"

const app = express();
const PORT =  3000;
app.use(express.json());

/* 1 middleware de informacion */
app.use(logger); 
// el logger tiene un res.on , eso significa que va a esperar la respuesta de manejoErrores (2)
// y hasta que este no termine de procesar el error, no se va a cerrar la peticion




/* GETTERS */

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API Poncho Digital - Fiesta Nacional e Internacional del Poncho'
    });
})
app.get('/info', (req, res) => {
    res.json({
        mensaje: 'API Poncho Digital',
        version: '1.0',
        estado: 'En desarrollo'
    });
})

app.use('/artesanos', artesanosRoutes);
app.use('/productos', productosRoutes);


/* MANEJO DE RUTAS NO ENCONTRADAS (404) */
app.use(rutaNoEncontrada);

/* 2 middleware para manejo de errores (siempre al final de todo) */
app.use(manejoErrores);


/* LISTEN */
app.listen(PORT, () => {
    console.log(`servidor iniciado en puerto http://localhost:${PORT}`)
});