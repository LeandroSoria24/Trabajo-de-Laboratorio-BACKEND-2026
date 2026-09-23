export const detallarErroresZod = (ZodError) =>
    ZodError.issues.map((issue) => ({
        path: issue.path.join('.') || null,
        message: issue.message,
    }));
//prefiero usarlo en ingles al zod.


// Retorna { success: true, data } si el dato es correcto.
// Retorna { success: false, error } si el dato es incorrecto 

//Estructura de resultado con success true en zod
/* resultado = {
    success: true,
    data: {
        nombre: "Poncho",
        precio: 15000,
        artesanoId: 3
    }
} */



//Estructura de resultado con success false en zod
/* {
  success: false,
  error: {
    name: "ZodError",
    issues: [
      {
        origin: "string",                                    
        code: "too_small",
        minimum: 1,
        inclusive: true,
        path: ["nombre"],                                    
        message: "El nombre no puede estar vacío"             
      },
      {
        origin: "number",
        code: "too_small",
        minimum: 0,
        inclusive: false,
        path: ["precio"],
        message: "El precio debe ser mayor a 0"
      }
    ]
  }
}*/