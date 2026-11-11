import express from "express";
import artesanosRoutes from './routes/artesano.routes.js';
import productosRoutes from './routes/producto.routes.js';
import usuariosRoutes from './routes/usuario.routes.js';
import standsRoutes from './routes/stand.routes.js';
import pabellonesRoutes from './routes/pabellon.routes.js';
import sectoresRoutes from './routes/sector.routes.js';
import localidadesRoutes from './routes/localidad.routes.js';
import solicitudesRoutes from './routes/solicitud.routes.js';

import { logger } from "./middlewares/logger.js";
import { manejoErrores } from "./middlewares/manejoErrores.js";
import { rutaNoEncontrada } from "./middlewares/rutaNoEncontrada.js";
import cors from "cors";
import "./config/jwt.js";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "node:fs";

export const app = express();

// Documentación interactiva OpenAPI / Swagger UI
const swaggerDocument = JSON.parse(
    readFileSync(new URL("../swagger-output.json", import.meta.url), "utf8"),
);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors());
app.use(express.json());

/* 1 middleware de informacion */
app.use(logger);

/* GETTERS INFORMATIVOS */

app.get('/', (req, res) => {
    /* #swagger.tags = ["Información General"]
       #swagger.summary = "Mensaje de bienvenida de la API"
       #swagger.auto = false
       #swagger.security = []
       #swagger.responses[200] = { description: "Bienvenida del sistema." }
    */
    res.json({
        mensaje: 'API Poncho Digital - Fiesta Nacional e Internacional del Poncho'
    });
});

app.get('/info', (req, res) => {
    /* #swagger.tags = ["Información General"]
       #swagger.summary = "Versión y estado de la API"
       #swagger.auto = false
       #swagger.security = []
       #swagger.responses[200] = { description: "Versión y estado de desarrollo." }
    */
    res.json({
        mensaje: 'API Poncho Digital',
        version: '4.0',
        estado: 'En desarrollo'
    });
});

app.use('/artesanos', artesanosRoutes);
app.use('/productos', productosRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/stands', standsRoutes);
app.use('/pabellones', pabellonesRoutes);
app.use('/sectores', sectoresRoutes);
app.use('/localidades', localidadesRoutes);
app.use('/solicitudes', solicitudesRoutes);

/* MANEJO DE RUTAS NO ENCONTRADAS (404) */
app.use(rutaNoEncontrada);

/* 2 middleware para manejo de errores (siempre al final de todo) */
app.use(manejoErrores);

export default app;
