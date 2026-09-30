import { Router } from "express";
import {
    postUsuario,
    iniciarSesion
} from '../controllers/usuario.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { idParamSchema } from '../validators/comun.schemas.js';
import {
    registrarUsuarioSchema,
    iniciarSesionSchema
} from '../validators/usuario.schemas.js';

const router = Router();

router.post("/registro", validarSchema(registrarUsuarioSchema, 'body'), postUsuario);
router.post("/login", validarSchema(iniciarSesionSchema, 'body'), iniciarSesion);

export default router;
