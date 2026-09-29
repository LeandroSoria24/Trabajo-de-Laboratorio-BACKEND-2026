import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';
/* 🟥 */
export const crearSolicitud = async (dto) => {
    const { usuarioId, datos_personales, datos_emprendimiento } = dto;

    if (usuarioId) {
        const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
        if (!usuario) {
            throw crearError(`No existe un usuario con id ${usuarioId}`, 404);
        }
    }

    return prisma.solicitudPostulacion.create({
        data: {
            usuarioId: usuarioId ?? null,
            datos_personales,
            datos_emprendimiento,
            estado: "PENDIENTE"
        },
        include: {
            usuario: {
                select: { id: true, email: true, rol: true }
            }
        }
    });
};

export const obtenerSolicitudes = async (criterios = {}) => {
    const {
        estado,
        usuarioId,
        ordenarPor = 'createdAt',
        direccion = 'desc',
        pagina = 1,
        limite = 10
    } = criterios;

    const where = {};

    if (estado) {
        where.estado = estado;
    }
    if (usuarioId !== undefined) {
        where.usuarioId = usuarioId;
    }

    const desplazamiento = (pagina - 1) * limite;

    const [solicitudes, total] = await prisma.$transaction([
        prisma.solicitudPostulacion.findMany({
            where,
            orderBy: [{ [ordenarPor]: direccion }, { id: 'desc' }],
            skip: desplazamiento,
            take: limite,
            include: {
                usuario: {
                    select: { id: true, email: true, rol: true }
                }
            }
        }),
        prisma.solicitudPostulacion.count({ where })
    ]);

    return {
        solicitudes,
        paginacion: {
            pagina,
            limite,
            total,
            totalPaginas: Math.ceil(total / limite)
        }
    };
};

export const obtenerSolicitudPorId = async (id) => {
    const solicitud = await prisma.solicitudPostulacion.findUnique({
        where: { id },
        include: {
            usuario: {
                select: { id: true, email: true, rol: true }
            }
        }
    });

    if (!solicitud) {
        throw crearError(`No existe una solicitud con id ${id}`, 404);
    }

    return solicitud;
};

export const evaluarSolicitud = async (id, dto) => {
    const solicitud = await prisma.solicitudPostulacion.findUnique({ where: { id } });
    if (!solicitud) {
        throw crearError(`No existe una solicitud con id ${id}`, 404);
    }

    const { estado, observaciones } = dto;

    return prisma.solicitudPostulacion.update({
        where: { id },
        data: {
            estado,
            observaciones: observaciones ?? null
        },
        include: {
            usuario: {
                select: { id: true, email: true, rol: true }
            }
        }
    });
};

export const eliminarSolicitud = async (id) => {
    const solicitud = await prisma.solicitudPostulacion.findUnique({ where: { id } });
    if (!solicitud) {
        throw crearError(`No existe una solicitud con id ${id}`, 404);
    }

    return prisma.solicitudPostulacion.delete({ where: { id } });
};
