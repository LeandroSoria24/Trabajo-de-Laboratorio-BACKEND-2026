import {
    crearUsuario,
    obtenerUsuarios,
    obtenerUsuarioPorId,
    actualizarUsuario,
    eliminarUsuario
} from '../services/usuario.services.js';

export const getUsuarios = async (req, res, next) => {
    try {
        const resultado = await obtenerUsuarios(req.consulta);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
};

export const getUsuarioPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const usuario = await obtenerUsuarioPorId(id);
        res.json(usuario);
    } catch (error) {
        next(error);
    }
};

export const postUsuario = async (req, res, next) => {
    try {
        const nuevoUsuario = await crearUsuario(req.body);
        res.status(201).json(nuevoUsuario);
    } catch (error) {
        next(error);
    }
};

export const putUsuario = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const usuarioActualizado = await actualizarUsuario(id, req.body);
        res.json(usuarioActualizado);
    } catch (error) {
        next(error);
    }
};

export const deleteUsuario = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await eliminarUsuario(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
