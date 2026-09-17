import { crearError } from "../../utils/crearError.js";
import { obtenerProductosSchema } from "../../validators/producto.schemas.js";


export const validarConsultaProductos = (req, res, next) => { /* 🟩 */
    const resultado = obtenerProductosSchema.safeParse(req.query);

 if (!resultado.success) { 
         const mensajeCompleto = resultado.error.issues
              .map(issue => issue.message)
              .join(' | ');
          return next(crearError(mensajeCompleto, 400));
      }

    req.consultaProductos = resultado.data;
    return next();
};

