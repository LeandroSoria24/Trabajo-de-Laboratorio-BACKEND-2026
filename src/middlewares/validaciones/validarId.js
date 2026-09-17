import { crearError } from "../../utils/crearError.js";
import { eliminarProductoSchema } from "../../validators/producto.schemas.js";

export const validarId = (req, res, next) => {
      const resultado = eliminarProductoSchema.safeParse(req.params);
      
      if (!resultado.success) {
         const mensajeCompleto = resultado.error.issues
              .map(issue => issue.message)
              .join(' | ');
          return next(crearError(mensajeCompleto, 400));
      }
    
    req.params.id = resultado.data.id

/*  export const eliminarProductoSchema = z.object({
  id: z.coerce.number("El ID debe ser un número")
    .int("El ID debe ser un número entero")
    .positive("El ID debe ser un número entero positivo")
}); 🟩
 */
    next();
}