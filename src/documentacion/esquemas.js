import { z } from "zod";
import { solicitudSchema } from
"../validators/solicitud.schemas.js";export const crearSolicitudEsquema = {
  ...z.toJSONSchema(solicitudSchema, {
    target: "openapi-3.0",
    io: "input"
  }),
  example: {
    codigo: "2025-A-001",
    numero: 1,
    anio: 2025,
    estado: "pendiente",
    fecha: "2025-10-27T10:00:00.000Z",
    tipoServicioId: 1,
    tipoEspacioId: 1,
    unidadId: 10
  }
};  



export const NuevaInscripcion = {
...z.toJSONSchema(solicitudSchema, {
target: "openapi-3.0",
io: "input"
}),
example: { eventoId: 12 }
};

export const ErrorApi = {
type: "object",
required: ["mensaje"],
properties: {
mensaje: { type: "string" }
}
};

export const InscripcionCreada = {
type: "object", required: ["id", "fecha", "estado", "evento"],
properties: {
id: { type: "integer" }, fecha: { type: "string", format: "date-time" },
estado: { type: "string", enum: ["CONFIRMADA"] },
evento: { type: "object", required: ["id", "nombre", "fecha"],
properties: { id: { type: "integer" }, nombre: { type: "string" },
fecha: { type: "string", format: "date-time" } }
}
},
example: { id: 1, fecha: "2026-10-20T12:00:00.000Z", estado: "CONFIRMADA",
evento: { id: 12, nombre: "Taller de Node.js", fecha: "2026-11-01T18:00:00.000Z" }
}
}