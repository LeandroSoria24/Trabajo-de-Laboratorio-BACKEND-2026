import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';
/* 🟥 */
export const crearRegistroConsulta = async (dto) => {
    const { visitanteId, termino_busqueda } = dto;

    if (visitanteId) {
        const usuario = await prisma.usuario.findUnique({ where: { id: visitanteId } });
        if (!usuario) {
            throw crearError(`No existe un usuario con id ${visitanteId}`, 404);
        }
    }

    return prisma.registroConsulta.create({
        data: {
            visitanteId: visitanteId ?? null,
            termino_busqueda
        },
        include: {
            usuario: {
                select: { id: true, email: true, rol: true }
            }
        }
    });
};

export const obtenerRegistroConsultas = async (criterios = {}) => {
    const {
        termino_busqueda,
        visitanteId,
        ordenarPor = 'fecha',
        direccion = 'desc',
        pagina = 1,
        limite = 20
    } = criterios;

    const where = {};

    if (termino_busqueda) {
        where.termino_busqueda = { contains: termino_busqueda, mode: 'insensitive' };
    }
    if (visitanteId !== undefined) {
        where.visitanteId = visitanteId;
    }

    const desplazamiento = (pagina - 1) * limite;

    const [consultas, total] = await prisma.$transaction([
        prisma.registroConsulta.findMany({
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
        prisma.registroConsulta.count({ where })
    ]);

    return {
        consultas,
        paginacion: {
            pagina,
            limite,
            total,
            totalPaginas: Math.ceil(total / limite)
        }
    };
};

export const obtenerRegistroConsultaPorId = async (id) => {
    const consulta = await prisma.registroConsulta.findUnique({
        where: { id },
        include: {
            usuario: {
                select: { id: true, email: true, rol: true }
            }
        }
    });

    if (!consulta) {
        throw crearError(`No existe un registro de consulta con id ${id}`, 404);
    }

    return consulta;
};

export const eliminarRegistroConsulta = async (id) => {
    const consulta = await prisma.registroConsulta.findUnique({ where: { id } });
    if (!consulta) {
        throw crearError(`No existe un registro de consulta con id ${id}`, 404);
    }

    return prisma.registroConsulta.delete({ where: { id } });
};
