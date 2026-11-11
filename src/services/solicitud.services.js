import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';

/*
  Crea una solicitud de postulación para el artesano del usuario logueado.
 */
export const crearMiSolicitud = async (usuarioId, dto = {}) => {
    const artesano = await prisma.artesano.findUnique({
        where: { usuarioId },
        include: { stand: true }
    });

    if (!artesano) {
        throw crearError("Debe completar su perfil de artesano antes de postularse a la feria.", 404);
    }

    if (artesano.stand) {
        throw crearError(`Ya tiene asignado el stand '${artesano.stand.codigo}' en la feria.`, 409);
    }

    // Regla: no permitir más de una solicitud PENDIENTE o APROBADA activa
    const solicitudActiva = await prisma.solicitudPostulacion.findFirst({
        where: {
            artesanoId: artesano.id,
            estado: { in: ['PENDIENTE', 'EN_REVISION', 'APROBADA'] }
        }
    });

    if (solicitudActiva) {
        throw crearError(`Ya posee una solicitud de postulación en estado ${solicitudActiva.estado}.`, 409);
    }

    return prisma.solicitudPostulacion.create({
        data: {
            artesanoId: artesano.id,
            observaciones: dto.observaciones ?? null,
            estado: 'PENDIENTE'
        },
        include: {
            artesano: {
                select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    nombreEmprendimiento: true,
                    rubro: true
                }
            }
        }
    });
};

/*
  Lista las solicitudes de postulación del artesano autenticado.
 */
export const listarMisSolicitudes = async (usuarioId) => {
    const artesano = await prisma.artesano.findUnique({
        where: { usuarioId }
    });

    if (!artesano) {
        return [];
    }

    return prisma.solicitudPostulacion.findMany({
        where: { artesanoId: artesano.id },
        orderBy: { fechaPresentacion: 'desc' },
        include: {
            stand: { select: { id: true, codigo: true, estado: true } }
        }
    });
};

/*
  Cancela la solicitud propia si aún no ha sido dictaminada.
 */
export const cancelarMiSolicitud = async (usuarioId, solicitudId) => {
    const solicitud = await prisma.solicitudPostulacion.findUnique({
        where: { id: solicitudId },
        include: { artesano: true }
    });

    if (!solicitud || solicitud.artesano.usuarioId !== usuarioId) {
        throw crearError("Solicitud no encontrada.", 404);
    }

    if (solicitud.estado === 'CANCELADA') {
        throw crearError("La solicitud ya se encuentra cancelada.", 409);
    }

    if (solicitud.estado !== 'PENDIENTE') {
        throw crearError(`No se puede cancelar una solicitud en estado ${solicitud.estado}.`, 409);
    }

    return prisma.solicitudPostulacion.update({
        where: { id: solicitudId },
        data: { estado: 'CANCELADA' }
    });
};

/*
  Lista global de solicitudes para el panel de administración.
 */
