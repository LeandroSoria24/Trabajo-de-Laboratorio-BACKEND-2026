import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearEscenario, limpiarEscenario } from "./helpers/escenario-solicitudes.js";

// Verificaciones de entorno según la guía de la Unidad 5
assert.equal(process.env.NODE_ENV, "test", "El entorno debe estar configurado como test.");
assert.ok(process.env.DATABASE_URL, "DATABASE_URL debe estar definida para pruebas en Supabase.");
assert.ok(
  new URL(process.env.DATABASE_URL).pathname.length > 1,
  "Debe especificarse la base de datos en la URL de conexión."
);

const { default: prisma } = await import("../src/config/prisma.js");
const { app } = await import("../src/app.js");

let datos;

// ─────────────────────────────────────────────────────────────
// HOOKS DEL CICLO DE VIDA (before, after, beforeEach)
// Basado en las diapositivas 926-980 de la Unidad 5 (Clase 10)
// ─────────────────────────────────────────────────────────────

before(async () => {
  await prisma.$connect();
  await limpiarEscenario(prisma);
});

after(async () => {
  await limpiarEscenario(prisma);
  await prisma.$disconnect();
});

beforeEach(async () => {
  await limpiarEscenario(prisma);
  datos = await crearEscenario(app, prisma);
});

// Función de apoyo para presentar postulación exigiendo 201 Created
const inscribir = (token, observaciones = "Postulación para la fiesta") =>
  request(app)
    .post("/solicitudes")
    .set("Authorization", `Bearer ${token}`)
    .send({ observaciones })
    .expect(201)
    .expect("Content-Type", /json/);

// ─────────────────────────────────────────────────────────────
// CASOS DE PRUEBA DE INTEGRACIÓN CON SUPABASE
// ─────────────────────────────────────────────────────────────

test("Test 1: Crear una postulación correcta la guarda en PostgreSQL (Supabase)", async () => {
  const { ana, tokenAna } = datos;

  const respuesta = await inscribir(tokenAna, "Postulación con ponchos finos de vicuña");
  const { solicitud: solicitudCreada } = respuesta.body;

  // 1. Comprobar datos guardados en Supabase mediante Prisma
  const guardada = await prisma.solicitudPostulacion.findUniqueOrThrow({
    where: { id: solicitudCreada.id }
  });

  assert.equal(guardada.artesanoId, ana.id);
  assert.equal(guardada.estado, "PENDIENTE");
  assert.equal(guardada.observaciones, "Postulación con ponchos finos de vicuña");

  // 2. Comprobar respuesta recibida
  assert.equal(solicitudCreada.artesanoId, ana.id);
  assert.equal(solicitudCreada.estado, "PENDIENTE");

  // 3. Comprobar que solo existe 1 postulación para Ana en la base
  const totalAna = await prisma.solicitudPostulacion.count({
    where: { artesanoId: ana.id }
  });
  assert.equal(totalAna, 1);
});

test("Test 2: Listar devuelve todas las postulaciones propias y ninguna ajena", async () => {
  const { tokenAna, tokenBruno } = datos;

  // Crear una postulación para Ana y una para Bruno
  const resAna = await inscribir(tokenAna, "Postulación textil de Ana");
  const resBruno = await inscribir(tokenBruno, "Postulación de cerámica de Bruno");

  const solicitudPropiaAna = resAna.body.solicitud;
  const solicitudAjenaBruno = resBruno.body.solicitud;

  // Consultar GET /solicitudes/me con el token de Ana
  const { body: misSolicitudes } = await request(app)
    .get("/solicitudes/me")
    .set("Authorization", `Bearer ${tokenAna}`)
    .expect(200)
    .expect("Content-Type", /json/);

  // Debe contener la postulación de Ana
  const contienePropia = misSolicitudes.some((s) => s.id === solicitudPropiaAna.id);
  assert.equal(contienePropia, true, "El listado debe incluir la postulación propia.");

  // No debe contener la postulación de Bruno
  const contieneAjena = misSolicitudes.some((s) => s.id === solicitudAjenaBruno.id);
  assert.equal(contieneAjena, false, "El listado no debe incluir postulaciones de otros artesanos.");
});

