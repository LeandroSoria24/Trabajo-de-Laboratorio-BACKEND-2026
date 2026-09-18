/**
 * Fábrica para estandarizar la creación de errores en la API.
 * 
 * Crea una instancia nativa de la clase Error y le adjunta una propiedad 'status'
 * con el código HTTP correspondiente (ej: 400, 404, 500).
 * 
 * Estructura interna del objeto devuelto:
 * {
 *   name: 'Error',
 *   message: 'Producto no encontrado',   // Valor del parámetro 'mensaje'
 *   status: 404,                         // Código HTTP adjuntado
 *   stack: 'Error: Producto no encontrado\n    at crearError (...)\n    at ...' // Pila de llamadas para depurar
 * }
 */
export const crearError = (mensaje, status = 500) => { /* 🟩 */
    // El status debe ser un número entre 400 y 599. Si no, forzamos un 500 (Error de Servidor)
    const statusCode = (
        typeof status === 'number' && 
        status >= 400 && 
        status < 600
    ) ? status : 500;

    // El mensaje debe ser un string no vacío. Si no lo es, asignamos un mensaje genérico
    const message = (typeof mensaje === 'string' && mensaje.trim() !== '') 
        ? mensaje 
        : "Ha ocurrido un error interno en el servidor.";

    const error = new Error(message);
    error.status = statusCode;
    return error;


};

    export const detallarErroresZod = (errorZod) => {
        errorZod.issues.map((issue) => ({
            campo: issue.path.join("_") || null, 
        }))    
    }