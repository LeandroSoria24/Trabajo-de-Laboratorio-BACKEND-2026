import bcrypt from 'bcrypt';
import readline from 'node:readline';
import prisma from '../config/prisma.js';

const FACTOR_COSTO = 10;

export async function crearUsuarioAdmin(nombre, email, password) {
  if (!nombre || !email || !password) {
    throw new Error('Todos los campos (nombre, email, contraseña) son obligatorios.');
  }

  // Garantizar que existe el rol ADMINISTRADOR
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'ADMINISTRADOR' },
    update: {},
    create: { nombre: 'ADMINISTRADOR' }
  });

  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email },
    include: { roles: { include: { rol: true } } }
  });

  if (usuarioExistente) {
    const yaEsAdmin = usuarioExistente.roles.some((r) => r.rol.nombre === 'ADMINISTRADOR');
    if (yaEsAdmin) {
      console.log(`[INFO] El usuario con email "${email}" ya cuenta con el rol ADMINISTRADOR.`);
      return usuarioExistente;
    }

    await prisma.usuarioRol.create({
      data: {
        usuarioId: usuarioExistente.id,
        rolId: rolAdmin.id
      }
    });

    console.log(`[OK] Rol ADMINISTRADOR asignado al usuario existente: ${email}`);
    return usuarioExistente;
  }

  const passwordHash = await bcrypt.hash(password, FACTOR_COSTO);

  const nuevoAdmin = await prisma.usuario.create({
    data: {
      nombre,
      email,
      passwordHash,
      activo: true,
      roles: {
        create: { rolId: rolAdmin.id }
      }
    }
  });

  console.log(`[EXITO] ¡Usuario ADMINISTRADOR creado exitosamente!`);
  console.log(`   - ID: ${nuevoAdmin.id}`);
  console.log(`   - Nombre: ${nuevoAdmin.nombre}`);
  console.log(`   - Email: ${nuevoAdmin.email}`);
  return nuevoAdmin;
}

// Ejecución interactiva o por parámetros CLI
if (process.argv[1]?.replace(/\\/g, '/').endsWith('src/scripts/crear-admin.js')) {
  const args = process.argv.slice(2);

  if (args.length >= 3) {
    const [nombre, email, password] = args;
    crearUsuarioAdmin(nombre, email, password)
      .catch((err) => {
        console.error('[ERROR] Error al crear administrador:', err.message);
        process.exit(1);
      })
      .finally(async () => {
        await prisma.$disconnect();
      });
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n--- Creador Interactivo de Administradores ---');
    rl.question('Nombre completo: ', (nombre) => {
      rl.question('Correo electrónico: ', (email) => {
        rl.question('Contraseña temporal: ', async (password) => {
          rl.close();
          try {
            await crearUsuarioAdmin(nombre.trim(), email.trim(), password.trim());
          } catch (err) {
            console.error('[ERROR] Error al crear administrador:', err.message);
            process.exit(1);
          } finally {
            await prisma.$disconnect();
          }
        });
      });
    });
  }
}

