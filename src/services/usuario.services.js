import bcrypt from "bcrypt";
import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';


const FACTOR_COSTO = 10;

export const registrarUsuario = async (registrarUsuarioDto) => {
    const { nombre, email, password } = registrarUsuarioDto;
    const usuarioExistente = await prisma.usuario.findUnique({
        where: { email: email }
    });
    if (usuarioExistente) {
        throw crearError("Ya existe usuario con ese email.", 409);
    }
    const passwordHash = await bcrypt.hash(password, FACTOR_COSTO);

    // Guarda el usuario; el rol se asigna como 'VISITANTE' automáticamente por default
    return prisma.usuario.create({
        data: {
            nombre: nombre,
            email: email,
            passwordHash: passwordHash
        },
        select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            createdAt: true
        }
    });
};

export const iniciarSesion = async (iniciarSesionDto) => {
    const { email, password } = iniciarSesionDto;
    const usuario = await prisma.usuario.findUnique({
        where: { email: email }
    });

    if (!usuario) {
        throw crearError("Las credenciales son inválidas.", 401);
    }

    // Compara la contraseña con el hash almacenado.
    const passwordValida = await bcrypt.compare(
        password,
        usuario.passwordHash
    );

    if (!passwordValida) {
        throw crearError("Contraseña incorrecta.", 401);
    }

    // Respuesta del servicio.
    return {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
    };
};

export const obtenerUsuarioPorId = async (id) => { /*🟨 */
return prisma.usuario.findUnique({
where: { id: id },
select: {
            id: true,
            nombre: true,
            email: true
        }
    });
};

export const registrarUsuarioParticipante = async (dto) => {
    const { nombre, email, password, dni, direccion } = dto;
    const passwordHash = await bcrypt.hash(password, 10);
    return prisma.usuario.create({
        data: {
            nombre, email, passwordHash, activo: true,
            roles: { create: {rol: { connect: { nombre: "PARTICIPANTE" } } } },
            participante: { create: { nombre, email, dni, direccion } }
        },
        select: {
            id: true, nombre: true, email: true,
            activo: true,
            participante: { select: { id: true } }
        }
    });
} // Prisma guardará Usuario, Participante y UsuarioRol en una creación anidada. Si un email o DNI está repetido, se
  //  revierte toda la creación

// La relación anidada completa el campo “Participante.usuarioId”.
// El cliente no elige rol ni modifica el campo “activo”.
// La respuesta excluye passwordHash.