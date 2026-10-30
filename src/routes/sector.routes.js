import { Router } from "express";
import {
    getSectores,
    getSectorPorId,
    createSector,
    updateSector,
    deleteSector
} from '../controllers/sector.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { autenticarUsuario } from '../middlewares/autenticarUsuario.js';
import { cargarContextoUsuario, autorizarRoles } from '../middlewares/autorizacion.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearSectorSchema,
    actualizarSectorSchema,
    obtenerSectoresSchema
} from '../validators/sector.schemas.js';

const router = Router();

// Rutas públicas de consulta
router.get('/', validarSchema(obtenerSectoresSchema, 'query'), getSectores);
router.get('/:id', validarSchema(idParamSchema, 'params'), getSectorPorId);

// Rutas de administración
const soloAdmin = [autenticarUsuario, cargarContextoUsuario, autorizarRoles("ADMINISTRADOR")];

router.post('/', ...soloAdmin, validarSchema(crearSectorSchema, 'body'), createSector);
router.put('/:id', ...soloAdmin, validarSchema(idParamSchema, 'params'), validarSchema(actualizarSectorSchema, 'body'), updateSector);
router.delete('/:id', ...soloAdmin, validarSchema(idParamSchema, 'params'), deleteSector);

export default router;
