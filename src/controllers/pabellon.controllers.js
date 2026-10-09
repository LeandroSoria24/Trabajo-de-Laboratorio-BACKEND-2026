import {
    crearPabellon,
    obtenerPabellones,
    obtenerPabellonPorId,
    actualizarPabellon,
    eliminarPabellon
} from '../services/pabellon.services.js';

// GET 🟩 
export const getPabellones = async (req, res, next) => {
    try {
        const resultado = await obtenerPabellones(req.consulta);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
};

// GET por ID 🟩 
export const getPabellonPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const pabellon = await obtenerPabellonPorId(id);
        res.json(pabellon);
    } catch (error) {
        next(error);
    }
};

// POST 🟩 
export const createPabellon = async (req, res, next) => {
    try {
        const nuevoPabellon = await crearPabellon(req.body);
        res.status(201).json(nuevoPabellon);
    } catch (error) {
        next(error);
    }
};

// PUT 🟩 
export const updatePabellon = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const pabellonActualizado = await actualizarPabellon(id, req.body);
        res.json(pabellonActualizado);
    } catch (error) {
        next(error);
    }
};

// DELETE 🟩 
export const deletePabellon = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await eliminarPabellon(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
