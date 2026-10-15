import { cambiarActivo } from "../services/estado.services.js";

export const actualizarActivo = async (req, res, next) => {
    try {
        const usuario = await cambiarActivo(
            req.parametrosValidados.id,
            req.bodyValidado.activo
        );
        return res.json(usuario);
    } catch (error) {
        return next(error);
    }
};