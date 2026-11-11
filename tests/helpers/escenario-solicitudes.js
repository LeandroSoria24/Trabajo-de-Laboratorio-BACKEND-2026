import request from "supertest";

/**
 * Limpia de forma segura y relacional únicamente los registros de prueba (@clase10.test).
 * Garantiza que la tabla `Localidad` y el seed de producción/feria permanezcan 100% intactos.
 */
export async function limpiarEscenario(prisma) {
  const localidadesAntes = await prisma.localidad.count();

  const usuariosTest = await prisma.usuario.findMany({
    where: { email: { endsWith: "@clase10.test" } },
    select: { id: true }
  });

  const userIds = usuariosTest.map((u) => u.id);

  if (userIds.length > 0) {
    const artesanosTest = await prisma.artesano.findMany({
      where: { usuarioId: { in: userIds } },
      select: { id: true }
    });
    const artesanoIds = artesanosTest.map((a) => a.id);

    if (artesanoIds.length > 0) {
      await prisma.stand.updateMany({
        where: { artesanoId: { in: artesanoIds } },
        data: { artesanoId: null, estado: "DISPONIBLE" }
      });
      await prisma.solicitudPostulacion.deleteMany({
        where: { artesanoId: { in: artesanoIds } }
      });
      await prisma.producto.deleteMany({
        where: { artesanoId: { in: artesanoIds } }
      });
      await prisma.artesano.deleteMany({
        where: { id: { in: artesanoIds } }
      });
    }

    await prisma.solicitudPostulacion.updateMany({
      where: { evaluadorId: { in: userIds } },
      data: { evaluadorId: null }
    });

    await prisma.usuarioRol.deleteMany({
      where: { usuarioId: { in: userIds } }
    });
    await prisma.usuario.deleteMany({
      where: { id: { in: userIds } }
    });
  }

  await prisma.stand.deleteMany({
    where: { codigo: { startsWith: "TEST-" } }
  });
  await prisma.sector.deleteMany({
    where: { nombre: { startsWith: "TEST-" } }
  });
  await prisma.pabellon.deleteMany({
    where: { nombre: { startsWith: "TEST-" } }
  });

  const localidadesDespues = await prisma.localidad.count();
  if (localidadesAntes !== localidadesDespues) {
    throw new Error("ALERTA DE SEGURIDAD: La tabla Localidad fue alterada durante los tests.");
  }
}

/**
 * Prepara el escenario de prueba con dos artesanos (Ana y Bruno) y sus respectivos tokens JWT.
 * Basado en las diapositivas 886-921 de la Unidad 5 (Clase 10).
 */
export async function crearEscenario(app, prisma) {
  const password = "ClaveDePrueba2026!";

  // Obtener una localidad de Supabase para vincular los artesanos
  const localidad =
    (await prisma.localidad.findFirst({ where: { nombre: { contains: "Belén", mode: "insensitive" } } })) ||
    (await prisma.localidad.findFirst());

  if (!localidad) {
    throw new Error("No se encontraron registros en la tabla Localidad de Supabase.");
  }

  const registrarYCompletar = async (nombre, apellido, orden, rubro, emprendimiento) => {
    const email = `${nombre.toLowerCase()}@clase10.test`;

    // 1. Registro público de usuario (adquiere rol ARTESANO por defecto)
    await request(app)
      .post("/usuarios/registro")
      .send({
        nombre: `${nombre} ${apellido}`,
        email,
        password
      })
      .expect(201);

    // 2. Inicio de sesión para obtener token JWT
    const { body: loginBody } = await request(app)
      .post("/usuarios/login")
      .send({ email, password })
      .expect(200);

    const token = loginBody.token;
    const usuario = loginBody.usuario;

    // 3. Completar perfil de artesano vinculado
    const { body: perfilBody } = await request(app)
      .post("/artesanos/me")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre,
        apellido,
        dni: String(30000000 + orden),
        telefono: `+54 383 4${String(100000 + orden)}`,
        localidadId: localidad.id,
        rubro,
        nombreEmprendimiento: emprendimiento,
        descripcionTrayectoria: `Artesano de prueba para verificación de contratos (${nombre})`
      })
      .expect(201);

    return { usuario, artesano: perfilBody.artesano, token };
  };

  const anaData = await registrarYCompletar("Ana", "Martínez", 1, "Textil", "Tejidos del Valle");
  const brunoData = await registrarYCompletar("Bruno", "Gómez", 2, "Cerámica", "Alfarería Calchaquí");

  return {
    ana: anaData.artesano,
    usuarioAna: anaData.usuario,
    tokenAna: anaData.token,
    bruno: brunoData.artesano,
    usuarioBruno: brunoData.usuario,
    tokenBruno: brunoData.token,
    localidad
  };
}

