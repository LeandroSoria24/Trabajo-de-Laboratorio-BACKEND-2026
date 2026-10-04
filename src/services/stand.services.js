import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';

/*
  Servicio para la creación de un nuevo Stand en el predio ferial.
  Valida la unicidad del código, la existencia de Pabellón y Sector,
  y la disponibilidad del artesano si se suministra (relación 1:1).
*/
export const crearStand = async (crearStandDto) => {
    const { codigo, numero, pabellonId, sectorId, estado = 'DISPONIBLE', artesanoId } = crearStandDto;

    // Regla de negocio: unicidad del código de stand
    const standExistente = await prisma.stand.findUnique({
        where: { codigo }
    });
    if (standExistente) {
        throw crearError(`Ya existe un stand registrado con el código '${codigo}'`, 400);
    }

    // Regla de negocio: verificar existencia de Pabellón
    const pabellon = await prisma.pabellon.findUnique({
        where: { id: pabellonId }
    });
    if (!pabellon) {
        throw crearError(`No existe un pabellón con id ${pabellonId}`, 404);
    }

    // Regla de negocio: verificar existencia de Sector
    const sector = await prisma.sector.findUnique({
        where: { id: sectorId }
    });
    if (!sector) {
        throw crearError(`No existe un sector con id ${sectorId}`, 404);
    }

    // Regla de negocio: si se asocia un artesano de inmediato
    if (artesanoId) {
        const artesano = await prisma.artesano.findUnique({
            where: { id: artesanoId }
        });
        if (!artesano) {
            throw crearError(`No existe un artesano con id ${artesanoId}`, 404);
        }
        if (!artesano.activo) {
            throw crearError(`El artesano con id ${artesanoId} se encuentra inactivo y no puede ocupar un stand`, 400);
        }

        // Relación 1 a 1: verificar que el artesano no tenga ya otro stand
        const standDelArtesano = await prisma.stand.findUnique({
            where: { artesanoId }
        });
        if (standDelArtesano) {
            throw crearError(`El artesano con id ${artesanoId} ya tiene asignado el stand '${standDelArtesano.codigo}'`, 400);
        }
    }

    // Si se asignó un artesano y el estado venía como DISPONIBLE, marcar como OCUPADO
    const estadoFinal = artesanoId && estado === 'DISPONIBLE' ? 'OCUPADO' : estado;

    return prisma.stand.create({
        data: {
            codigo,
            numero: numero ?? null,
            pabellonId,
            sectorId,
            estado: estadoFinal,
            artesanoId: artesanoId ?? null
        },
        include: {
            pabellon: true,
            sector: true,
            artesano: true
        }
    });
};

/*
  Servicio para actualizar datos de un Stand existente.
*/
export const actualizarStand = async (id, actualizarStandDto) => {
    const stand = await prisma.stand.findUnique({
        where: { id }
    });
    if (!stand) {
        throw crearError(`No existe un stand con id ${id}`, 404);
    }

    const { codigo, numero, pabellonId, sectorId, estado, artesanoId } = actualizarStandDto;

    // Si se modifica el código, comprobar que no colisione con otro stand
    if (codigo && codigo !== stand.codigo) {
        const existeCodigo = await prisma.stand.findUnique({
            where: { codigo }
        });
        if (existeCodigo) {
            throw crearError(`Ya existe otro stand con el código '${codigo}'`, 400);
        }
    }

    // Si se modifica el pabellón, verificar su existencia
    if (pabellonId !== undefined) {
        const pabellon = await prisma.pabellon.findUnique({
            where: { id: pabellonId }
        });
        if (!pabellon) {
            throw crearError(`No existe un pabellón con id ${pabellonId}`, 404);
        }
    }

    // Si se modifica el sector, verificar su existencia
    if (sectorId !== undefined) {
        const sector = await prisma.sector.findUnique({
            where: { id: sectorId }
        });
        if (!sector) {
            throw crearError(`No existe un sector con id ${sectorId}`, 404);
        }
    }

    // Si se modifica el artesano asociado
    if (artesanoId !== undefined) {
        if (artesanoId !== null && artesanoId !== stand.artesanoId) {
            const artesano = await prisma.artesano.findUnique({
                where: { id: artesanoId }
            });
            if (!artesano) {
                throw crearError(`No existe un artesano con id ${artesanoId}`, 404);
            }
            if (!artesano.activo) {
                throw crearError(`El artesano con id ${artesanoId} se encuentra inactivo`, 400);
            }

            // Comprobar que el artesano no tenga asignado otro stand (1:1)
            const standDelArtesano = await prisma.stand.findUnique({
                where: { artesanoId }
            });
            if (standDelArtesano && standDelArtesano.id !== id) {
                throw crearError(`El artesano con id ${artesanoId} ya tiene asignado el stand '${standDelArtesano.codigo}'`, 400);
            }
        }
    }

    // Determinar coherencia de estado si se asigna o desvincula artesano
    let estadoActualizado = estado;
    if (artesanoId === null && !estado && stand.estado === 'OCUPADO') {
        estadoActualizado = 'DISPONIBLE';
    } else if (artesanoId && !estado && stand.estado === 'DISPONIBLE') {
        estadoActualizado = 'OCUPADO';
    }

    return prisma.stand.update({
        where: { id },
        data: {
            codigo,
            numero,
            pabellonId,
            sectorId,
            estado: estadoActualizado,
            artesanoId
        },
        include: {
            pabellon: true,
            sector: true,
            artesano: true
        }
    });
};

