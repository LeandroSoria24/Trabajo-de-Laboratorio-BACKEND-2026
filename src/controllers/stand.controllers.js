import {
    crearStand,
    obtenerStands,
    obtenerStandPorId,
    actualizarStand,
    asignarArtesanoAStand,
    liberarStand,
    eliminarStand
} from '../services/stand.services.js';

// GET 🟩 
export const getStands = async (req, res, next) => {
    try {
        const resultado = await obtenerStands(req.consulta);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
};

// GET por ID 🟩 
export const getStandPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const stand = await obtenerStandPorId(id);
        res.json(stand);
    } catch (error) {
        next(error);
    }
};

// POST 🟩 
export const createStand = async (req, res, next) => {
    try {
        const nuevoStand = await crearStand(req.body);
        res.status(201).json(nuevoStand);
    } catch (error) {
        next(error);
    }
};

// PUT 🟩 
export const updateStand = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const standActualizado = await actualizarStand(id, req.body);
        res.json(standActualizado);
    } catch (error) {
        next(error);
    }
};

// PATCH 🟩 
export const patchAsignarArtesano = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { artesanoId } = req.body;
        const standAsignado = await asignarArtesanoAStand(id, artesanoId);
        res.json(standAsignado);
    } catch (error) {
        next(error);
    }
};

// PATCH 🟩 
export const patchLiberarStand = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const standLiberado = await liberarStand(id);
        res.json(standLiberado);
    } catch (error) {
        next(error);
    }
};

// DELETE 🟩 
export const deleteStand = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await eliminarStand(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
