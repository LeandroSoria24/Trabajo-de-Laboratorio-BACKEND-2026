import { Router } from "express";
import { 
    getLibros, 
    getLibrosFiltrados, 
    getLibroPorId, 
    createLibro, 
    updateLibro, 
    deleteLibro 
} from '../controllers/libros.controllers.js';

const router = Router();

router.get('/', getLibros);
router.get('/filtrados', getLibrosFiltrados);
router.get('/:id', getLibroPorId);
router.post('/', createLibro);
router.put('/:id', updateLibro);
router.delete('/:id', deleteLibro);

export default router;
