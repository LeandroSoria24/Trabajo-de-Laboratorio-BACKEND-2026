import {
    registrarUsuario,
    iniciarSesion as loginService,
    registrarAdministrador as registrarAdministradorService
} from '../services/usuario.services.js';
import { generarToken } from "../services/token.services.js";
import { cambiarActivo } from "../services/estado.services.js";

// POST - Registro público de usuario (adquiere rol ARTESANO por defecto)
export const postUsuario = async (req, res, next) => {
    try {
        const datos = req.bodyValidado || req.body;
        const nuevoUsuario = await registrarUsuario(datos);
        return res.status(201).json({
            mensaje: "Usuario registrado exitosamente con rol ARTESANO.",
            nuevoUsuario: nuevoUsuario
        });
    } catch (error) {
        return next(error);
    }
};

// POST - Inicio de sesión
export const iniciarSesion = async (req, res, next) => {
    try {
        const datos = req.bodyValidado || req.body;
        const usuario = await loginService(datos);
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

// GET - Perfil del usuario autenticado (cuenta, activo, roles y perfil artesano si existe)
export const obtenerMiPerfil = (req, res) => {
    return res.status(200).json({ usuario: req.contextoUsuario });
};

// POST - Crear un usuario administrador (solo ADMINISTRADOR puede hacerlo)
export const crearAdministrador = async (req, res, next) => {
    try {
        const usuario = await registrarAdministradorService(req.bodyValidado || req.body);
        return res.status(201).json({
            mensaje: "Administrador registrado exitosamente.",
            usuario: usuario
        });
    } catch (error) {
        return next(error);
    }
};

// PATCH - Activar o desactivar una cuenta de usuario
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