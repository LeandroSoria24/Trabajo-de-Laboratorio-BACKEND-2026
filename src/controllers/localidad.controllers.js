import {
    crearLocalidad,
    obtenerLocalidades,
    obtenerLocalidadPorId,
    actualizarLocalidad,
    eliminarLocalidad
} from '../services/localidad.services.js';
/* 🟥 */
export const getLocalidades = async (req, res, next) => {
    try {
        const resultado = await obtenerLocalidades(req.consulta);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
};

export const getLocalidadPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const localidad = await obtenerLocalidadPorId(id);
        res.json(localidad);
    } catch (error) {
        next(error);
    }
};

export const postLocalidad = async (req, res, next) => {
    try {
        const nuevaLocalidad = await crearLocalidad(req.body);
        res.status(201).json(nuevaLocalidad);
    } catch (error) {
        next(error);
    }
};

export const putLocalidad = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const localidadActualizada = await actualizarLocalidad(id, req.body);
        res.json(localidadActualizada);
    } catch (error) {
        next(error);
    }
};

export const deleteLocalidad = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await eliminarLocalidad(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
