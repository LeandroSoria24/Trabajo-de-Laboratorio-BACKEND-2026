import {
    crearMiSolicitud,
    listarMisSolicitudes,
    cancelarMiSolicitud,
    listarTodasSolicitudes,
    evaluarSolicitud,
    asignarStandASolicitud
} from '../services/solicitud.services.js';

// POST /solicitudes - Crear postulación propia
export const postCrearMiSolicitud = async (req, res, next) => {
    try {
        const dto = req.bodyValidado || req.body;
        const solicitud = await crearMiSolicitud(req.contextoUsuario.id, dto);
        return res.status(201).json({
            mensaje: "Solicitud de postulación presentada exitosamente.",
            solicitud
        });
    } catch (error) {
        return next(error);
    }
};

// GET /solicitudes/me - Listar mis solicitudes
export const getMisSolicitudes = async (req, res, next) => {
    try {
        const solicitudes = await listarMisSolicitudes(req.contextoUsuario.id);
        return res.json(solicitudes);
    } catch (error) {
        return next(error);
    }
};

// PATCH /solicitudes/:id/cancelar - Cancelar mi postulación
export const patchCancelarMiSolicitud = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const cancelada = await cancelarMiSolicitud(req.contextoUsuario.id, id);
        return res.json({
            mensaje: "Solicitud de postulación cancelada exitosamente.",
            solicitud: cancelada
        });
    } catch (error) {
        return next(error);
    }
};

// GET /solicitudes - Listado global para el administrador
export const getTodasSolicitudes = async (req, res, next) => {
    try {
        const resultado = await listarTodasSolicitudes(req.consulta || req.query);
        return res.json(resultado);
    } catch (error) {
        return next(error);
    }
};

// PATCH /solicitudes/:id/evaluar - Dictaminar solicitud (Solo Administrador)
export const patchEvaluarSolicitud = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const dto = req.bodyValidado || req.body;
        const resultado = await evaluarSolicitud(id, req.contextoUsuario.id, dto);
        return res.json({
            mensaje: `Solicitud dictaminada como ${dto.estado}.`,
            solicitud: resultado
        });
    } catch (error) {
        return next(error);
    }
};

// PATCH /solicitudes/:id/asignar-stand - Asignar stand a solicitud aprobada (Solo Administrador)
export const patchAsignarStand = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { standId } = req.bodyValidado || req.body || {};
        const resultado = await asignarStandASolicitud(id, standId);
        return res.json(resultado);
    } catch (error) {
        return next(error);
    }
};
