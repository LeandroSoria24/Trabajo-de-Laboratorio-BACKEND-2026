import { crearError } from "../utils/crearError.js";

/**
 * Middleware para capturar rutas no encontradas (404).
 * Al colocarse después de todas las rutas válidas en app.js, cualquier
 * petición que no coincida con los endpoints registrados llegará aquí.
 */
export const rutaNoEncontrada = (req, res, next) => {
    // Al pasarle un objeto Error a next(), Express salta directamente
    // al middleware global de manejo de errores (manejoErrores.js)
    next(crearError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
};

