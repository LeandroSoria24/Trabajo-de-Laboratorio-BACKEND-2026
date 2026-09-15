export const manejoErrores = (err, req, res, next) => {
    // Validar que el error sea un objeto (evita las caídas por si se lanza un error como un string o null)
    const errorValido = (err && typeof err === 'object') ? err : {};

    //debe ser un número entre 400 y 599. Si no, forzamos un 500 (Error de Servidor)
    const statusCode = (
        typeof errorValido.status === 'number' && 
        errorValido.status >= 400 && 
        errorValido.status < 600
    ) ? errorValido.status : 500;

    //El formato debe ser un string. Si no lo es, ocultamos el error interno con un mensaje genérico.
    const message = (typeof errorValido.message === 'string' && errorValido.message.trim() !== '') 
        ? errorValido.message 
        : "Ha ocurrido un error interno en el servidor.";

    // Loguear el error real en consola para el desarrollador
    console.error(`[ERROR ${statusCode}]:`, err);

    // Responder al cliente siempre con una estructura inquebrantable
    res.status(statusCode).json({
        error: true,
        status: statusCode,
        message: message
    });
};