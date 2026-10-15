import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";
import { registrarUsuarioSchema }
from "../src/validators/usuarios.schemas.js";
try {
const dto = registrarUsuarioSchema.strict().parse({
nombre: process.env.ADMIN_NOMBRE,
email: process.env.ADMIN_EMAIL,
password: process.env.ADMIN_PASSWORD
});
const passwordHash = await bcrypt.hash(dto.password, 10);

await prisma.usuario.create({
    data: { nombre: dto.nombre, email: dto.email,
    passwordHash, activo: true,
    roles: { create: {
    rol: { connect: { nombre: "ADMINISTRADOR" } }
} }
}
});
    console.log("Administrador inicial creado.");
} finally {
await prisma.$disconnect();
}