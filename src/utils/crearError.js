/**
 *
 * 
 * Estructura interna del objeto devuelto:
 * {
 *   name: 'Error',
 *   message: 'Producto no encontrado',   
 *   status: 404,                        
 *   details: [...],                     
 *   stack: 'Error: Producto no encontrado\n    at crearError (...)\n    at ...' 
 * }
 */
export const crearError = (mensaje, status = 500, details = null) => { /* 🟩 */
    const error = new Error(mensaje);
    error.status = status;

    if (details) {
        error.details = details;
    }

    return error;
};
