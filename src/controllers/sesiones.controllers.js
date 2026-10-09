import { revocarToken }from "../services/revocaciones.services.js";

// POST 🟨 
/* tema nuevo */
export const cerrarSesion = async (req, res, next) => { 
    try {
        await revocarToken(req.usuario);
        return res.status(204).end();
    } catch (error) {
        return next(error);
    }
};