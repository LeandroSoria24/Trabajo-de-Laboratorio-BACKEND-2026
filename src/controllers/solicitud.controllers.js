import {
    crearSolicitud,
    obtenerSolicitudes,
    obtenerSolicitudPorId,
    evaluarSolicitud,
    eliminarSolicitud
} from '../services/solicitud.services.js';

export const getSolicitudes = async (req, res, next) => {
    try {
        const resultado = await obtenerSolicitudes(req.consulta);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
};

export const getSolicitudPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const solicitud = await obtenerSolicitudPorId(id);
        res.json(solicitud);
    } catch (error) {
        next(error);
    }
};

export const postSolicitud = async (req, res, next) => {
    try {
        const nuevaSolicitud = await crearSolicitud(req.body);
        res.status(201).json(nuevaSolicitud);
    } catch (error) {
        next(error);
    }
};

export const patchEvaluarSolicitud = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const solicitudEvaluada = await evaluarSolicitud(id, req.body);
        res.json({
            mensaje: "Solicitud evaluada exitosamente",
            solicitud: solicitudEvaluada
        });
    } catch (error) {
        next(error);
    }
};

export const deleteSolicitud = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await eliminarSolicitud(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
