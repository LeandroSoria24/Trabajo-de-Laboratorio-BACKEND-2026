import { obtenerUsuarioPorId }
from "../services/usuario.services.js";


export const cargarContextoUsuario = async (req, res, next) => {
    try {
        const usuario = await obtenerUsuarioPorId(req.usuario.id);
        if (!usuario) {
            res.set("WWW-Authenticate", "Bearer");
            return res.status(401).json({ mensaje: "Cuenta inexistente." });
        }
        if (!usuario.activo) {
            return res.status(403).json({ mensaje: "Cuenta inactiva." });
        }
        req.contextoUsuario = usuario;
        return next();
    } catch (error) {
        return next(error);
    }
};

export const autorizarRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        const usuario = req.contextoUsuario;
        const permitido = (usuario?.roles ?? []).some(rol => rolesPermitidos.includes(rol));
        if (!permitido) {
            return res.status(403).json({
                mensaje: "No tiene permiso para esta operación."
            });
        }
        return next();
    };
};