test("Test 3: Impedir cancelar una postulación existente perteneciente a otro artesano", async () => {
  const { tokenAna, tokenBruno } = datos;

  // Creamos la postulación para Bruno
  const resBruno = await inscribir(tokenBruno, "Postulación de Bruno para Alfarería");
  const solicitudBruno = resBruno.body.solicitud;

  // Ana intenta cancelar la postulación de Bruno
  const respuestaIntento = await request(app)
    .patch(`/solicitudes/${solicitudBruno.id}/cancelar`)
    .set("Authorization", `Bearer ${tokenAna}`)
    .expect(404)
    .expect("Content-Type", /json/);

  assert.equal(respuestaIntento.body.mensaje, "Solicitud no encontrada.");

  // Verificar en Supabase que el registro de Bruno sigue intacto y en estado PENDIENTE
  const enBase = await prisma.solicitudPostulacion.findUniqueOrThrow({
    where: { id: solicitudBruno.id }
  });
  assert.equal(enBase.estado, "PENDIENTE", "La postulación ajena no debe haber sido modificada.");
});

test("Test 4 (Actividad Integradora): Repetir postulación devuelve 409 y conserva un único registro", async () => {
  const { ana, tokenAna } = datos;

  // 1. Preparar: Primera postulación de Ana (espera 201)
  await inscribir(tokenAna, "Primera presentación de Ana");

  // 2. Actuar: Segundo intento con el mismo artesano (sin helper porque esperamos 409)
  const respuestaDuplicado = await request(app)
    .post("/solicitudes")
    .set("Authorization", `Bearer ${tokenAna}`)
    .send({ observaciones: "Segundo intento duplicado" })
    .expect(409)
    .expect("Content-Type", /json/);

  // 3. Comprobar mensaje de conflicto
  assert.equal(
    respuestaDuplicado.body.mensaje,
    "Ya posee una solicitud de postulación en estado PENDIENTE."
  );

  // 4. Comprobar que en Supabase se conserva únicamente 1 registro para Ana
  const total = await prisma.solicitudPostulacion.count({
    where: { artesanoId: ana.id }
  });
  assert.equal(total, 1, "Debe existir únicamente 1 postulación registrada en la base de datos.");
});

test("Test 5 (Verificación de Roles): Rol que no corresponde devuelve 403 Forbidden", async () => {
  const { tokenAna } = datos;

  // Ana posee rol ARTESANO. Al intentar consultar la bandeja administrativa de solicitudes (GET /solicitudes):
  const respuesta = await request(app)
    .get("/solicitudes")
    .set("Authorization", `Bearer ${tokenAna}`)
    .expect(403)
    .expect("Content-Type", /json/);

  assert.deepEqual(respuesta.body, {
    mensaje: "No tiene permiso para esta operación."
  });
});

