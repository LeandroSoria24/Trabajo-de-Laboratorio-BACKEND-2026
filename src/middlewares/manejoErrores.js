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

    const cuerpo = {error: err.message};
    if(err.detalles) {
        cuerpo.detalles = err.detalles
    }

    res.status(estado).json(cuerpo);

        if(!resultado.success){
            const detalles = detallarErroresZod(resultado.error);
            return next(crearError('Los datos del libro son invalidos', 400, detalles));
        }
};



