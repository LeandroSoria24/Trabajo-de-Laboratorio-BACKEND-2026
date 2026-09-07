import { Router } from "express";
import { 
    getAutores,
    getAutorPorId,
    createAutor,
    updateAutor,
    deleteAutor 
} from '../controllers/autores.controllers.js'


const router = Router();

router.get('/', getAutores);
router.get('/:id', getAutorPorId);
router.post('/', createAutor);
router.put('/:id', updateAutor);
router.delete('/:id', deleteAutor);

export default router;