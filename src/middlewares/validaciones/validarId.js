import { crearError } from "../../utils/crearError.js";
import { FiltrarProductoPorIDSchema } from "../../validators/producto.schemas.js";

export const validarId = (req, res, next) => {
      const resultado = FiltrarProductoPorIDSchema.safeParse(req.params);
      
      if (!resultado.success) {
         const mensajeCompleto = resultado.error.issues
              .map(issue => issue.message)
              .join(' | ');
          return next(crearError(mensajeCompleto, 400));
      }
    
    req.params.id = resultado.data.id

/*  export const FiltrarProductoPorIDSchema = z.object({
  id: z.coerce.number("El ID debe ser un número")
    .int("El ID debe ser un número entero")
    .positive("El ID debe ser un número entero positivo")
}); 🟩
 */
    next();
}