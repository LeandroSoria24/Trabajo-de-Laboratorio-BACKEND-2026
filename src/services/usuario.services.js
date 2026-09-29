import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';
/* 🟥 */
export const crearUsuario = async (dto) => {
    const { email, password, rol = "VISITANTE", activo = true } = dto;

    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
        throw crearError(`Ya existe un usuario registrado con el email '${email}'`, 400);
    }

    return prisma.usuario.create({
        data: {
            email,
            password_hash: password, // En la fase de autenticación se aplicará hashing con bcrypt
            rol,
            activo
        },
        select: {
            id: true,
            email: true,
            rol: true,
            activo: true,
            createdAt: true,
            updatedAt: true
        }
    });
};

export const obtenerUsuarios = async (criterios = {}) => {
    const {
        email,
        rol,
        activo,
        ordenarPor = 'createdAt',
        direccion = 'desc',
        pagina = 1,
        limite = 10
    } = criterios;

    const where = {};

    if (email) {
        where.email = { contains: email, mode: 'insensitive' };
    }
    if (rol) {
        where.rol = rol;
    }
    if (activo !== undefined) {
        where.activo = activo;
    }

    const desplazamiento = (pagina - 1) * limite;

    const [usuarios, total] = await prisma.$transaction([
        prisma.usuario.findMany({
            where,
            orderBy: [{ [ordenarPor]: direccion }, { id: 'desc' }],
            skip: desplazamiento,
            take: limite,
            select: {
                id: true,
                email: true,
                rol: true,
                activo: true,
                createdAt: true,
                updatedAt: true,
                artesano: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        nombreEmprendimiento: true
                    }
                }
            }
        }),
        prisma.usuario.count({ where })
    ]);

    return {
        usuarios,
        paginacion: {
            pagina,
            limite,
            total,
            totalPaginas: Math.ceil(total / limite)
        }
    };
};

export const obtenerUsuarioPorId = async (id) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            rol: true,
            activo: true,
            createdAt: true,
            updatedAt: true,
            artesano: true,
            solicitudes: true
        }
    });

    if (!usuario) {
        throw crearError(`No existe un usuario con id ${id}`, 404);
    }

    return usuario;
};

export const actualizarUsuario = async (id, dto) => {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
        throw crearError(`No existe un usuario con id ${id}`, 404);
    }

    const { email, password, rol, activo } = dto;

    if (email && email !== usuario.email) {
        const existe = await prisma.usuario.findUnique({ where: { email } });
        if (existe) {
            throw crearError(`Ya existe un usuario con el email '${email}'`, 400);
        }
    }

    const data = {};
    if (email !== undefined) data.email = email;
    if (password !== undefined) data.password_hash = password;
    if (rol !== undefined) data.rol = rol;
    if (activo !== undefined) data.activo = activo;

    return prisma.usuario.update({
        where: { id },
        data,
        select: {
            id: true,
            email: true,
            rol: true,
            activo: true,
            createdAt: true,
            updatedAt: true
        }
    });
};

export const eliminarUsuario = async (id) => {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
        throw crearError(`No existe un usuario con id ${id}`, 404);
    }

    // Soft delete por defecto para preservar auditorías y referencias
    return prisma.usuario.update({
        where: { id },
        data: { activo: false },
        select: {
            id: true,
            email: true,
            rol: true,
            activo: true
        }
    });
};
