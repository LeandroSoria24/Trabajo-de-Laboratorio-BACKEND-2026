import { Router } from "express";
import {
    getPabellones,
    getPabellonPorId,
    createPabellon,
    updatePabellon,
    deletePabellon
} from '../controllers/pabellon.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { autenticarUsuario } from '../middlewares/autenticarUsuario.js';
import { cargarContextoUsuario, autorizarRoles } from '../middlewares/autorizacion.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearPabellonSchema,
    actualizarPabellonSchema,
    obtenerPabellonesSchema
} from '../validators/pabellon.schemas.js';

const router = Router();

// Rutas públicas de consulta
router.get('/', validarSchema(obtenerPabellonesSchema, 'query'), getPabellones);
router.get('/:id', validarSchema(idParamSchema, 'params'), getPabellonPorId);

// Rutas de administración
const soloAdmin = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ADMINISTRADOR")];

router.post('/', ...soloAdmin, validarSchema(crearPabellonSchema, 'body'), createPabellon);
router.put('/:id', ...soloAdmin, validarSchema(idParamSchema, 'params'), validarSchema(actualizarPabellonSchema, 'body'), updatePabellon);
router.delete('/:id', ...soloAdmin, validarSchema(idParamSchema, 'params'), deletePabellon);

export default router;
