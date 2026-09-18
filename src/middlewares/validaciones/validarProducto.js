import { crearError } from "../../utils/crearError.js";
import { crearProductoSchema, actualizarProductoSchema, } from "../../validators/producto.schemas.js";




export const validarProducto = (req, res, next) => {  /* 🟩 */
    let schema;
    let datosAValidar = req.body ?? {};
    switch (req.method) {
        case 'POST':
            schema = crearProductoSchema;
            /* export const crearProductoSchema = z.object({
              nombre: z.string("El campo 'nombre' es obligatorio")
                .trim()
                .min(1, "El nombre no puede estar vacío"),
              descripcion: z.string().trim().min(1).optional().nullable(),
              precio: z.coerce.number("El campo 'precio' es obligatorio")
                .positive("El precio debe ser mayor a 0"),
              stock: z.coerce.number().int().nonnegative().optional().default(0),
              artesanoId: z.coerce.number("El 'artesanoId' es obligatorio para asociar el producto")
                .int()
                .positive()
            }); 🟩
             */
            break;
        case 'PUT':
            schema = actualizarProductoSchema;
            /* export const actualizarProductoSchema = z.object({
              nombre: z.string("El campo 'nombre' es obligatorio")
                .trim()
                .min(1, "El nombre no puede estar vacío"),
              descripcion: z.string().trim().min(1).optional().nullable(),
              precio: z.coerce.number("El campo 'precio' es obligatorio")
                .positive("El precio debe ser mayor a 0"),
              stock: z.coerce.number().int().nonnegative("El stock no puede ser negativo").optional(),
              artesanoId: z.coerce.number("El 'artesanoId' debe ser un número válido")
                .int()
                .positive()
                .optional()
            }); 🟩*/
            break;
        default:
            return next();
    }

    const resultado = schema.safeParse(datosAValidar);

    if (!resultado.success) { /* modificar utils para no tener que programar esto dos veces 🟥*/
        const mensajeCompleto = resultado.error.issues
            .map(issue => issue.message)
            .join(' | ');
        return next(crearError(mensajeCompleto, 400));
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

    req.body = resultado.data;

    next();
};

