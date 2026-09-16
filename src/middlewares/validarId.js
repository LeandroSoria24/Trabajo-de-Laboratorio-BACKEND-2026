import { crearError } from "../utils/crearError.js";

//---//

export const validarId = (req, res, next) => {
    const { id } = req.params;

    // 1. Validar existencia y tipo base
    if (id === undefined || id === null) {
        return next(crearError("El parámetro ID es obligatorio en la ruta.", 400));
    }

    if (typeof id !== 'string' || id.trim() === '') {
        return next(crearError("El ID debe ser una cadena de texto válida y no vacía.", 400));
    }

    const idLimpio = id.trim();

    // 2. Validación estricta de formato (Ejemplo: asumiendo que el ID debe ser numérico)
    // NOTA: Si usas MongoDB, cambia la expresión regular a /^[0-9a-fA-F]{24}$/
    if (!/^\d+$/.test(idLimpio)) {
        return next(crearError("Formato de ID inválido. Debe ser un número entero positivo.", 400));
    }

    // 3. Reasignar el ID limpio para evitar espacios ocultos en los controladores
    req.params.id = idLimpio;
    
    next();
};