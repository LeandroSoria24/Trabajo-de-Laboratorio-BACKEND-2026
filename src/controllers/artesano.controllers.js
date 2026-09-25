import {
    crearArtesano,
    actualizarArtesano,
    obtenerArtesanos,
    obtenerArtesanoPorId,
    eliminarArtesano
} from '../services/artesano.services.js';

// GETTERS 🟩
export const getArtesanos = async (req, res, next) => { 
    try {
        const resultado = await obtenerArtesanos(req.consulta);
        res.json(resultado);
    }
    catch (error) {
        next(error);
    }
};


//GET POR ID 🟩
export const getArtesanoPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const artesano = await obtenerArtesanoPorId(id)
        res.json(artesano);
    }
    catch (error) {
        next(error);
    }
};

// POST 🟩
export const createArtesano = async (req, res, next) => {
    try {
        // req.body ya contiene los datos validados por el middleware Zod (DTO)
        const crearArtesanoDto = req.body;
        const nuevoArtesano = await crearArtesano(crearArtesanoDto);
        return res.status(201).json(nuevoArtesano);
    } catch (error) {
        return next(error);
    }
};

// PUT 🟩
export const updateArtesano = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const actualizarArtesanoDto = req.body;
        const artesanoActualizado = await actualizarArtesano(id, actualizarArtesanoDto);
        return res.json(artesanoActualizado);
    } catch (error) {
        return next(error);
    }
};

// DELETE  🟩
export const deleteArtesano = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await eliminarArtesano(id);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
