import {
    crearArtesano,
    actualizarArtesano,
    obtenerArtesanos,
    obtenerArtesanoPorId,
    eliminarArtesano,
    obtenerMiPerfilArtesano,
    completarMiPerfilArtesano,
    actualizarMiPerfilArtesano,
    cambiarActivoArtesano
} from '../services/artesano.services.js';

// GET - Listar artesanos públicos
export const getArtesanos = async (req, res, next) => { 
    try {
        const resultado = await obtenerArtesanos(req.consulta || req.query);
        return res.json(resultado);
    } catch (error) {
        return next(error);
    }
};

// GET - Perfil de un artesano específico (Público)
export const getArtesanoPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const artesano = await obtenerArtesanoPorId(id);
        return res.json(artesano);
    } catch (error) {
        return next(error);
    }
};

// GET /artesanos/me - Perfil propio del artesano autenticado
export const getMiPerfil = async (req, res, next) => {
    try {
        const artesano = await obtenerMiPerfilArtesano(req.contextoUsuario.id);
        return res.json(artesano);
    } catch (error) {
        return next(error);
    }
};

// POST /artesanos/me - Completar datos del propio artesano
export const postCompletarPerfil = async (req, res, next) => {
    try {
        const datos = req.bodyValidado || req.body;
        const nuevoArtesano = await completarMiPerfilArtesano(
            req.contextoUsuario.id,
            req.contextoUsuario.email,
            datos
        );
        return res.status(201).json({
            mensaje: "Perfil de artesano creado exitosamente (pendiente de aprobación).",
            artesano: nuevoArtesano
        });
    } catch (error) {
        return next(error);
    }
};

// PUT /artesanos/me - Modificar datos del propio artesano
export const putMiPerfil = async (req, res, next) => {
    try {
        const datos = req.bodyValidado || req.body;
        const artesano = await actualizarMiPerfilArtesano(req.contextoUsuario.id, datos);
        return res.json({
            mensaje: "Perfil de artesano actualizado.",
            artesano: artesano
        });
    } catch (error) {
        return next(error);
    }
};

// POST /artesanos - Crear artesano desde panel de admin
export const createArtesano = async (req, res, next) => {
    try {
        const crearArtesanoDto = req.bodyValidado || req.body;
        const nuevoArtesano = await crearArtesano(crearArtesanoDto);
        return res.status(201).json(nuevoArtesano);
    } catch (error) {
        return next(error);
    }
};

// PUT /artesanos/:id - Actualizar artesano desde panel de admin
export const updateArtesano = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const actualizarArtesanoDto = req.bodyValidado || req.body;
        const artesanoActualizado = await actualizarArtesano(id, actualizarArtesanoDto);
        return res.json(artesanoActualizado);
    } catch (error) {
        return next(error);
    }
};

// PATCH /artesanos/:id/activo - Activar/desactivar artesano (Solo ADMINISTRADOR)
export const patchActivoArtesano = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { activo } = req.bodyValidado || req.body;
        const artesano = await cambiarActivoArtesano(id, activo);
        return res.json({
            mensaje: `Estado del artesano actualizado a ${activo ? 'activo' : 'inactivo'}.`,
            artesano
        });
    } catch (error) {
        return next(error);
    }
};

// DELETE /artesanos/:id - Baja lógica (Soft delete) (Solo ADMINISTRADOR)
export const deleteArtesano = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await eliminarArtesano(id);
        return res.status(200).json({ mensaje: "Artesano dado de baja (inactivo)." });
    } catch (error) {
        return next(error);
    }
};
