import prisma from "../config/prisma.js";
export const asignarAdministrador =
async (usuarioId) => {
return prisma.$transaction(async (tx) => {
await tx.usuario.findUniqueOrThrow({
where: { id: usuarioId },
select: { id: true }
}); const rol = await tx.rol.findUniqueOrThrow({
where: { nombre: "ADMINISTRADOR" }
});
const clave = { usuarioId, rolId: rol.id };
return tx.usuarioRol.upsert({
where: { usuarioId_rolId: clave },
update: {}, create: clave
});
});
};

export const retirarRol = async (usuarioId, nombre) => {
return prisma.$transaction(async tx => {
const u = await tx.usuario.findUniqueOrThrow({
where: { id: usuarioId },
include: { roles: { include: { rol: true } } }
});
const asignacion = u.roles.find(a => a.rol.nombre ===
nombre);
if (!asignacion) return;
if (u.roles.length === 1) {
const error = new Error("Debe conservar un rol.");
error.status = 409; throw error;
}
if (nombre === "ADMINISTRADOR" && u.activo) {
const otros = await tx.usuario.count({
where: { id: { not: usuarioId }, activo: true,
roles: { some: { rol: { nombre } } } }
});
if (!otros) {
const error = new Error(
"Debe quedar un administrador activo.");
error.status = 409; throw error;
}
}if (nombre === "PARTICIPANTE") {
const cantidad = await tx.inscripcion.count({
where: { participante: { usuarioId } }
});
if (cantidad > 0) {
const error = new Error(
"Tiene inscripciones: no se puede " +
"retirar el rol PARTICIPANTE.");
error.status = 409; throw error;
}
await tx.participante.delete({ where: { usuarioId }
});
}
await tx.usuarioRol.delete({ where: {
usuarioId_rolId: { usuarioId, rolId: asignacion.rolId
}
} });
});
};