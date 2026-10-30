import {
    crearSector,
    obtenerSectores,
    obtenerSectorPorId,
    actualizarSector,
    eliminarSector
} from '../services/sector.services.js';

// GET 🟩 
export const getSectores = async (req, res, next) => {
    try {
        const resultado = await obtenerSectores(req.consulta);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
};

// GET por ID 🟩 
export const getSectorPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const sector = await obtenerSectorPorId(id);
        res.json(sector);
    } catch (error) {
        next(error);
    }
};

// POST 🟩 
export const createSector = async (req, res, next) => {
    try {
        const nuevoSector = await crearSector(req.body);
        res.status(201).json(nuevoSector);
    } catch (error) {
        next(error);
    }
};

// PUT 🟩 
export const updateSector = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const sectorActualizado = await actualizarSector(id, req.body);
        res.json(sectorActualizado);
    } catch (error) {
        next(error);
    }
};

// DELETE 🟩 
export const deleteSector = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await eliminarSector(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
