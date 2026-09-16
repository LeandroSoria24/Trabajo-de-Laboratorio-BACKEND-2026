import { crearError } from '../utils/crearError.js';
import prisma from '../config/prisma.js';

/* GET de todos los artesanos */
export const getArtesanos = async (req, res, next) => {
    try {
        const artesanos = await prisma.artesano.findMany({
            include: {
                productos: true
            }
        });
        res.json(artesanos);
    } catch (error) {
        next(error);
    }
};

/* GET Artesano por el ID */
export const getArtesanoPorId = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return next(crearError('El ID proporcionado no es válido', 400));
        }

        const artesano = await prisma.artesano.findUnique({
            where: { id },
            include: {
                productos: true
            }
        });

        if (!artesano) {
            return next(crearError(`No existe un artesano con id ${id}`, 404));
        }

        res.json(artesano);
    } catch (error) {
        next(error);
    }
};

/* POST crear Artesano */
export const createArtesano = async (req, res, next) => {
    try {
        const {
            nombre,
            apellido,
            dni,
            email,
            telefono,
            localidad,
            rubro,
            nombreEmprendimiento,
            descripcionTrayectoria
        } = req.body;

        if (!nombre || !apellido || !dni || !email || !localidad || !rubro || !nombreEmprendimiento) {
            return next(crearError('Faltan campos obligatorios: nombre, apellido, dni, email, localidad, rubro y nombreEmprendimiento son requeridos', 400));
        }

        // Verificar DNI o Email único
        const existeDni = await prisma.artesano.findUnique({ where: { dni: String(dni) } });
        if (existeDni) {
            return next(crearError(`Ya existe un artesano registrado con el DNI ${dni}`, 400));
        }

        const existeEmail = await prisma.artesano.findUnique({ where: { email: String(email) } });
        if (existeEmail) {
            return next(crearError(`Ya existe un artesano registrado con el email ${email}`, 400));
        }

        const nuevoArtesano = await prisma.artesano.create({
            data: {
                nombre: String(nombre).trim(),
                apellido: String(apellido).trim(),
                dni: String(dni).trim(),
                email: String(email).trim(),
                telefono: telefono ? String(telefono).trim() : null,
                localidad: String(localidad).trim(),
                rubro: String(rubro).trim(),
                nombreEmprendimiento: String(nombreEmprendimiento).trim(),
                descripcionTrayectoria: descripcionTrayectoria ? String(descripcionTrayectoria).trim() : null
            }
        });

        res.status(201).json(nuevoArtesano);
    } catch (error) {
        next(error);
    }
};

/* PUT Actualizar Artesano */
export const updateArtesano = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return next(crearError('El ID proporcionado no es válido', 400));
        }

        const existeArtesano = await prisma.artesano.findUnique({ where: { id } });
        if (!existeArtesano) {
            return next(crearError(`No existe un artesano con id ${id}`, 404));
        }

        const {
            nombre,
            apellido,
            telefono,
            localidad,
            rubro,
            nombreEmprendimiento,
            descripcionTrayectoria
        } = req.body;

        const artesanoActualizado = await prisma.artesano.update({
            where: { id },
            data: {
                ...(nombre !== undefined ? { nombre: String(nombre).trim() } : {}),
                ...(apellido !== undefined ? { apellido: String(apellido).trim() } : {}),
                ...(telefono !== undefined ? { telefono: telefono ? String(telefono).trim() : null } : {}),
                ...(localidad !== undefined ? { localidad: String(localidad).trim() } : {}),
                ...(rubro !== undefined ? { rubro: String(rubro).trim() } : {}),
                ...(nombreEmprendimiento !== undefined ? { nombreEmprendimiento: String(nombreEmprendimiento).trim() } : {}),
                ...(descripcionTrayectoria !== undefined ? { descripcionTrayectoria: descripcionTrayectoria ? String(descripcionTrayectoria).trim() : null } : {})
            }
        });

        res.json(artesanoActualizado);
    } catch (error) {
        next(error);
    }
};

/* DELETE Eliminar Artesano */
export const deleteArtesano = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return next(crearError('El ID proporcionado no es válido', 400));
        }

        const existeArtesano = await prisma.artesano.findUnique({ where: { id } });
        if (!existeArtesano) {
            return next(crearError(`No existe un artesano con id ${id}`, 404));
        }

        await prisma.artesano.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
