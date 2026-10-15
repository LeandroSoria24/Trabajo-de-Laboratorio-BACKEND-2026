import { asignarAdministrador, retirarRol }
from "../services/roles.services.js";

export const agregarRol = async (req, res, next) => {
    try {
        await asignarAdministrador(req.parametrosValidados.id);
        return res.json({
            mensaje: "Rol ADMINISTRADOR asignado."
        });
    } catch (error) {
        return next(error);
    }
};

export const eliminarRol = async (req, res, next) => {
    try {
        const { id, rol } = req.parametrosValidados;
        await retirarRol(id, rol);
        return res.status(204).end();
    } catch (error) {
        return next(error);
    }
};