/*
  Servicio para listar y filtrar stands con paginación y ordenamiento.
*/
export const obtenerStands = async (criterios = {}) => {
    const {
        pabellonId,
        sectorId,
        estado,
        artesanoId,
        codigo,
        ordenarPor = 'codigo',
        direccion = 'asc',
        pagina = 1,
        limite = 10
    } = criterios;

    const where = {};

    if (pabellonId !== undefined) {
        where.pabellonId = pabellonId;
    }

    if (sectorId !== undefined) {
        where.sectorId = sectorId;
    }

    if (estado !== undefined) {
        where.estado = estado;
    }

    if (artesanoId !== undefined) {
        where.artesanoId = artesanoId;
    }

    if (codigo !== undefined) {
        where.codigo = { contains: codigo, mode: 'insensitive' };
    }

    const desplazamiento = (pagina - 1) * limite;

    const [stands, total] = await prisma.$transaction([
        prisma.stand.findMany({
            where,
            orderBy: [{ [ordenarPor]: direccion }, { id: 'asc' }],
            skip: desplazamiento,
            take: limite,
            include: {
                pabellon: true,
                sector: true,
                artesano: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        rubro: true,
                        nombreEmprendimiento: true,
                        activo: true
                    }
                }
            }
        }),
        prisma.stand.count({ where })
    ]);

    return {
        stands,
        paginacion: {
            pagina,
            limite,
            total,
            totalPaginas: Math.ceil(total / limite)
        }
    };
};

/*
  Servicio para obtener el detalle de un stand por su ID.
*/
export const obtenerStandPorId = async (id) => {
    const stand = await prisma.stand.findUnique({
        where: { id },
        include: {
            pabellon: true,
            sector: true,
            artesano: true,
            solicitudes: {
                include: {
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

    if (!stand) {
        throw crearError(`No existe un stand con id ${id}`, 404);
    }

    return stand;
};

/*
  Servicio de negocio especializado: Asignar un artesano a un stand disponible.
*/
export const asignarArtesanoAStand = async (standId, artesanoId) => {
    const stand = await prisma.stand.findUnique({
        where: { id: standId }
    });
    if (!stand) {
        throw crearError(`No existe un stand con id ${standId}`, 404);
    }

    if (stand.estado === 'MANTENIMIENTO') {
        throw crearError(`El stand '${stand.codigo}' se encuentra en mantenimiento y no puede ser ocupado`, 400);
    }

    if (stand.artesanoId !== null) {
        throw crearError(`El stand '${stand.codigo}' ya se encuentra asignado a otro artesano`, 400);
    }

    const artesano = await prisma.artesano.findUnique({
        where: { id: artesanoId }
    });
    if (!artesano) {
        throw crearError(`No existe un artesano con id ${artesanoId}`, 404);
    }
    if (!artesano.activo) {
        throw crearError(`El artesano con id ${artesanoId} está inactivo y no puede ocupar un stand`, 400);
    }

    // Regla 1 a 1: verificar que el artesano no tenga asignado otro puesto
    const standPrevio = await prisma.stand.findUnique({
        where: { artesanoId }
    });
    if (standPrevio) {
        throw crearError(`El artesano con id ${artesanoId} ya tiene asignado el stand '${standPrevio.codigo}'`, 400);
    }

    return prisma.stand.update({
        where: { id: standId },
        data: {
            artesanoId,
            estado: 'OCUPADO'
        },
        include: {
            pabellon: true,
            sector: true,
            artesano: true
        }
    });
};

/*
  Servicio de negocio especializado: Liberar un stand ocupado.
*/
export const liberarStand = async (standId) => {
    const stand = await prisma.stand.findUnique({
        where: { id: standId }
    });
    if (!stand) {
        throw crearError(`No existe un stand con id ${standId}`, 404);
    }

    if (stand.artesanoId === null && stand.estado === 'DISPONIBLE') {
        throw crearError(`El stand '${stand.codigo}' ya se encuentra disponible y sin artesano asignado`, 400);
    }

    return prisma.stand.update({
        where: { id: standId },
        data: {
            artesanoId: null,
            estado: 'DISPONIBLE'
        },
        include: {
            pabellon: true,
            sector: true
        }
    });
};

/*
  Servicio para eliminar físicamente un stand del predio.
*/
export const eliminarStand = async (id) => {
    const stand = await prisma.stand.findUnique({
        where: { id },
        include: {
            _count: {
                select: { solicitudes: true }
            }
        }
    });

    if (!stand) {
        throw crearError(`No existe un stand con id ${id}`, 404);
    }

    if (stand.artesanoId !== null) {
        throw crearError(`No se puede eliminar el stand '${stand.codigo}' porque se encuentra asignado a un artesano. Libérelo previamente`, 400);
    }

    if (stand._count.solicitudes > 0) {
        throw crearError(`No se puede eliminar el stand '${stand.codigo}' porque tiene solicitudes de postulación asociadas`, 400);
    }

    return prisma.stand.delete({
        where: { id }
    });
};
