import { Router } from "express";
import { 
    getLibros, 
    getLibrosFiltrados, 
    getLibroPorId, 
    createLibro, 
    updateLibro, 
    deleteLibro 
} from '../controllers/libro.controllers.js';
import { validarId } from '../middlewares/validarId.js';
import { validarLibro } from '../middlewares/validadlibro.js';
const router = Router();

router.get('/', getLibros);
router.get('/filtrados', getLibrosFiltrados);
router.get('/:id', validarId, getLibroPorId);
router.post('/', validarLibro, createLibro);
router.put('/:id', validarId, validarLibro, updateLibro);
router.delete('/:id', validarId, deleteLibro);

export default router;
