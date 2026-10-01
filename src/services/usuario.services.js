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

    // Guarda el hash, nunca la contraseña original.
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
        email: usuario.email
    };
};