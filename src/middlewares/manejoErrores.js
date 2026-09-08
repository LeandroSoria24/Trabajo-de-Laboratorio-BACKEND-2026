
export const manejoErrores = (err, req, res, next) => {
    // Si el error trae un código de estado (ej: 400, 404) lo usa; si no, asume 500 (error del servidor)
    const estado = err.status || 500;

    if (estado >= 500) {
        console.error(err);
        return res.status(500).json({
            mensaje: 'Error interno del servidor'
        });
    }

    // Errores controlados del cliente (4xx): devuelve el código y el mensaje específico
    res.status(estado).json({ error: err.message });
};