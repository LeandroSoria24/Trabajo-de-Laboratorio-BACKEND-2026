import { crearError } from '../utils/crearError.js';
import { detallarErroresZod } from '../utils/ErroresZod.js';

// Middleware para validar datos (body, params o query) con Zod /* 🟩 */
export const validarSchema = (schema, origen) => (req, res, next) => {
    const datos = req[origen] ?? {};
    const resultado = schema.safeParse(datos);

    if (!resultado.success) {
        const detalles = detallarErroresZod(resultado.error);
        return next(crearError(`Error en los parámetros de ${origen}`, 400, detalles));
    }

    if (origen === 'query') {
        req.consulta = resultado.data;
        // En Express 5 req.query es solo un getter en IncomingMessage; redefinimos la propiedad para reemplazar los datos validados
        Object.defineProperty(req, 'query', {
            value: resultado.data,
            writable: true,
            configurable: true,
            enumerable: true
        });
    } else {
        req[origen] = resultado.data;
    }

    next();
};
