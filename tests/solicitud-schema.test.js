import test from "node:test";
import assert from "node:assert/strict";
import {
  crearSolicitudSchema,
  evaluarSolicitudSchema,
  asignarStandSolicitudSchema
} from "../src/validators/solicitud.schemas.js";
import { crearProductoSchema } from "../src/validators/producto.schemas.js";

// ─────────────────────────────────────────────────────────────
// CASOS DE PRUEBA UNITARIOS PARA ESQUEMAS ZOD (safeParse)
// Basado en las diapositivas de la Unidad 5 (Clase 10)
// ─────────────────────────────────────────────────────────────

const casosSolicitud = [
  ["objeto vacío válido (observaciones es opcional)", {}, true],
  ["observaciones válidas como texto", { observaciones: "Solicitud para el stand textil" }, true],
  ["observaciones como null", { observaciones: null }, true],
  ["campo adicional no permitido (rechazo por .strict())", { observaciones: "Test", campoInvalido: 123 }, false],
  ["campo adicional 'artesanoId' rechazado por el servidor (.strict())", { observaciones: "Test", artesanoId: 10 }, false],
  ["observaciones con tipo numérico inválido", { observaciones: 12345 }, false],
];

for (const [nombre, entrada, valido] of casosSolicitud) {
  test(`Esquema crearSolicitudSchema: ${nombre}`, () => {
    const resultado = crearSolicitudSchema.safeParse(entrada);
    assert.equal(resultado.success, valido);
  });
}

const casosEvaluarSolicitud = [
  ["estado APROBADA válido", { estado: "APROBADA" }, true],
  ["estado RECHAZADA válido con observaciones", { estado: "RECHAZADA", observaciones: "Falta documentación" }, true],
  ["estado vacío inválido", {}, false],
  ["estado no permitido en enum", { estado: "PENDIENTE" }, false],
  ["campo adicional no permitido (.strict())", { estado: "APROBADA", evaluadorId: 99 }, false],
];

for (const [nombre, entrada, valido] of casosEvaluarSolicitud) {
  test(`Esquema evaluarSolicitudSchema: ${nombre}`, () => {
    const resultado = evaluarSolicitudSchema.safeParse(entrada);
    assert.equal(resultado.success, valido);
  });
}

const casosAsignarStand = [
  ["objeto vacío válido (standId es opcional)", {}, true],
  ["standId numérico positivo válido", { standId: 5 }, true],
  ["standId numérico string válido (coerce)", { standId: "12" }, true],
  ["standId cero rechazado (debe ser positivo)", { standId: 0 }, false],
  ["standId negativo rechazado", { standId: -3 }, false],
  ["standId decimal rechazado (debe ser entero)", { standId: 2.5 }, false],
  ["standId alfanumérico inválido", { standId: "invalido" }, false],
  ["campo adicional no permitido (.strict())", { standId: 5, campoInvalido: true }, false],
];

for (const [nombre, entrada, valido] of casosAsignarStand) {
  test(`Esquema asignarStandSolicitudSchema: ${nombre}`, () => {
    const resultado = asignarStandSolicitudSchema.safeParse(entrada);
    assert.equal(resultado.success, valido);
  });
}

const casosProducto = [
  ["producto completo válido", { nombre: "Poncho de Vicuña", precio: 150000, artesanoId: 1, stock: 5 }, true],
  ["precio cero rechazado (debe ser positive)", { nombre: "Poncho", precio: 0, artesanoId: 1 }, false],
  ["precio negativo rechazado", { nombre: "Poncho", precio: -500, artesanoId: 1 }, false],
  ["precio ausente rechazado", { nombre: "Poncho", artesanoId: 1 }, false],
  ["nombre vacío rechazado", { nombre: "   ", precio: 1000, artesanoId: 1 }, false],
  ["stock decimal rechazado (debe ser entero)", { nombre: "Poncho", precio: 1000, stock: 2.5, artesanoId: 1 }, false],
  ["stock negativo rechazado", { nombre: "Poncho", precio: 1000, stock: -1, artesanoId: 1 }, false],
  ["artesanoId ausente rechazado", { nombre: "Poncho", precio: 1000 }, false],
  ["artesanoId cero rechazado (debe ser positive)", { nombre: "Poncho", precio: 1000, artesanoId: 0 }, false],
];

for (const [nombre, entrada, valido] of casosProducto) {
  test(`Esquema crearProductoSchema: ${nombre}`, () => {
    const resultado = crearProductoSchema.safeParse(entrada);
    assert.equal(resultado.success, valido);
  });
}

