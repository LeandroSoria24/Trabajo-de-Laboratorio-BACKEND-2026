import { asignarAdministrador }
from "../services/roles.service.js";
export const agregarRol = async (req, res) => {
    await asignarAdministrador(
        req.parametrosValidados.id);
    return res.json({
        mensaje: "Rol ADMINISTRADOR asignado."
    });
};