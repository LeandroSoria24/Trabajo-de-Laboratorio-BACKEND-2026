import bcrypt from 'bcrypt';
import prisma from '../src/config/prisma.js';
import { vaciarBaseDeDatos } from './empty.js';

const FACTOR_COSTO = 10;

async function main() {
  console.log('🌱 INICIANDO SEEDER DE PONCHO DIGITAL...');

  // 1. Vaciado relacional preservando Localidad
  await vaciarBaseDeDatos();

  // 2. Roles del Sistema
  console.log('📌 Creando roles...');
  const rolAdmin = await prisma.rol.create({
    data: { nombre: 'ADMINISTRADOR' }
  });

  const rolArtesano = await prisma.rol.create({
    data: { nombre: 'ARTESANO' }
  });

  // 3. Infraestructura: Pabellones
  console.log('📌 Creando pabellones...');
  const pabArtesanal = await prisma.pabellon.create({
    data: { nombre: 'Pabellón Artesanal' }
  });
  const pabCentral = await prisma.pabellon.create({
    data: { nombre: 'Pabellón Central' }
  });
  const pabGastronomico = await prisma.pabellon.create({
    data: { nombre: 'Pabellón Gastronómico' }
  });
  const pabInstitucional = await prisma.pabellon.create({
    data: { nombre: 'Pabellón Institucional' }
  });

  // 4. Infraestructura: Sectores
  console.log('📌 Creando sectores temáticos...');
  const secTextil = await prisma.sector.create({ data: { nombre: 'Sector Textil' } });
  const secCeramica = await prisma.sector.create({ data: { nombre: 'Sector Cerámica' } });
  const secMadera = await prisma.sector.create({ data: { nombre: 'Sector Madera' } });
  const secMetales = await prisma.sector.create({ data: { nombre: 'Sector Metales' } });
  const secCuero = await prisma.sector.create({ data: { nombre: 'Sector Cuero' } });

  // 5. Infraestructura: Stands
  console.log('📌 Creando stands...');
  const standA01 = await prisma.stand.create({
    data: {
      codigo: 'A01',
      numero: 1,
      estado: 'OCUPADO',
      pabellonId: pabArtesanal.id,
      sectorId: secTextil.id
    }
  });

  const standA02 = await prisma.stand.create({
    data: {
      codigo: 'A02',
      numero: 2,
      estado: 'DISPONIBLE',
      pabellonId: pabArtesanal.id,
      sectorId: secTextil.id
    }
  });

  const standB01 = await prisma.stand.create({
    data: {
      codigo: 'B01',
      numero: 3,
      estado: 'OCUPADO',
      pabellonId: pabArtesanal.id,
      sectorId: secCeramica.id
    }
  });

  const standB02 = await prisma.stand.create({
    data: {
      codigo: 'B02',
      numero: 4,
      estado: 'DISPONIBLE',
      pabellonId: pabArtesanal.id,
      sectorId: secCeramica.id
    }
  });

  const standC01 = await prisma.stand.create({
    data: {
      codigo: 'C01',
      numero: 5,
      estado: 'OCUPADO',
      pabellonId: pabCentral.id,
      sectorId: secMadera.id
    }
  });

  const standC02 = await prisma.stand.create({
    data: {
      codigo: 'C02',
      numero: 6,
      estado: 'DISPONIBLE',
      pabellonId: pabCentral.id,
      sectorId: secMadera.id
    }
  });

  const standD01 = await prisma.stand.create({
    data: {
      codigo: 'D01',
      numero: 7,
      estado: 'DISPONIBLE',
      pabellonId: pabCentral.id,
      sectorId: secMetales.id
    }
  });

  const standD02 = await prisma.stand.create({
    data: {
      codigo: 'D02',
      numero: 8,
      estado: 'MANTENIMIENTO',
      pabellonId: pabCentral.id,
      sectorId: secCuero.id
    }
  });

  // 6. Cuentas Administrativas
  console.log('📌 Creando administradores...');
  const passAdminHash = await bcrypt.hash('Admin1234#', FACTOR_COSTO);

  const adminPrincipal = await prisma.usuario.create({
    data: {
      nombre: 'Administrador Poncho',
      email: 'admin@ponchodigital.gob.ar',
      passwordHash: passAdminHash,
      activo: true,
      roles: {
        create: { rolId: rolAdmin.id }
      }
    }
  });

  const adminSecundario = await prisma.usuario.create({
    data: {
      nombre: 'Santiago Admin',
      email: 'santiago.admin@ponchodigital.gob.ar',
      passwordHash: passAdminHash,
      activo: true,
      roles: {
        create: { rolId: rolAdmin.id }
      }
    }
  });

  // 7. Artesanos, Productos y Postulaciones
  console.log('📌 Creando artesanos de prueba...');
  const passArtesanoHash = await bcrypt.hash('Artesano1234#', FACTOR_COSTO);

  // Buscar algunas localidades existentes para asociar
  const locBelen = (await prisma.localidad.findFirst({ where: { nombre: { contains: 'Belén', mode: 'insensitive' } } })) || (await prisma.localidad.findFirst());
  const locSantaMaria = (await prisma.localidad.findFirst({ where: { nombre: { contains: 'Santa María', mode: 'insensitive' } } })) || locBelen;
  const locTinogasta = (await prisma.localidad.findFirst({ where: { nombre: { contains: 'Tinogasta', mode: 'insensitive' } } })) || locBelen;
  const locAndalgala = (await prisma.localidad.findFirst({ where: { nombre: { contains: 'Andalgalá', mode: 'insensitive' } } })) || locBelen;
  const locLondres = (await prisma.localidad.findFirst({ where: { nombre: { contains: 'Londres', mode: 'insensitive' } } })) || locBelen;

  // Artesana 1: Lorenza (Textil - Stand A01 - Aprobada)
  const userLorenza = await prisma.usuario.create({
    data: {
      nombre: 'Lorenza Gutiérrez',
      email: 'lorenza@artesanoscatamarca.com',
      passwordHash: passArtesanoHash,
      activo: true,
      roles: { create: { rolId: rolArtesano.id } }
    }
  });

  const artLorenza = await prisma.artesano.create({
    data: {
      usuarioId: userLorenza.id,
      localidadId: locBelen.id,
      nombre: 'Lorenza',
      apellido: 'Gutiérrez',
      dni: '18234567',
      email: 'lorenza@artesanoscatamarca.com',
      telefono: '+54 3835 420111',
      nombreEmprendimiento: 'Tejidos de Altura Belén',
      rubro: 'Textil',
      descripcionTrayectoria: 'Maestra tejedora con más de 30 años elaborando ponchos en telar criollo con lana de vicuña y oveja.',
      activo: true
    }
  });

  // Asignar stand A01 a Lorenza
  await prisma.stand.update({
    where: { id: standA01.id },
    data: { artesanoId: artLorenza.id, estado: 'OCUPADO' }
  });

  // Productos de Lorenza
  await prisma.producto.createMany({
    data: [
      {
        artesanoId: artLorenza.id,
        nombre: 'Poncho de Vicuña Guarda Atada',
        descripcion: 'Poncho fino hilado a mano en huso tradicional, teñido con tintes naturales de jarilla y corteza.',
        precio: 150000.00,
        stock: 3,
        activo: true
      },
      {
        artesanoId: artLorenza.id,
        nombre: 'Manta Puneña de Oveja',
        descripcion: 'Manta rústica y abrigada tejida en telar de cuatro cuadros.',
        precio: 45000.00,
        stock: 8,
        activo: true
      }
    ]
  });

  // Solicitud Aprobada de Lorenza
  await prisma.solicitudPostulacion.create({
    data: {
      artesanoId: artLorenza.id,
      standId: standA01.id,
      evaluadorId: adminPrincipal.id,
      estado: 'APROBADA',
      observaciones: 'Cumple con los estándares de autenticidad artesanal y trayectoria comprobada.'
    }
  });

  // Artesano 2: Juan (Cerámica - Stand B01 - Aprobada)
  const userJuan = await prisma.usuario.create({
    data: {
      nombre: 'Juan Carlos Morales',
      email: 'juan.ceramica@artesanoscatamarca.com',
      passwordHash: passArtesanoHash,
      activo: true,
      roles: { create: { rolId: rolArtesano.id } }
    }
  });

  const artJuan = await prisma.artesano.create({
    data: {
      usuarioId: userJuan.id,
      localidadId: locSantaMaria.id,
      nombre: 'Juan Carlos',
      apellido: 'Morales',
      dni: '24567890',
      email: 'juan.ceramica@artesanoscatamarca.com',
      telefono: '+54 3838 412333',
      nombreEmprendimiento: 'Alfarería Diaguita Yokavil',
      rubro: 'Cerámica',
      descripcionTrayectoria: 'Reproducción de iconografía santamariana y piezas ceremoniales del valle Calchaquí.',
      activo: true
    }
  });

  await prisma.stand.update({
    where: { id: standB01.id },
    data: { artesanoId: artJuan.id, estado: 'OCUPADO' }
  });

  await prisma.producto.createMany({
    data: [
      {
        artesanoId: artJuan.id,
        nombre: 'Urna Funeraria Santamariana (Réplica)',
        descripcion: 'Pieza de arcilla roja modelada a mano, pulida con cantos rodados y quemada a leña.',
        precio: 52000.00,
        stock: 4,
        activo: true
      },
      {
        artesanoId: artJuan.id,
        nombre: 'Pucu Ceremonial Pintado',
        descripcion: 'Cuenco utilitario con engobe natural blanco y negro.',
        precio: 18000.00,
        stock: 12,
        activo: true
      }
    ]
  });

  await prisma.solicitudPostulacion.create({
    data: {
      artesanoId: artJuan.id,
      standId: standB01.id,
      evaluadorId: adminPrincipal.id,
      estado: 'APROBADA',
      observaciones: 'Documentación completa. Asignado en sector Cerámica.'
    }
  });

  // Artesano 3: Carmen (Madera - Stand C01 - Aprobada)
  const userCarmen = await prisma.usuario.create({
    data: {
      nombre: 'Carmen Albarracín',
      email: 'carmen.madera@artesanoscatamarca.com',
      passwordHash: passArtesanoHash,
      activo: true,
      roles: { create: { rolId: rolArtesano.id } }
    }
  });

  const artCarmen = await prisma.artesano.create({
    data: {
      usuarioId: userCarmen.id,
      localidadId: locTinogasta.id,
      nombre: 'Carmen',
      apellido: 'Albarracín',
      dni: '30123456',
      email: 'carmen.madera@artesanoscatamarca.com',
      telefono: '+54 3837 421555',
      nombreEmprendimiento: 'Artesanías en Algarrobo del Abaucán',
      rubro: 'Madera',
      descripcionTrayectoria: 'Talla en maderas nativas caídas de algarrobo y chañar, rescatando utensilios rurales.',
      activo: true
    }
  });

  await prisma.stand.update({
    where: { id: standC01.id },
    data: { artesanoId: artCarmen.id, estado: 'OCUPADO' }
  });

  await prisma.producto.create({
    data: {
      artesanoId: artCarmen.id,
      nombre: 'Batea de Algarrobo de una Pieza',
      descripcion: 'Batea tallada a gubia tradicional, curada con cera de abejas y aceite comestible.',
      precio: 65000.00,
      stock: 6,
      activo: true
    }
  });

  // Artesano 4: Marcos (Metales - Postulación Pendiente)
  const userMarcos = await prisma.usuario.create({
    data: {
      nombre: 'Marcos Carrizo',
      email: 'marcos.plata@artesanoscatamarca.com',
      passwordHash: passArtesanoHash,
      activo: true,
      roles: { create: { rolId: rolArtesano.id } }
    }
  });

  const artMarcos = await prisma.artesano.create({
    data: {
      usuarioId: userMarcos.id,
      localidadId: locAndalgala.id,
      nombre: 'Marcos',
      apellido: 'Carrizo',
      dni: '33456789',
      email: 'marcos.plata@artesanoscatamarca.com',
      telefono: '+54 3835 481222',
      nombreEmprendimiento: 'Orfebrería y Rodocrosita Aconquija',
      rubro: 'Metales',
      descripcionTrayectoria: 'Cincelado en plata 925 y alpaca con engarce de rodocrosita de Mina Capillitas.',
      activo: false
    }
  });

  await prisma.producto.create({
    data: {
      artesanoId: artMarcos.id,
      nombre: 'Dije de Plata 925 con Rodocrosita Veteada',
      descripcion: 'Piedra nacional argentina engarzada artesanalmente.',
      precio: 38000.00,
      stock: 10,
      activo: true
    }
  });

  await prisma.solicitudPostulacion.create({
    data: {
      artesanoId: artMarcos.id,
      standId: standD01.id,
      estado: 'PENDIENTE',
      observaciones: 'Solicita stand en Pabellón Central para exhibición de joyería fina.'
    }
  });

  // Artesana 5: Elena (Cuero - Postulación en Revisión)
  const userElena = await prisma.usuario.create({
    data: {
      nombre: 'Elena Nieva',
      email: 'elena.cuero@artesanoscatamarca.com',
      passwordHash: passArtesanoHash,
      activo: true,
      roles: { create: { rolId: rolArtesano.id } }
    }
  });

  const artElena = await prisma.artesano.create({
    data: {
      usuarioId: userElena.id,
      localidadId: locLondres.id,
      nombre: 'Elena',
      apellido: 'Nieva',
      dni: '28901234',
      email: 'elena.cuero@artesanoscatamarca.com',
      telefono: '+54 3835 470001',
      nombreEmprendimiento: 'Cueros y Lomillería El Shinki',
      rubro: 'Cuero',
      descripcionTrayectoria: 'Talabartería criolla, trenzados en cuero crudo y curtido vegetal tradicional.',
      activo: true
    }
  });

  await prisma.solicitudPostulacion.create({
    data: {
      artesanoId: artElena.id,
      standId: standD02.id,
      evaluadorId: adminSecundario.id,
      estado: 'EN_REVISION',
      observaciones: 'Evaluando reubicación por tareas de mantenimiento en el stand asignado.'
    }
  });

  console.log('\n=============================================');
  console.log('🎉 SEED COMPLETADO EXITOSAMENTE');
  console.log('=============================================');
  console.log('👑 Cuentas Administrador creadas:');
  console.log('   - admin@ponchodigital.gob.ar / Admin1234#');
  console.log('   - santiago.admin@ponchodigital.gob.ar / Admin1234#');
  console.log('🎨 Cuentas Artesano creadas (Password: Artesano1234#):');
  console.log('   - lorenza@artesanoscatamarca.com (Textil, Belén)');
  console.log('   - juan.ceramica@artesanoscatamarca.com (Cerámica, Santa María)');
  console.log('   - carmen.madera@artesanoscatamarca.com (Madera, Tinogasta)');
  console.log('   - marcos.plata@artesanoscatamarca.com (Metales, Andalgalá)');
  console.log('   - elena.cuero@artesanoscatamarca.com (Cuero, Londres)');
  console.log('=============================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

