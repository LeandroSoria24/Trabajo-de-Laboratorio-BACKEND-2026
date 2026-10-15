import prisma from "../config/prisma.js";
export const asignarParticipante = async (dto) => {
return prisma.$transaction(async tx => {
const usuario = await tx.usuario.findUniqueOrThrow({
where: { id: dto.usuarioId },
include: { roles: { include: { rol: true } },
participante: true }
});
const esAdmin = usuario.roles.some(
a => a.rol.nombre === "ADMINISTRADOR");
if (!usuario.activo || !esAdmin ||
usuario.participante) {
const error = new Error(
"Requiere administrador activo " +
"sin Participante.");
error.status = 409; throw error;
}const actualizado = await tx.usuario.update({
where: { id: usuario.id },
data: {
participante: { create: {
nombre: dto.nombre, dni: dto.dni,
direccion: dto.direccion, email:
usuario.email
} },
roles: { create: {
rol: { connect: { nombre: "PARTICIPANTE" } }
} }
},
select: { participante: true }
});
return actualizado.participante;
});
}