import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';

/*
  Servicio para completar el perfil propio de artesano (POST /artesanos/me)
 */
export const completarMiPerfilArtesano = async (usuarioId, emailUsuario, dto) => {
    const usuarioConArtesano = await prisma.artesano.findUnique({ where: { usuarioId } });
    if (usuarioConArtesano) {
        throw crearError("El usuario ya tiene un perfil de artesano registrado.", 409);
    }
    const existeDni = await prisma.artesano.findUnique({ where: { dni: dto.dni } });
    if (existeDni) {
        throw crearError(`Ya existe un artesano registrado con el DNI ${dto.dni}`, 409);
    }
    const localidad = await prisma.localidad.findUnique({ where: { id: dto.localidadId } });
    if (!localidad) {
        throw crearError(`No existe una localidad con id ${dto.localidadId}`, 404);
    }

    return prisma.artesano.create({
        data: {
            ...dto,
            email: emailUsuario,
            usuarioId,
            activo: false // Arranca inactivo hasta ser aprobado por administración
        },
        include: {
            localidad: true
        }
    });
};

/*
  Servicio para consultar el perfil propio de artesano (GET /artesanos/me)
 */
export const obtenerMiPerfilArtesano = async (usuarioId) => {
    const artesano = await prisma.artesano.findUnique({
        where: { usuarioId },
        include: { localidad: true, productos: true, stand: true, solicitudes: true }
    });
    if (!artesano) {
        throw crearError("No tiene un perfil de artesano registrado aún.", 404);
    }
    return artesano;
};

/*
  Servicio para actualizar el perfil propio de artesano (PUT /artesanos/me)
 */
export const actualizarMiPerfilArtesano = async (usuarioId, dto) => {
    const artesano = await prisma.artesano.findUnique({ where: { usuarioId } });
    if (!artesano) {
        throw crearError("No tiene un perfil de artesano registrado para actualizar.", 404);
    }
    if (dto.dni && dto.dni !== artesano.dni) {
        const existeDni = await prisma.artesano.findUnique({ where: { dni: dto.dni } });
        if (existeDni) throw crearError(`Ya existe un artesano registrado con el DNI ${dto.dni}`, 409);
    }
    if (dto.localidadId !== undefined) {
        const localidad = await prisma.localidad.findUnique({ where: { id: dto.localidadId } });
        if (!localidad) throw crearError(`No existe una localidad con id ${dto.localidadId}`, 404);
    }

    return prisma.artesano.update({
        where: { id: artesano.id },
        data: dto,
        include: { localidad: true, productos: true, stand: true }
    });
};

/*
  Servicio para que el administrador active o desactive un artesano (PATCH /artesanos/:id/activo)
 */
export const cambiarActivoArtesano = async (id, activo) => {
    const artesano = await prisma.artesano.findUnique({ where: { id } });
    if (!artesano) {
        throw crearError(`No existe un artesano con id ${id}`, 404);
    }
    return prisma.artesano.update({
        where: { id },
        data: { activo },
        include: { localidad: true, stand: true }
    });
};

/*
  Servicio para la creación administrativa de un artesano.
 */
export const crearArtesano = async (crearArtesanoDto) => {
    const { nombre, apellido, dni, email, telefono, localidadId, rubro, nombreEmprendimiento, descripcionTrayectoria, usuarioId, activo = false } = crearArtesanoDto;

    const localidad = await prisma.localidad.findUnique({ where: { id: localidadId } });
    if (!localidad) {
        throw crearError(`No existe una localidad con id ${localidadId}`, 404);
    }

    const existeDni = await prisma.artesano.findUnique({ where: { dni } });
    if (existeDni) {
        throw crearError(`Ya existe un artesano registrado con el DNI ${dni}`, 409);
    }

    const existeEmail = await prisma.artesano.findUnique({ where: { email } });
    if (existeEmail) {
        throw crearError(`Ya existe un artesano registrado con el email ${email}`, 409);
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) {
        throw crearError(`No existe un usuario con id ${usuarioId}`, 404);
    }

    const usuarioConArtesano = await prisma.artesano.findUnique({ where: { usuarioId } });
    if (usuarioConArtesano) {
        throw crearError(`El usuario ya tiene un perfil de artesano asociado`, 409);
    }

    return prisma.artesano.create({
        data: {
            nombre,
            apellido,
            dni,
            email,
            telefono: telefono ?? null,
            localidadId,
            rubro,
            nombreEmprendimiento,
            descripcionTrayectoria: descripcionTrayectoria ?? null,
            usuarioId,
            activo
        },
        include: {
            localidad: true,
            productos: true
        }
    });
};

