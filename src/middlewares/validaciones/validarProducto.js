import { crearError } from "../../utils/crearError.js";
import { crearProductoSchema, actualizarProductoSchema } from "../../validators/producto.schemas.js";

/**
 * Middleware para validar datos de productos en POST y PUT utilizando Zod.
 */
export const validarProducto = (req, res, next) => {
    let schema;
    let datosAValidar = req.body;
    switch (req.method) {
        case 'POST':
            schema = crearProductoSchema;
            break;
        case 'PUT':
            schema = actualizarProductoSchema;
            break;
        case 'PATCH':
           /*  schema = parchearProductoSchema; */
            break;
        case 'GET':
            /* schema = filtroProductoSchema;
            datosAValidar = req.query; */     // En GET se validan los query params
            break;
        default:
            return next();
    }
    const resultado = schema.safeParse(datosAValidar);
    if (!resultado.success) {
        const issue = resultado.error.issues[0];
        const campo = issue.path.join('.') || 'datos';
        return next(crearError(`Error en el campo '${campo}': ${issue.message}`, 400));
    }

    /* Retorna { success: true, data } si el dato es correcto.
    Retorna { success: false, error } si el dato es incorrecto */

    /* Estructura de .error en zod
    {
  "name": "ZodError",
  "issues": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": ["nombre(es un ejemplo"],
      "message": "Expected string, received number"
    },
    {
      "code": "too_small",
      "minimum": 1,
      "type": "number",
      "inclusive": true,
      "exact": false,
      "path": ["precio(es un ejemplo)"],
      "message": "El precio debe ser mayor a 0"
    }
  ]
} */

    // Sobrescribimos con los datos ya parseados y casteados por Zod
    if (req.method === 'GET') {
        req.query = resultado.data;
    } else {
        req.body = resultado.data;
    }
    next();
};

