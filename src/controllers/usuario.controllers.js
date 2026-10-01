import { registrarUsuario, iniciarSesion as loginService } from '../services/usuario.services.js';

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

export const iniciarSesion = async (req, res, next) => {
    try {
        const usuario = await loginService(req.body);
        res.status(200).json({
            mensaje: "Inicio de sesión exitoso",
            usuario
        });
    } catch (error) {
        next(error);
    }
}; 