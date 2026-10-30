import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';

/*
  Servicio para la creación de un nuevo Sector.
  Verifica que el nombre no se encuentre repetido (regla de unicidad).
*/
export const crearSector = async (crearSectorDto) => {
    const { nombre } = crearSectorDto;

    const existe = await prisma.sector.findUnique({
        where: { nombre }
    });
    if (existe) {
        throw crearError(`Ya existe un sector registrado con el nombre '${nombre}'`, 400);
    }

    return prisma.sector.create({
        data: { nombre }
    });
};

/*
  Servicio para obtener la lista de sectores.
  Permite filtrado por nombre y ordenamiento.
*/
export const obtenerSectores = async (criterios = {}) => {
    const { nombre, ordenarPor = 'nombre', direccion = 'asc' } = criterios;

    const where = {};
    if (nombre) {
        where.nombre = { contains: nombre, mode: 'insensitive' };
    }

    return prisma.sector.findMany({
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
  Servicio para obtener un sector específico por su ID.
*/
export const obtenerSectorPorId = async (id) => {
    const sector = await prisma.sector.findUnique({
        where: { id },
        include: {
            stands: {
                include: {
                    pabellon: true,
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

    if (!sector) {
        throw crearError(`No existe un sector con id ${id}`, 404);
    }

    return sector;
};

/*
  Servicio para actualizar el nombre de un sector.
*/
export const actualizarSector = async (id, actualizarSectorDto) => {
    const sector = await prisma.sector.findUnique({
        where: { id }
    });
    if (!sector) {
        throw crearError(`No existe un sector con id ${id}`, 404);
    }

    const { nombre } = actualizarSectorDto;

    if (nombre && nombre !== sector.nombre) {
        const existe = await prisma.sector.findUnique({
            where: { nombre }
        });
        if (existe) {
            throw crearError(`Ya existe otro sector registrado con el nombre '${nombre}'`, 400);
        }
    }

    return prisma.sector.update({
        where: { id },
        data: { nombre }
    });
};

/*
  Servicio para eliminar un sector.
  Regla de integridad: No se puede eliminar si posee stands vinculados.
*/
export const eliminarSector = async (id) => {
    const sector = await prisma.sector.findUnique({
        where: { id },
        include: {
            _count: {
                select: { stands: true }
            }
        }
    });

    if (!sector) {
        throw crearError(`No existe un sector con id ${id}`, 404);
    }

    if (sector._count.stands > 0) {
        throw crearError(`No se puede eliminar el sector '${sector.nombre}' porque contiene ${sector._count.stands} stands asociados`, 400);
    }

    return prisma.sector.delete({
        where: { id }
    });
};
