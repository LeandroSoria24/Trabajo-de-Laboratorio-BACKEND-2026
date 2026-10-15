import bcrypt from "bcrypt";
import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';

const FACTOR_COSTO = 10;

// POST - Registro público de usuario (adquiere rol ARTESANO por defecto)
export const registrarUsuario = async (registrarUsuarioDto) => {
    const { nombre, email, password } = registrarUsuarioDto;
    const usuarioExistente = await prisma.usuario.findUnique({
        where: { email: email }
    });
    if (usuarioExistente) {
        throw crearError("Ya existe usuario con ese email.", 409);
    }
    const passwordHash = await bcrypt.hash(password, FACTOR_COSTO);

    const nuevoUsuario = await prisma.usuario.create({
        data: {
            nombre,
            email,
            passwordHash,
            activo: true,
            roles: {
                create: {
                    rol: {
                        connectOrCreate: {
                            where: { nombre: "ARTESANO" },
                            create: { nombre: "ARTESANO" }
                        }
                    }
                }
            }
        },
        select: {
            id: true,
            nombre: true,
            email: true,
            activo: true,
            createdAt: true,
            roles: { select: { rol: { select: { nombre: true } } } }
        }
    });

    return {
        ...nuevoUsuario,
        roles: nuevoUsuario.roles.map((r) => r.rol.nombre)
    };
};

export const iniciarSesion = async (iniciarSesionDto) => {
    const { email, password } = iniciarSesionDto;
    const usuario = await prisma.usuario.findUnique({
        where: { email: email },
        include: {
            roles: { select: { rol: { select: { nombre: true } } } }
        }
    });

    if (!usuario) {
        throw crearError("Las credenciales son inválidas.", 401);
    }

    const passwordValida = await bcrypt.compare(
        password,
        usuario.passwordHash
    );

    if (!passwordValida || !usuario.activo) {
        const error = new Error("Las credenciales son inválidas.");
        error.status = 401;
        throw error;
    }

    return {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        activo: usuario.activo,
        roles: usuario.roles.map((a) => a.rol.nombre)
    };
};

export const obtenerUsuarioPorId = async (id) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id },
        select: {
            id: true,
            nombre: true,
            email: true,
            activo: true,
            roles: {
                select: { rol: { select: { nombre: true } } }
            },
            artesano: {
                select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    dni: true,
                    rubro: true,
                    nombreEmprendimiento: true,
                    activo: true,
                    stand: { select: { id: true, codigo: true, estado: true } }
                }
            }
        }
    });

    if (!usuario) return null;

    return {
        ...usuario,
        roles: usuario.roles.map((asignacion) => asignacion.rol.nombre)
    };
};

export const registrarAdministrador = async (dto) => {
    const { nombre, email, password } = dto;
    const usuarioExistente = await prisma.usuario.findUnique({
        where: { email: email }
    });
    if (usuarioExistente) {
        throw crearError("Ya existe usuario con ese email.", 409);
    }
    const passwordHash = await bcrypt.hash(password, FACTOR_COSTO);

    const nuevoAdmin = await prisma.usuario.create({
        data: {
            nombre,
            email,
            passwordHash,
            activo: true,
            roles: {
                create: {
                    rol: {
                        connectOrCreate: {
                            where: { nombre: "ADMINISTRADOR" },
                            create: { nombre: "ADMINISTRADOR" }
                        }
                    }
                }
            }
        },
        select: {
            id: true,
            nombre: true,
            email: true,
            activo: true,
            createdAt: true,
            roles: { select: { rol: { select: { nombre: true } } } }
        }
    });

    return {
        ...nuevoAdmin,
        roles: nuevoAdmin.roles.map((r) => r.rol.nombre)
    };
};