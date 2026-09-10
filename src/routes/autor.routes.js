import { Router } from "express";
import { 
    getAutores,
    getAutorPorId,
    createAutor,
    updateAutor,
    deleteAutor 
} from '../controllers/autor.controllers.js';
import { validarId } from '../middlewares/validarId.js';

const router = Router();

router.get('/', getAutores);
router.get('/:id', validarId, getAutorPorId);
router.post('/', createAutor);
router.put('/:id', validarId, updateAutor);
router.delete('/:id', validarId, deleteAutor);

export default router;