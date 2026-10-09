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
import { autenticarUsuario } from "../middlewares/autenticarUsuario.js";/*🟨 */
import { obtenerMiPerfil } from "../controllers/usuario.controllers.js";/*🟨 */
import { cerrarSesion } from"../controllers/sesiones.controllers.js";/*🟨 */

const router = Router();

router.post("/registro", validarSchema(registrarUsuarioSchema, 'body'), postUsuario); /* 🟩 */
router.post("/login", validarSchema(iniciarSesionSchema, 'body'), iniciarSesion); /* 🟩 */
router.get("/me",autenticarUsuario,obtenerMiPerfil);/*🟨 */
router.post("/logout",autenticarUsuario,cerrarSesion);/*🟨 */
export default router;
