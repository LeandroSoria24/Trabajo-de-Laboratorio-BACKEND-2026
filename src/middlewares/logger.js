import { crearError, detallarErroresZod } from "../utils/crearError";

export const logger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => { /* res.on() sirve para "quedarse escuchando" y avisarte cuando
                                pasa algo con la respuesta que le estás enviando al usuario. */
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }); // importante poner originalUrl, asi no se recorte la peticion

    next();

    if(!resultado.success){
        const detalles = detallarErroresZod(resultado.error);
        return next(crearError('Los datos del libro son invalidos', 400, detalles));
    }
};