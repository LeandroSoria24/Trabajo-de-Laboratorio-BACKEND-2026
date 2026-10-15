import { asignarAdministrador }
from "../services/roles.services.js";
export const agregarRol = async (req, res) => {
    await asignarAdministrador(
        req.parametrosValidados.id);
    return res.json({
        mensaje: "Rol ADMINISTRADOR asignado."
    });
};

export const eliminarRol = async (req, res) => {
const { id, rol } = req.parametrosValidados;
await retirarRol(id, rol);
return res.status(204).end();
}