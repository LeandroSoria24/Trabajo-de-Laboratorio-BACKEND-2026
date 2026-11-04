import prisma from '../src/config/prisma.js';

export async function vaciarBaseDeDatos() {
  console.log('--- Iniciando vaciado de la base de datos ---');

  // 1. Verificar tabla Localidad antes de operar
  const localidadesAntes = await prisma.localidad.count();
  console.log(`[INFO] Tabla Localidad protegida: ${localidadesAntes} registros.`);

  // 2. Eliminación en orden estricto de dependencias relacionales
  const delSolicitudes = await prisma.solicitudPostulacion.deleteMany();
  console.log(`- Solicitudes eliminadas: ${delSolicitudes.count}`);

  const delProductos = await prisma.producto.deleteMany();
  console.log(`- Productos eliminados: ${delProductos.count}`);

  const delStands = await prisma.stand.deleteMany();
  console.log(`- Stands eliminados: ${delStands.count}`);

  const delArtesanos = await prisma.artesano.deleteMany();
  console.log(`- Artesanos eliminados: ${delArtesanos.count}`);

  const delUsuarioRoles = await prisma.usuarioRol.deleteMany();
  console.log(`- UsuarioRoles eliminados: ${delUsuarioRoles.count}`);

  const delUsuarios = await prisma.usuario.deleteMany();
  console.log(`- Usuarios eliminados: ${delUsuarios.count}`);

  const delTokens = await prisma.tokenRevocado.deleteMany();
  console.log(`- Tokens revocados eliminados: ${delTokens.count}`);

  const delSectores = await prisma.sector.deleteMany();
  console.log(`- Sectores eliminados: ${delSectores.count}`);

  const delPabellones = await prisma.pabellon.deleteMany();
  console.log(`- Pabellones eliminados: ${delPabellones.count}`);

  const delRoles = await prisma.rol.deleteMany();
  console.log(`- Roles eliminados: ${delRoles.count}`);

  // 3. Confirmar que Localidad sigue intacta
  const localidadesDespues = await prisma.localidad.count();
  console.log(`[VERIFICACIÓN] Tabla Localidad intacta: ${localidadesDespues} registros.`);

  if (localidadesAntes !== localidadesDespues) {
    throw new Error('ALERTA DE SEGURIDAD: El número de registros en la tabla Localidad cambió.');
  }

  console.log('--- Base de datos vaciada con éxito (Tabla Localidad preservada intacta) ---\n');
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('prisma/empty.js')) {
  vaciarBaseDeDatos()
    .catch((err) => {
      console.error('Error al vaciar la base de datos:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