export const listarTodasSolicitudes = async (filtros = {}) => {
    const { estado, artesanoId, pagina = 1, limite = 10 } = filtros;
    const where = {};

    if (estado) where.estado = estado;
    if (artesanoId) where.artesanoId = artesanoId;

    const desplazamiento = (pagina - 1) * limite;

    const [solicitudes, total] = await prisma.$transaction(async (tx) => [
        await tx.solicitudPostulacion.findMany({
            where,
            orderBy: { fechaPresentacion: 'desc' },
            skip: desplazamiento,
            take: limite,
            include: {
                artesano: {
                    include: {
                        localidad: true
                    }
                },
                stand: true,
                evaluador: { select: { id: true, nombre: true, email: true } }
            }
        }),
        await tx.solicitudPostulacion.count({ where })
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

/*
  Evalúa una solicitud (APROBADA / RECHAZADA) y activa al artesano si es aprobada.
 */
export const evaluarSolicitud = async (solicitudId, evaluadorId, dto) => {
    return prisma.$transaction(async (tx) => {
        const solicitud = await tx.solicitudPostulacion.findUnique({
            where: { id: solicitudId }
        });

        if (!solicitud) {
            throw crearError(`No existe una solicitud con id ${solicitudId}`, 404);
        }

        if (!['PENDIENTE', 'EN_REVISION'].includes(solicitud.estado)) {
            throw crearError(`No se puede evaluar una solicitud que ya se encuentra en estado ${solicitud.estado}.`, 409);
        }

        const solicitudActualizada = await tx.solicitudPostulacion.update({
            where: { id: solicitudId },
            data: {
                estado: dto.estado,
                observaciones: dto.observaciones ?? solicitud.observaciones,
                evaluadorId
            }
        });

        // Si se aprueba, se activa el perfil de artesano automáticamente
        if (dto.estado === 'APROBADA') {
            await tx.artesano.update({
                where: { id: solicitud.artesanoId },
                data: { activo: true }
            });
        }

        return solicitudActualizada;
    });
};

/*
  Asigna un stand disponible a una postulación aprobada.
 */
export const asignarStandASolicitud = async (solicitudId, standIdDeseado) => {
    return prisma.$transaction(async (tx) => {
        const solicitud = await tx.solicitudPostulacion.findUnique({
            where: { id: solicitudId },
            include: { artesano: true }
        });

        if (!solicitud) {
            throw crearError(`No existe la solicitud con id ${solicitudId}`, 404);
        }

        if (solicitud.estado !== 'APROBADA') {
            throw crearError("La solicitud debe estar en estado APROBADA para asignarle un stand.", 409);
        }

        if (!solicitud.artesano.activo) {
            throw crearError("El artesano se encuentra inactivo y no puede recibir un stand.", 409);
        }

        // Regla 1 a 1: impedir asignar un nuevo stand si el artesano ya ocupa uno
        const standPrevio = await tx.stand.findUnique({
            where: { artesanoId: solicitud.artesanoId }
        });
        if (standPrevio) {
            throw crearError(`El artesano ya tiene asignado el stand '${standPrevio.codigo}'. Debe liberarlo antes de asignarle otro.`, 409);
        }

        // Buscar stand
        let stand;
        if (standIdDeseado) {
            stand = await tx.stand.findUnique({ where: { id: standIdDeseado } });
            if (!stand) throw crearError(`No existe el stand con id ${standIdDeseado}`, 404);
            if (stand.estado !== 'DISPONIBLE' || stand.artesanoId !== null) {
                throw crearError(`El stand ${stand.codigo} no se encuentra disponible.`, 409);
            }
        } else {
            // Selecciona un stand disponible automáticamente
            stand = await tx.stand.findFirst({
                where: { estado: 'DISPONIBLE', artesanoId: null }
            });
            if (!stand) {
                throw crearError("No hay stands disponibles para asignar en este momento.", 409);
            }
        }

        // Ocupar el nuevo stand de forma atómica (previene condiciones de carrera en peticiones concurrentes)
        const reserva = await tx.stand.updateMany({
            where: {
                id: stand.id,
                estado: 'DISPONIBLE',
                artesanoId: null
            },
            data: {
                estado: 'OCUPADO',
                artesanoId: solicitud.artesanoId
            }
        });

        if (reserva.count === 0) {
            throw crearError(`El stand ${stand.codigo} no se encuentra disponible.`, 409);
        }

        // Asociar el stand a la solicitud
        const solicitudConStand = await tx.solicitudPostulacion.update({
            where: { id: solicitudId },
            data: { standId: stand.id },
            include: { stand: true, artesano: true }
        });

        return {
            mensaje: `Stand ${stand.codigo} asignado exitosamente al artesano ${solicitud.artesano.nombre} ${solicitud.artesano.apellido}.`,
            solicitud: solicitudConStand
        };
    });
};
