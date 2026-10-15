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