import { Router } from "express";
import {
    getArtesanos,
    getArtesanoPorId,
    getMiPerfil,
    postCompletarPerfil,
    putMiPerfil,
    createArtesano,
    updateArtesano,
    patchActivoArtesano,
    deleteArtesano
} from '../controllers/artesano.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { autenticarUsuario } from '../middlewares/autenticarUsuario.js';
import { cargarContextoUsuario, autorizarRoles } from '../middlewares/autorizacion.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearArtesanoSchema,
    actualizarArtesanoSchema,
    obtenerArtesanosSchema,
    completarPerfilArtesanoSchema,
    actualizarMiPerfilArtesanoSchema
} from '../validators/artesano.schemas.js';
import { actualizarActivoSchema } from '../validators/estado.schemas.js';

const router = Router();

const soloArtesano = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ARTESANO")];
const soloAdmin = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ADMINISTRADOR")];

// ──────────────────────────────────────────────────────
// GESTIÓN DEL PROPIO PERFIL (Artesano Autenticado)
// ⚠️ IMPORTANTE: '/me' debe ir antes de '/:id' para que Express no lo tome como ID numérico
// ──────────────────────────────────────────────────────

router.get('/me', ...soloArtesano, getMiPerfil);
router.post('/me', ...soloArtesano, validarSchema(completarPerfilArtesanoSchema, 'body'), postCompletarPerfil);
router.put('/me', ...soloArtesano, validarSchema(actualizarMiPerfilArtesanoSchema, 'body'), putMiPerfil);

// ──────────────────────────────────────────────────────
// CONSULTA PÚBLICA (Visitantes y catálogo)
// ──────────────────────────────────────────────────────

router.get('/', validarSchema(obtenerArtesanosSchema, 'query'), getArtesanos);
router.get('/:id', validarSchema(idParamSchema, 'params'), getArtesanoPorId);

// ──────────────────────────────────────────────────────
// ADMINISTRACIÓN DE ARTESANOS (Solo ADMINISTRADOR)
// ──────────────────────────────────────────────────────

router.post('/', ...soloAdmin, validarSchema(crearArtesanoSchema, 'body'), createArtesano);
router.put('/:id', ...soloAdmin, validarSchema(idParamSchema, 'params'), validarSchema(actualizarArtesanoSchema, 'body'), updateArtesano);
router.patch('/:id/activo', ...soloAdmin, validarSchema(idParamSchema, 'params'), validarSchema(actualizarActivoSchema, 'body'), patchActivoArtesano);
router.delete('/:id', ...soloAdmin, validarSchema(idParamSchema, 'params'), deleteArtesano);

export default router;
