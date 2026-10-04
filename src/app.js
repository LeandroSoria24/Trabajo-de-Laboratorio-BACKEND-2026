import express from "express";
import artesanosRoutes from './routes/artesano.routes.js';
import productosRoutes from './routes/producto.routes.js';

import usuariosRoutes from './routes/usuario.routes.js';
import standsRoutes from './routes/stand.routes.js';
import pabellonesRoutes from './routes/pabellon.routes.js';
import sectoresRoutes from './routes/sector.routes.js';
import localidadesRoutes from './routes/localidad.routes.js';

import { logger } from "./middlewares/logger.js"
import { manejoErrores } from "./middlewares/manejoErrores.js"
import { rutaNoEncontrada } from "./middlewares/rutaNoEncontrada.js"
import cors from "cors"; /* esto es para permitir que se pueda usar el backend en un proyecto aparte que estoy haciendo de frontend */

const app = express();
const corss = require('cors');
const PORT = 3000;
app.use(express.json());
app.use(corss()); /* esto es para permitir que se pueda usar el backend en un proyecto aparte que estoy haciendo de frontend */

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
        version: '4.0',
        estado: 'En desarrollo'
    });
})

app.use('/artesanos', artesanosRoutes);
app.use('/productos', productosRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/stands', standsRoutes);
app.use('/pabellones', pabellonesRoutes);
app.use('/sectores', sectoresRoutes);
app.use('/localidades', localidadesRoutes);



/* MANEJO DE RUTAS NO ENCONTRADAS (404) */
app.use(rutaNoEncontrada);

/* 2 middleware para manejo de errores (siempre al final de todo) */
app.use(manejoErrores);


/* LISTEN */
app.listen(PORT, () => {
    console.log(`servidor iniciado en puerto http://localhost:${PORT}`)
});