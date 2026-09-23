import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';

/*
  Servicio para la creación de un artesano.
  Recibe el DTO (los datos validados por Zod desde req.body),
  comprueba las reglas de negocio (unicidad de DNI y email) y persiste con Prisma. 🟩
 */
export const crearArtesano = async (crearArtesanoDto) => {
    const { nombre, apellido, dni, email, telefono, localidad, rubro, nombreEmprendimiento, descripcionTrayectoria } = crearArtesanoDto;

    // Regla de negocio: comprobar que no exista otro artesano con el mismo DNI
    const existeDni = await prisma.artesano.findUnique({ where: { dni } });
    if (existeDni) {
        throw crearError(`Ya existe un artesano registrado con el DNI ${dni}`, 400);
    }

    // Regla de negocio: comprobar que no exista otro artesano con el mismo email
    const existeEmail = await prisma.artesano.findUnique({ where: { email } });
    if (existeEmail) {
        throw crearError(`Ya existe un artesano registrado con el email ${email}`, 400);
    }

    return prisma.artesano.create({
        data: {
            nombre,
            apellido,
            dni,
            email,
            telefono: telefono ?? null,
            localidad,
            rubro,
            nombreEmprendimiento,
            descripcionTrayectoria: descripcionTrayectoria ?? null
        },
        include: {
            productos: true
        }
    });
};

/*
  Servicio para la actualización de un artesano.
  Recibe el id y el DTO con los datos a actualizar.
  Comprueba que el artesano exista y la unicidad de DNI/email si se envían. 🟩
 */
export const actualizarArtesano = async (id, actualizarArtesanoDto) => {
    const artesano = await prisma.artesano.findUnique({
        where: { id }
    });
    if (!artesano) {
        throw crearError(`No existe un artesano con id ${id}`, 404);
    }

    const { nombre, apellido, dni, email, telefono, localidad, rubro, nombreEmprendimiento, descripcionTrayectoria } = actualizarArtesanoDto;

    // Si se envía un DNI distinto al actual, verificar que no esté en uso
    if (dni && dni !== artesano.dni) {
        const existeDni = await prisma.artesano.findUnique({ where: { dni } });
        if (existeDni) {
            throw crearError(`Ya existe un artesano registrado con el DNI ${dni}`, 400);
        }
    }

    // Si se envía un email distinto al actual, verificar que no esté en uso
    if (email && email !== artesano.email) {
        const existeEmail = await prisma.artesano.findUnique({ where: { email } });
        if (existeEmail) {
            throw crearError(`Ya existe un artesano registrado con el email ${email}`, 400);
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
            localidad,
            rubro,
            nombreEmprendimiento,
            descripcionTrayectoria
        },
        include: {
            productos: true
        }
    });
};

/*
  Servicio para obtener la lista de artesanos.
  Recibe el DTO con los parámetros de consulta (paginación y filtros). 🟩
 */
export const obtenerArtesanos = async (criterios = {}) => {
    const {
        id,
        nombre,
        apellido,
        dni,
        email,
        telefono,
        localidad,
        rubro,
        nombreEmprendimiento,

        ordenarPor = 'nombre',
        direccion = 'asc',
        pagina = 1,
        limite = 10

    } = criterios;

    const where = {};

    if (id !== undefined) {
        where.id = id;
    }

    if (nombre !== undefined) {
        where.nombre = { contains: nombre, mode: 'insensitive' };
    }

    if (apellido !== undefined) {
        where.apellido = { contains: apellido, mode: 'insensitive' };
    }

    if (dni !== undefined) {
        where.dni = { contains: dni, mode: 'insensitive' };
    }

    if (email !== undefined) {
        where.email = { contains: email, mode: 'insensitive' };
    }

    if (telefono !== undefined) {
        where.telefono = { contains: telefono, mode: 'insensitive' };
    }

    if (localidad !== undefined) {
        where.localidad = { contains: localidad, mode: 'insensitive' };
    }

    if (rubro !== undefined) {
        where.rubro = { contains: rubro, mode: 'insensitive' };
    }

    if (nombreEmprendimiento !== undefined) {
        where.nombreEmprendimiento = { contains: nombreEmprendimiento, mode: 'insensitive' };
    }

    // Cálculo para la paginación de Prisma
    const desplazamiento = (pagina - 1) * limite;

    const [artesanos, total] = await prisma.$transaction([
        prisma.artesano.findMany({
            where,
            orderBy: [{ [ordenarPor]: direccion }, { id: 'asc' }],
            skip: desplazamiento,
            take: limite,
            include: { productos: true }
        }),
        prisma.artesano.count({
            where
        })
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
  Servicio para obtener un artesano específico por su ID.
  Recibe el ID validado y lanza un error si no existe. 🟩
 */
export const obtenerArtesanoPorId = async (id) => {
    const artesano = await prisma.artesano.findUnique({
        where: { id },
        include: { productos: true }
    });

    if (!artesano) {
        throw crearError(`No existe un artesano con id ${id}`, 404);
    }

    return artesano;
};

/*
  Servicio para eliminar un artesano por su ID.
  Comprueba que el artesano exista antes de eliminarlo. 🟩
 */
export const eliminarArtesano = async (id) => {
    // Primero verificar que el artesano exista
    const artesano = await prisma.artesano.findUnique({
        where: { id }
    });

    if (!artesano) {
        throw crearError(`No existe un artesano con id ${id}`, 404);
    }

    await prisma.artesano.delete({
        where: { id }
    });

    return artesano;
};
