import {
    crearStand,
    actualizarStand,
    obtenerStands,
    obtenerStandPorId,
    asignarStand,
    desasignarStand,
    eliminarStand
} from '../services/stand.services.js';
/* 🟥 */
export const getStands = async (req, res, next) => {
    try {
        const resultado = await obtenerStands(req.consulta);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
};

export const getStandPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const stand = await obtenerStandPorId(id);
        res.json(stand);
    } catch (error) {
        next(error);
    }
};

export const postStand = async (req, res, next) => {
    try {
        const nuevoStand = await crearStand(req.body);
        res.status(201).json(nuevoStand);
    } catch (error) {
        next(error);
    }
};

export const putStand = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const standActualizado = await actualizarStand(id, req.body);
        res.json(standActualizado);
    } catch (error) {
        next(error);
    }
};

export const postAsignarStand = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { artesanoId } = req.body;
        const standAsignado = await asignarStand(id, artesanoId);
        res.json({
            mensaje: "Stand asignado exitosamente",
            stand: standAsignado
        });
    } catch (error) {
        next(error);
    }
};

export const patchDesasignarStand = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const standLiberado = await desasignarStand(id);
        res.json({
            mensaje: "Stand liberado exitosamente",
            stand: standLiberado
        });
    } catch (error) {
        next(error);
    }
};

export const deleteStand = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await eliminarStand(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
