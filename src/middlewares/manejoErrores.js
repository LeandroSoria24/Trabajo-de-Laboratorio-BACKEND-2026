export const manejoErrores = (err, req, res, next) => { /* 🟩 */
    if (res.headersSent) return next(err);

    // Mapeo de errores conocidos de Prisma
    const mensajes = {
        P2002: "Ya existe un registro con esos datos únicos.",
        P2003: "La operación afecta registros relacionados.",
        P2025: "Registro no encontrado.",
        P2034: "Hubo otro cambio simultáneo. Reintentar."
    };

    const mensajeErrorPrisma = mensajes[err.code];
    const estado = mensajeErrorPrisma
        ? (err.code === "P2025" ? 404 : 409)
        : (err.status || 500);

    const mensaje = estado >= 500
        ? "Error interno del servidor."
        : (mensajeErrorPrisma || err.message);

    if (estado >= 500) {
        console.error(err);
    }

    const respuesta = { mensaje, error: mensaje };

    if (err.details) {
        respuesta.details = err.details;
    }

    return res.status(estado).json(respuesta);
};

