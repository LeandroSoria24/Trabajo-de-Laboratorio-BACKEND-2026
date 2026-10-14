import {
    registrarUsuario,
    iniciarSesion as loginService,
    obtenerUsuarioPorId,
    registrarUsuarioParticipante as registrarUsuarioParticipanteService
} from '../services/usuario.services.js';
import { generarToken } from "../services/token.services.js";

// POST 🟩 
export const postUsuario = async (req, res, next) => {
    try {
        const nuevoUsuario = await registrarUsuario(req.body);
        res.status(201).json({
            mensaje: "Usuario registrado exitosamente",
            nuevoUsuario: nuevoUsuario
        });
    } catch (error) {
        next(error);
    }
};

// POST 🟨 
export const iniciarSesion = async (req, res, next) => { 
    try {
        const usuario = await loginService(req.body);
        const token = generarToken(usuario);
        return res.status(200).json({
            mensaje: "Inicio de sesión exitoso.",
            token: token,
            usuario: usuario
        });
    } catch (error) {
        return next(error);
    }
};

// GET 🟨 
export const obtenerMiPerfil = async (req, res, next) => {
    try {
        const usuario = await obtenerUsuarioPorId(req.usuario.id);
        if (!usuario) {
            res.set("WWW-Authenticate",
                'Bearer error="invalid_token"');
            return res.status(401).json({
                mensaje: "La cuenta asociada al token no existe."
            });
        }
        return res.status(200).json({ usuario: usuario });
    } catch (error) {
        return next(error);
    }
};

// POST - Registro público de Participante
export const registrarUsuarioParticipante = async (req, res, next) => {
    try {
        const datos = req.bodyValidado || req.body;
        const usuario = await registrarUsuarioParticipanteService(datos);
        return res.status(201).json(usuario);
    } catch (error) {
        return next(error);
    }
};