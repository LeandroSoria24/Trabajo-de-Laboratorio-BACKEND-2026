import {
    obtenerLocalidades,
    obtenerLocalidadPorId,
   /*  sincronizarDesdeGeoref */
} from '../services/localidad.services.js';

// GET   🟩 
export const getLocalidades = async (req, res, next) => {
    try {
        const resultado = await obtenerLocalidades(req.consulta);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
};

// GET por ID 🟩 
export const getLocalidadPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const localidad = await obtenerLocalidadPorId(id);
        res.json(localidad);
    } catch (error) {
        next(error);
    }
};

//servicio para llenar la base de datos con localidades de toda la argentina
//Descomentar para usar
/* export const postSincronizarGeoref = async (req, res, next) => {
    try {
        const resultado = await sincronizarDesdeGeoref();
        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};
 */