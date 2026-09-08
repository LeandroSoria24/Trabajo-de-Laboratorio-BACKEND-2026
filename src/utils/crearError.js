/**
 * Fábrica para estandarizar la creación de errores en la API.
 * 
 * Crea una instancia nativa de la clase Error y le adjunta una propiedad 'status'
 * con el código HTTP correspondiente (ej: 400, 404, 500).
 * 
 * Estructura interna del objeto devuelto:
 * {
 *   name: 'Error',
 *   message: 'Libro no encontrado',   // Valor del parámetro 'mensaje'
 *   status: 404,                      // Código HTTP adjuntado
 *   stack: 'Error: Libro no encontrado\n    at crearError (...)\n    at ...' // Pila de llamadas para depurar
 * }
 */
export const crearError = (mensaje, status) => {
    const error = new Error(mensaje);
    error.status = status;
    return error;
};
