import { crearError } from "../utils/crearError.js";

/**
 * Middleware para validar que el parámetro :id sea un número entero positivo.
 * Detecta automáticamente si la ruta pertenece a libros o autores para el mensaje de error.
 */
export const validarId = (req, res, next) => {
    const id = Number(req.params.id);
    const recurso = req.baseUrl.includes('libros') ? 'libro' : 'autor';

    if (!Number.isInteger(id) || id <= 0) {
        return next(crearError(`El ID del ${recurso} debe ser un número entero positivo`, 400));
    }

    next();
};