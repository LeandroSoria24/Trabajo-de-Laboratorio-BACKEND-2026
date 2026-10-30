import prisma from "../config/prisma.js";

export const cambiarActivo = async (usuarioId, activo) => {
    return prisma.$transaction(async (tx) => {
        const u = await tx.usuario.findUniqueOrThrow({
            where: { id: usuarioId },
            include: { roles: { include: { rol: true } } }
        });

        const esAdmin = u.roles.some((a) => a.rol.nombre === "ADMINISTRADOR");

        // Regla: si se desactiva un admin, debe quedar al menos otro admin activo
        if (!activo && u.activo && esAdmin) {
            const otros = await tx.usuario.count({
                where: {
                    id: { not: usuarioId },
                    activo: true,
                    roles: { some: { rol: { nombre: "ADMINISTRADOR" } } }
                }
            });
            if (!otros) {
                const error = new Error("Debe quedar un administrador activo.");
                error.status = 409;
                throw error;
            }
        }

        return tx.usuario.update({
            where: { id: usuarioId },
            data: { activo },
            select: { id: true, activo: true }
        });
    });
};