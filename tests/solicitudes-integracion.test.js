import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearEscenario, limpiarEscenario } from "./helpers/escenario-solicitudes.js";

// Verificaciones de entorno según la guía de la Unidad 5
assert.equal(process.env.NODE_ENV, "test", "El entorno debe estar configurado como test.");
assert.ok(process.env.DATABASE_URL, "DATABASE_URL debe estar definida para pruebas en Supabase.");

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

