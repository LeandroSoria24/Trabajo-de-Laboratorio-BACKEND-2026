import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';
/* 🟥 */
export const crearLocalidad = async (dto) => {
    const { nombre, provincia = "Catamarca" } = dto;

    const existe = await prisma.localidad.findUnique({
        where: { nombre }
    });
    if (existe) {
        throw crearError(`Ya existe una localidad con el nombre '${nombre}'`, 400);
    }

    return prisma.localidad.create({
        data: {
            nombre,
            provincia
        }
    });
};

export const obtenerLocalidades = async (criterios = {}) => {
    const {
        nombre,
        provincia,
        ordenarPor = 'nombre',
        direccion = 'asc',
        pagina = 1,
        limite = 20
    } = criterios;

    const where = {};

    if (nombre) {
        where.nombre = { contains: nombre, mode: 'insensitive' };
    }
    if (provincia) {
        where.provincia = { contains: provincia, mode: 'insensitive' };
    }

    const desplazamiento = (pagina - 1) * limite;

    const [localidades, total] = await prisma.$transaction([
        prisma.localidad.findMany({
            where,
            orderBy: [{ [ordenarPor]: direccion }, { id: 'asc' }],
            skip: desplazamiento,
            take: limite,
            include: {
                _count: {
                    select: { artesanos: true }
                }
            }
        }),
        prisma.localidad.count({ where })
    ]);

    return {
        localidades,
        paginacion: {
            pagina,
            limite,
            total,
            totalPaginas: Math.ceil(total / limite)
        }
    };
};

export const obtenerLocalidadPorId = async (id) => {
    const localidad = await prisma.localidad.findUnique({
        where: { id },
        include: {
            artesanos: true,
            _count: {
                select: { artesanos: true }
            }
        }
    });

    if (!localidad) {
        throw crearError(`No existe una localidad con id ${id}`, 404);
    }

    return localidad;
};

export const actualizarLocalidad = async (id, dto) => {
    const localidad = await prisma.localidad.findUnique({ where: { id } });
    if (!localidad) {
        throw crearError(`No existe una localidad con id ${id}`, 404);
    }

    const { nombre, provincia } = dto;

    if (nombre && nombre !== localidad.nombre) {
        const existe = await prisma.localidad.findUnique({ where: { nombre } });
        if (existe) {
            throw crearError(`Ya existe una localidad con el nombre '${nombre}'`, 400);
        }
    }

    return prisma.localidad.update({
        where: { id },
        data: {
            ...(nombre !== undefined && { nombre }),
            ...(provincia !== undefined && { provincia })
        }
    });
};

export const eliminarLocalidad = async (id) => {
    const localidad = await prisma.localidad.findUnique({
        where: { id },
        include: {
            _count: { select: { artesanos: true } }
        }
    });

    if (!localidad) {
        throw crearError(`No existe una localidad con id ${id}`, 404);
    }

    if (localidad._count.artesanos > 0) {
        throw crearError(`No se puede eliminar la localidad porque tiene artesanos asociados`, 400);
    }

    return prisma.localidad.delete({ where: { id } });
};
