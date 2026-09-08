import { Router } from "express";
import { 
    getLibros, 
    getLibrosFiltrados, 
    getLibroPorId, 
    createLibro, 
    updateLibro, 
    deleteLibro 
} from '../controllers/libros.controllers.js';
import { validarId } from '../middlewares/validarId.js';

const router = Router();

router.get('/', getLibros);
router.get('/filtrados', getLibrosFiltrados);
router.get('/:id', validarId, getLibroPorId);
router.post('/', createLibro);
router.put('/:id', validarId, updateLibro);
router.delete('/:id', validarId, deleteLibro);

export default router;
