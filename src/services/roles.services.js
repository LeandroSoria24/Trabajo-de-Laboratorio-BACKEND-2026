import prisma from "../config/prisma.js";

export const asignarAdministrador = async (usuarioId) => {
    return prisma.$transaction(async (tx) => {
        await tx.usuario.findUniqueOrThrow({
            where: { id: usuarioId },
            select: { id: true }
        });

        // Aseguramos que el rol exista
        const rol = await tx.rol.upsert({
            where: { nombre: "ADMINISTRADOR" },
            update: {},
            create: { nombre: "ADMINISTRADOR" }
        });

        const clave = { usuarioId, rolId: rol.id };
        return tx.usuarioRol.upsert({
            where: { usuarioId_rolId: clave },
            update: {},
            create: clave
        });
    });
};

export const retirarRol = async (usuarioId, nombre) => {
    return prisma.$transaction(async (tx) => {
        const u = await tx.usuario.findUniqueOrThrow({
            where: { id: usuarioId },
            include: { roles: { include: { rol: true } } }
        });

        const asignacion = u.roles.find((a) => a.rol.nombre === nombre);
        if (!asignacion) return;

        // Regla 1: Debe conservar al menos un rol
        if (u.roles.length === 1) {
            const error = new Error("Debe conservar al menos un rol.");
            error.status = 409;
            throw error;
        }

        // Regla 2: Si se retira ADMINISTRADOR, debe quedar otro admin activo
        if (nombre === "ADMINISTRADOR" && u.activo) {
            const otros = await tx.usuario.count({
                where: {
                    id: { not: usuarioId },
                    activo: true,
                    roles: { some: { rol: { nombre } } }
                }
            });
            if (!otros) {
                const error = new Error("Debe quedar un administrador activo.");
                error.status = 409;
                throw error;
            }
        }

        // Regla 3: Si se retira ARTESANO, no debe tener solicitudes de postulación registradas
        if (nombre === "ARTESANO") {
            const artesano = await tx.artesano.findUnique({
                where: { usuarioId },
                include: { _count: { select: { solicitudes: true } } }
            });
            if (artesano && artesano._count.solicitudes > 0) {
                const error = new Error("Tiene postulaciones: no se puede retirar el rol ARTESANO.");
                error.status = 409;
                throw error;
            }
            if (artesano) {
                await tx.artesano.delete({ where: { usuarioId } });
            }
        }

        await tx.usuarioRol.delete({
            where: {
                usuarioId_rolId: { usuarioId, rolId: asignacion.rolId }
            }
        });
    });
};