import { crearError } from "../../utils/crearError.js";
import { obtenerProductosSchema } from "../../validators/producto.schemas.js";
import { detallarErroresZod } from "../../utils/ErroresZod.js";


export const validarConsultaProductos = (req, res, next) => { /* 🟩 */
    const resultado = obtenerProductosSchema.safeParse(req.query);

    if (!resultado.success) {
        const detalles = detallarErroresZod(resultado.error)
        return next(crearError('Error en los parámetros de la consulta de Productos', 400, detalles))
    }

    req.consultaProductos = resultado.data;
    return next();
};

