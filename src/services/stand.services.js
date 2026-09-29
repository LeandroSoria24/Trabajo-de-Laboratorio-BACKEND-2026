import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';
/* 🟥 */
export const crearStand = async (crearStandDto) => {
    const { codigo, numero, pabellon, sector, coordenadas, estado = "DISPONIBLE", artesanoId } = crearStandDto;

    const existeCodigo = await prisma.stand.findUnique({ where: { codigo } });
    if (existeCodigo) {
        throw crearError(`Ya existe un stand con el código ${codigo}`, 400);
    }

    if (artesanoId) {
        const artesano = await prisma.artesano.findUnique({ where: { id: artesanoId } });
        if (!artesano || !artesano.activo) {
            throw crearError(`El artesano con id ${artesanoId} no existe o no está activo`, 404);
        }
        const standOcupado = await prisma.stand.findUnique({ where: { artesanoId } });
        if (standOcupado) {
            throw crearError(`El artesano ya tiene asignado el stand ${standOcupado.codigo}`, 400);
        }
    }

    return prisma.stand.create({
        data: {
            codigo,
            numero: numero ?? null,
            pabellon,
            sector,
            coordenadas: coordenadas ?? null,
            estado: artesanoId ? "OCUPADO" : estado,
            artesanoId: artesanoId ?? null
        },
        include: {
            artesano: {
                include: {
                    localidad: true
                }
            }
        }
    });
};

export const actualizarStand = async (id, actualizarStandDto) => {
    const stand = await prisma.stand.findUnique({ where: { id } });
    if (!stand) {
        throw crearError(`No existe un stand con id ${id}`, 404);
    }

    const { codigo, numero, pabellon, sector, coordenadas, estado, artesanoId } = actualizarStandDto;

    if (codigo && codigo !== stand.codigo) {
        const existeCodigo = await prisma.stand.findUnique({ where: { codigo } });
        if (existeCodigo) {
            throw crearError(`Ya existe un stand con el código ${codigo}`, 400);
        }
    }

    if (artesanoId) {
        const artesano = await prisma.artesano.findUnique({ where: { id: artesanoId } });
        if (!artesano || !artesano.activo) {
            throw crearError(`El artesano con id ${artesanoId} no existe o no está activo`, 404);
        }
        const standOcupado = await prisma.stand.findUnique({ where: { artesanoId } });
        if (standOcupado && standOcupado.id !== id) {
            throw crearError(`El artesano ya tiene asignado el stand ${standOcupado.codigo}`, 400);
        }
    }

    const data = {};
    if (codigo !== undefined) data.codigo = codigo;
    if (numero !== undefined) data.numero = numero;
    if (pabellon !== undefined) data.pabellon = pabellon;
    if (sector !== undefined) data.sector = sector;
    if (coordenadas !== undefined) data.coordenadas = coordenadas;
    if (estado !== undefined) data.estado = estado;
    if (artesanoId !== undefined) {
        data.artesanoId = artesanoId;
        data.estado = artesanoId ? "OCUPADO" : "DISPONIBLE";
    }

    return prisma.stand.update({
        where: { id },
        data,
        include: {
            artesano: {
                include: {
                    localidad: true
                }
            }
        }
    });
};

export const obtenerStands = async (criterios = {}) => {
    const {
        pabellon,
        sector,
        estado,
        artesanoId,
        ordenarPor = 'codigo',
        direccion = 'asc',
        pagina = 1,
        limite = 20
    } = criterios;

    const where = {};

    if (pabellon) {
        where.pabellon = { contains: pabellon, mode: 'insensitive' };
    }
    if (sector) {
        where.sector = { contains: sector, mode: 'insensitive' };
    }
    if (estado) {
        where.estado = estado;
    }
    if (artesanoId !== undefined) {
        where.artesanoId = artesanoId;
    }

    const desplazamiento = (pagina - 1) * limite;

    const [stands, total] = await prisma.$transaction([
        prisma.stand.findMany({
            where,
            orderBy: [{ [ordenarPor]: direccion }, { id: 'asc' }],
            skip: desplazamiento,
            take: limite,
            include: {
                artesano: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        nombreEmprendimiento: true,
                        rubro: true,
                        localidad: true
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

export const obtenerStandPorId = async (id) => {
    const stand = await prisma.stand.findUnique({
        where: { id },
        include: {
            artesano: {
                include: {
                    localidad: true
                }
            }
        }
    });

    if (!stand) {
        throw crearError(`No existe un stand con id ${id}`, 404);
    }

    return stand;
};

export const asignarStand = async (standId, artesanoId) => {
    return prisma.$transaction(async (tx) => {
        const stand = await tx.stand.findUnique({ where: { id: standId } });
        if (!stand) {
            throw crearError(`No existe un stand con id ${standId}`, 404);
        }
        if (stand.estado === "OCUPADO" && stand.artesanoId && stand.artesanoId !== artesanoId) {
            throw crearError(`El stand ${stand.codigo} ya está ocupado por otro artesano`, 400);
        }

        const artesano = await tx.artesano.findUnique({ where: { id: artesanoId } });
        if (!artesano || !artesano.activo) {
            throw crearError(`El artesano con id ${artesanoId} no existe o no está activo`, 404);
        }

        const standPrevio = await tx.stand.findUnique({ where: { artesanoId } });
        if (standPrevio && standPrevio.id !== standId) {
            throw crearError(`El artesano ya posee asignado el stand ${standPrevio.codigo}`, 400);
        }

        return tx.stand.update({
            where: { id: standId },
            data: {
                artesanoId,
                estado: "OCUPADO"
            },
            include: {
                artesano: {
                    include: {
                        localidad: true
                    }
                }
            }
        });
    });
};

export const desasignarStand = async (standId) => {
    const stand = await prisma.stand.findUnique({ where: { id: standId } });
    if (!stand) {
        throw crearError(`No existe un stand con id ${standId}`, 404);
    }

    return prisma.stand.update({
        where: { id: standId },
        data: {
            artesanoId: null,
            estado: "DISPONIBLE"
        }
    });
};

export const eliminarStand = async (id) => {
    const stand = await prisma.stand.findUnique({ where: { id } });
    if (!stand) {
        throw crearError(`No existe un stand con id ${id}`, 404);
    }

    return prisma.stand.delete({ where: { id } });
};