/*
  Servicio para la actualización administrativa de un artesano.
 */
export const actualizarArtesano = async (id, actualizarArtesanoDto) => {
    const artesano = await prisma.artesano.findUnique({
        where: { id }
    });
    if (!artesano) {
        throw crearError(`No existe un artesano con id ${id}`, 404);
    }

    const { nombre, apellido, dni, email, telefono, localidadId, rubro, nombreEmprendimiento, descripcionTrayectoria, usuarioId, activo } = actualizarArtesanoDto;

    if (localidadId !== undefined) {
        const localidad = await prisma.localidad.findUnique({ where: { id: localidadId } });
        if (!localidad) {
            throw crearError(`No existe una localidad con id ${localidadId}`, 404);
        }
    }

    if (dni && dni !== artesano.dni) {
        const existeDni = await prisma.artesano.findUnique({ where: { dni } });
        if (existeDni) {
            throw crearError(`Ya existe un artesano registrado con el DNI ${dni}`, 409);
        }
    }

    if (email && email !== artesano.email) {
        const existeEmail = await prisma.artesano.findUnique({ where: { email } });
        if (existeEmail) {
            throw crearError(`Ya existe un artesano registrado con el email ${email}`, 409);
        }
    }

    return prisma.artesano.update({
        where: { id },
        data: {
            nombre,
            apellido,
            dni,
            email,
            telefono,
            localidadId,
            rubro,
            nombreEmprendimiento,
            descripcionTrayectoria,
            usuarioId,
            activo
        },
        include: {
            localidad: true,
            productos: true
        }
    });
};

/*
  Servicio para obtener la lista de artesanos (Público).
 */
export const obtenerArtesanos = async (criterios = {}) => {
    const {
        id,
        nombre,
        apellido,
        dni,
        email,
        telefono,
        localidadId,
        rubro,
        nombreEmprendimiento,
        activo = true,

        ordenarPor = 'nombre',
        direccion = 'asc',
        pagina = 1,
        limite = 10
    } = criterios;

    const where = { activo };

    if (id !== undefined) where.id = id;
    if (nombre !== undefined) where.nombre = { contains: nombre, mode: 'insensitive' };
    if (apellido !== undefined) where.apellido = { contains: apellido, mode: 'insensitive' };
    if (dni !== undefined) where.dni = { contains: dni, mode: 'insensitive' };
    if (email !== undefined) where.email = { contains: email, mode: 'insensitive' };
    if (telefono !== undefined) where.telefono = { contains: telefono, mode: 'insensitive' };
    if (localidadId !== undefined) where.localidadId = localidadId;
    if (rubro !== undefined) where.rubro = { contains: rubro, mode: 'insensitive' };
    if (nombreEmprendimiento !== undefined) where.nombreEmprendimiento = { contains: nombreEmprendimiento, mode: 'insensitive' };

    const desplazamiento = (pagina - 1) * limite;

    const [artesanos, total] = await prisma.$transaction([
        prisma.artesano.findMany({
            where,
            orderBy: [{ [ordenarPor]: direccion }, { id: 'asc' }],
            skip: desplazamiento,
            take: limite,
            include: { localidad: true, productos: true, stand: true }
        }),
        prisma.artesano.count({ where })
    ]);

    return {
        artesanos,
        paginacion: {
            pagina,
            limite,
            total,
            totalPaginas: Math.ceil(total / limite)
        }
    };
};

/*
  Servicio para obtener un artesano por su ID (Público).
 */
export const obtenerArtesanoPorId = async (id) => {
    const artesano = await prisma.artesano.findUnique({
        where: { id },
        include: { localidad: true, productos: true, stand: true }
    });

    if (!artesano) {
        throw crearError(`No existe un artesano con id ${id}`, 404);
    }

    return artesano;
};

/*
  Servicio para eliminar (soft delete) un artesano por su ID (Solo ADMINISTRADOR).
 */
export const eliminarArtesano = async (id) => {
    const artesano = await prisma.artesano.findUnique({
        where: { id }
    });

    if (!artesano) {
        throw crearError(`No existe un artesano con id ${id}`, 404);
    }

    if (!artesano.activo) {
        throw crearError(`El artesano con id ${id} ya se encuentra inactivo`, 400);
    }

    return prisma.artesano.update({
        where: { id },
        data: { activo: false }
    });
};
