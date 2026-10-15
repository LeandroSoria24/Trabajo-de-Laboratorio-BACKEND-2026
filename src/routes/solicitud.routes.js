import { Router } from "express";
import {
    postCrearMiSolicitud,
    getMisSolicitudes,
    patchCancelarMiSolicitud,
    getTodasSolicitudes,
    patchEvaluarSolicitud,
    patchAsignarStand
} from '../controllers/solicitud.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { autenticarUsuario } from '../middlewares/autenticarUsuario.js';
import { cargarContextoUsuario, autorizarRoles } from '../middlewares/autorizacion.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearSolicitudSchema,
    evaluarSolicitudSchema,
    asignarStandSolicitudSchema,
    filtrarSolicitudesSchema
} from '../validators/solicitud.schemas.js';

const router = Router();

const soloArtesano = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ARTESANO")];
const soloAdmin = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ADMINISTRADOR")];

// ──────────────────────────────────────────────────────
// GESTIÓN DEL ARTESANO (Recursos propios)
// ⚠️ /me debe ir antes de /:id
// ──────────────────────────────────────────────────────

router.get('/me', ...soloArtesano, getMisSolicitudes);
router.post('/', ...soloArtesano, validarSchema(crearSolicitudSchema, 'body'), postCrearMiSolicitud);
router.patch('/:id/cancelar', ...soloArtesano, validarSchema(idParamSchema, 'params'), patchCancelarMiSolicitud);

// ──────────────────────────────────────────────────────
// GESTIÓN DE ADMINISTRACIÓN (Auditoría, evaluación y stands)
// ──────────────────────────────────────────────────────

router.get('/', ...soloAdmin, validarSchema(filtrarSolicitudesSchema, 'query'), getTodasSolicitudes);
router.patch('/:id/evaluar', ...soloAdmin, validarSchema(idParamSchema, 'params'), validarSchema(evaluarSolicitudSchema, 'body'), patchEvaluarSolicitud);
router.patch('/:id/asignar-stand', ...soloAdmin, validarSchema(idParamSchema, 'params'), validarSchema(asignarStandSolicitudSchema, 'body'), patchAsignarStand);

export default router;
