import { crearError } from "../../utils/crearError.js";
import { crearProductoSchema, actualizarProductoSchema, } from "../../validators/producto.schemas.js";
import { detallarErroresZod } from "../../utils/ErroresZod.js";




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

    if (!resultado.success) { 
        const detalles = detallarErroresZod(resultado.error);
        return next(crearError('Error en los parámetros del producto', 400, detalles));
    }


    req.body = resultado.data;

    next();
};

