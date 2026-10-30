import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';

/*
  Servicio para la creación de un nuevo Pabellón.
  Verifica que el nombre no se encuentre repetido (regla de unicidad).
*/
export const crearPabellon = async (crearPabellonDto) => {
    const { nombre } = crearPabellonDto;

    const existe = await prisma.pabellon.findUnique({
        where: { nombre }
    });
    if (existe) {
        throw crearError(`Ya existe un pabellón registrado con el nombre '${nombre}'`, 400);
    }

    return prisma.pabellon.create({
        data: { nombre }
    });
};

/*
  Servicio para obtener la lista de pabellones.
  Permite filtrado por nombre y ordenamiento.
*/
export const obtenerPabellones = async (criterios = {}) => {
    const { nombre, ordenarPor = 'nombre', direccion = 'asc' } = criterios;

    const where = {};
    if (nombre) {
        where.nombre = { contains: nombre, mode: 'insensitive' };
    }

    return prisma.pabellon.findMany({
        where,
        orderBy: [{ [ordenarPor]: direccion }, { id: 'asc' }],
        include: {
            _count: {
                select: { stands: true }
            }
        }
    });
};

/*
  Servicio para obtener un pabellón específico por su ID.
*/
export const obtenerPabellonPorId = async (id) => {
    const pabellon = await prisma.pabellon.findUnique({
        where: { id },
        include: {
            stands: {
                include: {
                    sector: true,
                    artesano: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            nombreEmprendimiento: true
                        }
                    }
                }
            }
        }
    });

    if (!pabellon) {
        throw crearError(`No existe un pabellón con id ${id}`, 404);
    }

    return pabellon;
};

/*
  Servicio para actualizar el nombre de un pabellón.
*/
export const actualizarPabellon = async (id, actualizarPabellonDto) => {
    const pabellon = await prisma.pabellon.findUnique({
        where: { id }
    });
    if (!pabellon) {
        throw crearError(`No existe un pabellón con id ${id}`, 404);
    }

    const { nombre } = actualizarPabellonDto;

    if (nombre && nombre !== pabellon.nombre) {
        const existe = await prisma.pabellon.findUnique({
            where: { nombre }
        });
        if (existe) {
            throw crearError(`Ya existe otro pabellón registrado con el nombre '${nombre}'`, 400);
        }
    }

    return prisma.pabellon.update({
        where: { id },
        data: { nombre }
    });
};

/*
  Servicio para eliminar un pabellón.
  Regla de integridad: No se puede eliminar si posee stands vinculados.
*/
export const eliminarPabellon = async (id) => {
    const pabellon = await prisma.pabellon.findUnique({
        where: { id },
        include: {
            _count: {
                select: { stands: true }
            }
        }
    });

    if (!pabellon) {
        throw crearError(`No existe un pabellón con id ${id}`, 404);
    }

    if (pabellon._count.stands > 0) {
        throw crearError(`No se puede eliminar el pabellón '${pabellon.nombre}' porque contiene ${pabellon._count.stands} stands asociados`, 400);
    }

    return prisma.pabellon.delete({
        where: { id }
    });
};
