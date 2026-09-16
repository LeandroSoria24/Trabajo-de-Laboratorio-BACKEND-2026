import { crearError } from "../../utils/crearError.js";
import { crearLibroSchema, actualizarLibroSchema } from "../../validators/libro.schemas.js";

/**
 * Middleware para validar datos de libros en POST y PUT utilizando Zod.
 */
export const validarLibro = (req, res, next) => {
    // Seleccionar el esquema correspondiente al método HTTP
    const schema = req.method === 'PUT' ? actualizarLibroSchema : crearLibroSchema;
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
        // Extraer el primer issue de validación de Zod
        const issue = resultado.error.issues[0];
        const campo = issue.path.join('.') || 'body';
        return next(crearError(`Error en el campo '${campo}': ${issue.message}`, 400));
    }

    // Guardar los datos limpios (trimeados y tipados) en req.body
    req.body = resultado.data;
    next();
};

export const validarCrearLibro = (req, res, next) => {
    const resultado = crearLibroSchema.safeParse(req.body);

    if (!resultado.success) {
        const issue = resultado.error.issues[0];
        const campo = issue.path.join('.') || 'body';
        return next(crearError(`Error en el campo '${campo}': ${issue.message}`, 400));
    }

    req.body = resultado.data;
    next();
};

export const validarActualizarLibro = (req, res, next) => {
    const resultado = actualizarLibroSchema.safeParse(req.body);

    if (!resultado.success) {
        const issue = resultado.error.issues[0];
        const campo = issue.path.join('.') || 'body';
        return next(crearError(`Error en el campo '${campo}': ${issue.message}`, 400));
    }

    req.body = resultado.data;
    next();
};

// Re-exportamos los esquemas por si se requieren desde este módulo
export { crearLibroSchema, actualizarLibroSchema };