import jwt from "jsonwebtoken"; /*🟨 */
import { verificarToken } from "../services/token.services.js";
import { tokenEstaRevocado } from "../services/revocaciones.services.js";
import { obtenerUsuarioPorId } from "../services/usuario.services.js";

export const autenticarUsuario = async (req, res, next) => {
    const encabezado = req.get("Authorization")?.trim();
    if (!encabezado) {
        res.set("WWW-Authenticate", "Bearer");
        return res.status(401).json({
            mensaje: "Se requiere un token de acceso."
        });
    }

    const coincidencia = /^Bearer\s+(\S+)$/i.exec(encabezado);
    if (!coincidencia) {
        res.set("WWW-Authenticate", 'Bearer error="invalid_request"');
        return res.status(400).json({
            mensaje: "Usar Authorization: Bearer <token>."
        });
    }

    try {
        req.usuario = verificarToken(coincidencia[1]);
        if (await tokenEstaRevocado(req.usuario.jti)) {
            throw new jwt.JsonWebTokenError("Token revocado.");
        }
    } catch (error) {
        if (!(error instanceof jwt.JsonWebTokenError)) {
            return next(error);
        }
        res.set("WWW-Authenticate", 'Bearer error="invalid_token"');
        return res.status(401).json({
            mensaje: "Token inválido, vencido o revocado."
        });
    }

    return next();
};

/* Middleware de autenticación opcional: si hay token válido carga req.usuario y req.contextoUsuario,
   si no hay token continúa la ejecución sin rechazar (para visitantes o consultas públicas) 🟩 */
export const autenticarUsuarioOpcional = async (req, res, next) => {
    const encabezado = req.get("Authorization")?.trim();
    if (!encabezado) {
        return next();
    }

    const coincidencia = /^Bearer\s+(\S+)$/i.exec(encabezado);
    if (!coincidencia) {
        return next();
    }

    try {
        const payload = verificarToken(coincidencia[1]);
        if (payload && !(await tokenEstaRevocado(payload.jti))) {
            req.usuario = payload;
            const usuario = await obtenerUsuarioPorId(payload.id);
            if (usuario && usuario.activo) {
                req.contextoUsuario = usuario;
            }
        }
    } catch (error) {
        if (!(error instanceof jwt.JsonWebTokenError)) {
            return next(error);
        }
        // Si el token es inválido o expiró, simplemente se continúa como usuario no autenticado
    }

    return next();
};