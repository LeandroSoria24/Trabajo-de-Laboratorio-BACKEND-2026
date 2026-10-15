import prisma from "../config/prisma.js";
export const cambiarActivo = async (usuarioId, activo) => {
return prisma.$transaction(async tx => {
const u = await tx.usuario.findUniqueOrThrow({
where: { id: usuarioId },
include: { roles: { include: { rol: true } } }
});
const esAdmin = u.roles.some(
a => a.rol.nombre === "ADMINISTRADOR");
if (!activo && u.activo && esAdmin) {
const otros = await tx.usuario.count({
where: { id: { not: usuarioId }, activo: true,
roles: { some: { rol: { nombre:
"ADMINISTRADOR" } } } }
});
if (!otros) {
const error = new Error(
"Debe quedar un administrador activo.");
error.status = 409; throw error;
}
}
if (!activo && u.activo && !esAdmin) {
const cantidad = await tx.inscripcion.count({
where: { participante: { usuarioId } }
});
if (cantidad > 0) {
const error = new Error("Tiene inscripciones:");
error.status = 409; throw error;
}
}
return tx.usuario.update({
where: { id: usuarioId }, data: { activo },
select: { id: true, activo: true }
});
});
};