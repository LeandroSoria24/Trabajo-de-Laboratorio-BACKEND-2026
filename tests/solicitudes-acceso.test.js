import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

// Configuración de entorno de prueba antes de importar la aplicación
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "secreto-exclusivo-de-pruebas";

const { app } = await import("../src/app.js");

// ─────────────────────────────────────────────────────────────
// CASOS DE PRUEBA DE CONTRATO Y AUTENTICACIÓN (Sin Base de Datos)
// Basado en las diapositivas 652-752 de la Unidad 5 (Clase 10)
// ─────────────────────────────────────────────────────────────

test("POST /solicitudes sin token devuelve 401", async () => {
  const respuesta = await request(app)
    .post("/solicitudes")
    .send({ observaciones: "Postulación de prueba" })
    .expect(401)
    .expect("Content-Type", /json/);

  assert.deepEqual(respuesta.body, {
    mensaje: "Se requiere un token de acceso."
  });
});

test("POST /solicitudes con cabecera mal formada devuelve 400", async () => {
  await request(app)
    .post("/solicitudes")
    .set("Authorization", "Basic abc")
    .send({ observaciones: "Postulación de prueba" })
    .expect("Content-Type", /json/)
    .expect(400, {
      mensaje: "Usar Authorization: Bearer <token>."
    });
});

test("POST /solicitudes con token inválido devuelve 401", async () => {
  await request(app)
    .post("/solicitudes")
    .set("Authorization", "Bearer token-invalido")
    .send({ observaciones: "Postulación de prueba" })
    .expect("Content-Type", /json/)
    .expect(401, {
      mensaje: "Token inválido, vencido o revocado."
    });
});

test("GET /solicitudes/me sin token devuelve 401", async () => {
  const respuesta = await request(app)
    .get("/solicitudes/me")
    .expect(401)
    .expect("Content-Type", /json/);

  assert.deepEqual(respuesta.body, {
    mensaje: "Se requiere un token de acceso."
  });
});

test("GET /artesanos/me sin token devuelve 401", async () => {
  const respuesta = await request(app)
    .get("/artesanos/me")
    .expect(401)
    .expect("Content-Type", /json/);

  assert.deepEqual(respuesta.body, {
    mensaje: "Se requiere un token de acceso."
  });
});