test("Test 6 (Regla 1:1 de Stands y Propiedad de Productos): Impedir asignar otro stand a un artesano que ya tiene stand y proteger productos ajenos", async () => {
  const { ana, bruno, tokenAna, tokenBruno } = datos;
  const { generarToken } = await import("../src/services/token.services.js");

  // 1. Crear un usuario administrador de prueba y dos stands disponibles de prueba
  const adminUser = await prisma.usuario.create({
    data: {
      nombre: "Admin Test",
      email: "admin@clase10.test",
      passwordHash: "hash-no-usado-en-login",
      activo: true,
      roles: {
        create: {
          rol: {
            connectOrCreate: {
              where: { nombre: "ADMINISTRADOR" },
              create: { nombre: "ADMINISTRADOR" }
            }
          }
        }
      }
    }
  });
  const tokenAdmin = generarToken({ id: adminUser.id, roles: ["ADMINISTRADOR"] });

  const pabellon = await prisma.pabellon.create({ data: { nombre: "TEST-Pabellon" } });
  const sector = await prisma.sector.create({ data: { nombre: "TEST-Sector" } });
  const stand1 = await prisma.stand.create({
    data: { codigo: "TEST-S1", numero: 901, pabellonId: pabellon.id, sectorId: sector.id, estado: "DISPONIBLE" }
  });
  const stand2 = await prisma.stand.create({
    data: { codigo: "TEST-S2", numero: 902, pabellonId: pabellon.id, sectorId: sector.id, estado: "DISPONIBLE" }
  });

  // 2. Ana y Bruno presentan sus postulaciones y el Administrador las aprueba
  const resInscripcion = await inscribir(tokenAna, "Postulación de Ana para asignación de stand");
  const solicitudId = resInscripcion.body.solicitud.id;
  const resInscripcionBruno = await inscribir(tokenBruno, "Postulación de Bruno para asignación de stand");
  const solicitudBrunoId = resInscripcionBruno.body.solicitud.id;

  await request(app)
    .patch(`/solicitudes/${solicitudId}/evaluar`)
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send({ estado: "APROBADA", observaciones: "Aprobada en test de integración" })
    .expect(200);

  await request(app)
    .patch(`/solicitudes/${solicitudBrunoId}/evaluar`)
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send({ estado: "APROBADA", observaciones: "Aprobada Bruno en test de integración" })
    .expect(200);

  // 3. El Administrador asigna el primer stand (TEST-S1) a la solicitud aprobada de Ana (200 OK)
  await request(app)
    .patch(`/solicitudes/${solicitudId}/asignar-stand`)
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send({ standId: stand1.id })
    .expect(200);

  // 4. Intentar asignarle un segundo stand (TEST-S2) a Ana vía Solicitudes devuelve 409 Conflict
  const resReasignacionSolicitud = await request(app)
    .patch(`/solicitudes/${solicitudId}/asignar-stand`)
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send({ standId: stand2.id })
    .expect(409);

  assert.match(resReasignacionSolicitud.body.mensaje, /ya tiene asignado el stand 'TEST-S1'/);

  // 5. Intentar asignarle un segundo stand (TEST-S2) a Ana vía Stands directo devuelve 400 Bad Request
  const resReasignacionDirecta = await request(app)
    .patch(`/stands/${stand2.id}/asignar-artesano`)
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send({ artesanoId: ana.id })
    .expect(400);

  assert.match(resReasignacionDirecta.body.mensaje, /ya tiene asignado el stand 'TEST-S1'/);

  // 6. Intentar sobrescribir el stand ocupado TEST-S1 con Bruno vía PUT /stands/:id devuelve 400 Bad Request
  const resSobrescribirStand = await request(app)
    .put(`/stands/${stand1.id}`)
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send({ artesanoId: bruno.id })
    .expect(400);

  assert.match(resSobrescribirStand.body.mensaje, /ya se encuentra asignado a otro artesano/);

  // 7. Liberar TEST-S1 y probar concurrencia simultánea (dos peticiones paralelas intentando asignar TEST-S2 a Ana y Bruno)
  await request(app)
    .patch(`/stands/${stand1.id}/liberar`)
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .expect(200);

  const [resConc1, resConc2] = await Promise.all([
    request(app)
      .patch(`/solicitudes/${solicitudId}/asignar-stand`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ standId: stand2.id }),
    request(app)
      .patch(`/solicitudes/${solicitudBrunoId}/asignar-stand`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ standId: stand2.id })
  ]);

  const codigosConcurrencia = [resConc1.status, resConc2.status].sort((a, b) => a - b);
  assert.deepEqual(
    codigosConcurrencia,
    [200, 409],
    "En asignación concurrente del mismo stand, exactamente una solicitud debe tener éxito (200) y la otra fallar con 409."
  );

  // 8. Ana publica un producto propio (201) y Bruno intenta modificarlo/eliminarlo recibiendo 403 Forbidden
  const { body: productoAna } = await request(app)
    .post("/productos")
    .set("Authorization", `Bearer ${tokenAna}`)
    .send({
      nombre: "Poncho Test Propiedad",
      precio: 80000,
      stock: 3,
      artesanoId: ana.id
    })
    .expect(201);

  await request(app)
    .put(`/productos/${productoAna.id}`)
    .set("Authorization", `Bearer ${tokenBruno}`)
    .send({ nombre: "Intento de edición por Bruno", precio: 1000 })
    .expect(403);

  await request(app)
    .delete(`/productos/${productoAna.id}`)
    .set("Authorization", `Bearer ${tokenBruno}`)
    .expect(403);

  // 9. Ana da de baja lógica su propio producto (200 OK) y un visitante público ya no puede accederlo por ID (404)
  await request(app)
    .delete(`/productos/${productoAna.id}`)
    .set("Authorization", `Bearer ${tokenAna}`)
    .expect(200);

  await request(app)
    .get(`/productos/${productoAna.id}`)
    .expect(404);
});



