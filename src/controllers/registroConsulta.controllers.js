import {
    crearRegistroConsulta,
    obtenerRegistroConsultas,
    obtenerRegistroConsultaPorId,
    eliminarRegistroConsulta
} from '../services/registroConsulta.services.js';
/* 🟥 */
export const getRegistroConsultas = async (req, res, next) => {
    try {
        const resultado = await obtenerRegistroConsultas(req.consulta);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
};

export const getRegistroConsultaPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const consulta = await obtenerRegistroConsultaPorId(id);
        res.json(consulta);
    } catch (error) {
        next(error);
    }
};

export const postRegistroConsulta = async (req, res, next) => {
    try {
        const nuevaConsulta = await crearRegistroConsulta(req.body);
        res.status(201).json(nuevaConsulta);
    } catch (error) {
        next(error);
    }
};

export const deleteRegistroConsulta = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await eliminarRegistroConsulta(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
