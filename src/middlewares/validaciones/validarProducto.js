import { crearError } from "../../utils/crearError.js";
import { crearProductoSchema, actualizarProductoSchema } from "../../validators/producto.schemas.js";

/**
 * Middleware para validar datos de productos en POST y PUT utilizando Zod.
 */
export const validarProducto = (req, res, next) => {
    const schema = req.method === 'PUT' ? actualizarProductoSchema : crearProductoSchema;
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
        const issue = resultado.error.issues[0];
        const campo = issue.path.join('.') || 'body';
        return next(crearError(`Error en el campo '${campo}': ${issue.message}`, 400));
    }

    req.body = resultado.data;
    next();
};

export const validarCrearProducto = (req, res, next) => {
    const resultado = crearProductoSchema.safeParse(req.body);

    if (!resultado.success) {
        const issue = resultado.error.issues[0];
        const campo = issue.path.join('.') || 'body';
        return next(crearError(`Error en el campo '${campo}': ${issue.message}`, 400));
    }

    req.body = resultado.data;
    next();
};

export const validarActualizarProducto = (req, res, next) => {
    const resultado = actualizarProductoSchema.safeParse(req.body);

    if (!resultado.success) {
        const issue = resultado.error.issues[0];
        const campo = issue.path.join('.') || 'body';
        return next(crearError(`Error en el campo '${campo}': ${issue.message}`, 400));
    }

    req.body = resultado.data;
    next();
};

export { crearProductoSchema, actualizarProductoSchema };
