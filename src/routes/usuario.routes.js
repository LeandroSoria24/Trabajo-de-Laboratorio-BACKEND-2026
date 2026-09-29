import { Router } from "express";
import {
    getUsuarios,
    getUsuarioPorId,
    postUsuario,
    putUsuario,
    deleteUsuario
} from '../controllers/usuario.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    crearUsuarioSchema,
    actualizarUsuarioSchema,
    obtenerUsuariosSchema
} from '../validators/usuario.schemas.js';
/* 🟥 */
const router = Router();

router.get('/', validarSchema(obtenerUsuariosSchema, 'query'), getUsuarios);
router.get('/:id', validarSchema(idParamSchema, 'params'), getUsuarioPorId);
router.post('/', validarSchema(crearUsuarioSchema, 'body'), postUsuario);
router.put('/:id', validarSchema(idParamSchema, 'params'), validarSchema(actualizarUsuarioSchema, 'body'), putUsuario);
router.delete('/:id', validarSchema(idParamSchema, 'params'), deleteUsuario);

export default router;
