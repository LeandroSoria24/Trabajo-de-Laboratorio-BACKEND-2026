import { crearError } from "../../utils/crearError.js";
import { FiltrarProductoPorIDSchema } from "../../validators/producto.schemas.js";
import { detallarErroresZod } from "../../utils/ErroresZod.js";

export const validarId = (req, res, next) => {  /* 🟩 */
      const resultado = FiltrarProductoPorIDSchema.safeParse(req.params);
      
      if (!resultado.success) { 
         const detalles = detallarErroresZod(resultado.error)
         return next(crearError('Error en los parámetros del ID del producto', 400, detalles));
      }
    
    req.params.id = resultado.data.id

/*  export const FiltrarProductoPorIDSchema = z.object({
  id: z.coerce.number("El ID debe ser un número")
    .int("El ID debe ser un número entero")
    .positive("El ID debe ser un número entero positivo")
}); 
 */
    next();
}