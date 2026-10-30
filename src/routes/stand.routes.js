import { Router } from "express";
import {
    getStands,
    getStandPorId,
    createStand,
    updateStand,
    patchAsignarArtesano,
    patchLiberarStand,
    deleteStand
} from '../controllers/stand.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { autenticarUsuario } from '../middlewares/autenticarUsuario.js';
import { cargarContextoUsuario, autorizarRoles } from '../middlewares/autorizacion.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearStandSchema,
    actualizarStandSchema,
    obtenerStandsSchema,
    asignarArtesanoSchema
} from '../validators/stand.schemas.js';

const router = Router();

// ──────────────────────────────────────────────────────
// RUTAS PÚBLICAS (Visitantes y consulta de catálogo)
// ──────────────────────────────────────────────────────

router.get('/', validarSchema(obtenerStandsSchema, 'query'), getStands);
router.get('/:id', validarSchema(idParamSchema, 'params'), getStandPorId);

// ──────────────────────────────────────────────────────
// RUTAS PROTEGIDAS - SOLO ADMINISTRADOR
// ──────────────────────────────────────────────────────

const soloAdmin = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ADMINISTRADOR")];

router.post('/', ...soloAdmin, validarSchema(crearStandSchema, 'body'), createStand);
router.put('/:id', ...soloAdmin, validarSchema(idParamSchema, 'params'), validarSchema(actualizarStandSchema, 'body'), updateStand);
router.patch('/:id/asignar-artesano', ...soloAdmin, validarSchema(idParamSchema, 'params'), validarSchema(asignarArtesanoSchema, 'body'), patchAsignarArtesano);
router.patch('/:id/liberar', ...soloAdmin, validarSchema(idParamSchema, 'params'), patchLiberarStand);
router.delete('/:id', ...soloAdmin, validarSchema(idParamSchema, 'params'), deleteStand);

export default router;
