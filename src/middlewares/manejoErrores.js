export const manejoErrores = (err, req, res, next) => { /* 🟩 */
    // Manejo de errores específicos de Prisma
    if (err.code === 'P2025') {
        return res.status(404).json({
            error: 'Recurso no encontrado'
        });
    }

    if (err.code === 'P2002') {
        const target = err.meta?.target ? ` (${err.meta.target})` : '';
        return res.status(400).json({
            error: `Violación de restricción única${target}: ya existe un registro con esos datos`
        });
    }

    // Si el error trae un código de estado (ej: 400, 404) lo usa; si no, asume 500 (error del servidor)
    const estado = err.status || 500;

    if (estado >= 500) {
        console.error(err);
        return res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
    const cuerpo = { error: err.message };

    if (err.details) {
        cuerpo.details = err.details;
    }
    // Errores controlados del cliente (4xx): devuelve el código y el mensaje específico
    res.status(estado).json(cuerpo);
};
