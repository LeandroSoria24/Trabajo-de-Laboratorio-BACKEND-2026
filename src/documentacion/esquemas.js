import { z } from "zod";
import {
  registrarUsuarioSchema,
  iniciarSesionSchema,
} from "../validators/usuario.schemas.js";
import {
  asignarAdministradorSchema,
} from "../validators/roles.schemas.js";
import {
  actualizarActivoSchema,
} from "../validators/estado.schemas.js";
import {
  completarPerfilArtesanoSchema,
  actualizarMiPerfilArtesanoSchema,
  crearArtesanoSchema,
  actualizarArtesanoSchema,
} from "../validators/artesano.schemas.js";
import {
  crearProductoSchema,
  actualizarProductoSchema,
} from "../validators/producto.schemas.js";
import {
  crearStandSchema,
  actualizarStandSchema,
  asignarArtesanoSchema,
} from "../validators/stand.schemas.js";
import {
  crearPabellonSchema,
  actualizarPabellonSchema,
} from "../validators/pabellon.schemas.js";
import {
  crearSectorSchema,
  actualizarSectorSchema,
} from "../validators/sector.schemas.js";
import {
  crearSolicitudSchema,
  evaluarSolicitudSchema,
  asignarStandSolicitudSchema,
} from "../validators/solicitud.schemas.js";

// ───────────────────────────────────────────────────────────
// 1. ESQUEMAS GENERALES Y ERRORES
// ───────────────────────────────────────────────────────────

export const ErrorApi = {
  type: "object",
  required: ["error"],
  properties: {
    error: { type: "string" },
  },
  example: {
    error: "Mensaje descriptivo del error.",
  },
};

export const PaginacionRespuesta = {
  type: "object",
  required: ["pagina", "limite", "total", "totalPaginas"],
  properties: {
    pagina: { type: "integer", example: 1 },
    limite: { type: "integer", example: 10 },
    total: { type: "integer", example: 45 },
    totalPaginas: { type: "integer", example: 5 },
  },
};

// ───────────────────────────────────────────────────────────
// 2. MÓDULO: USUARIOS Y AUTENTICACIÓN
// ───────────────────────────────────────────────────────────

export const RegistroUsuario = {
  ...z.toJSONSchema(registrarUsuarioSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    nombre: "Juan Pérez",
    email: "juanperez@correo.com",
    password: "Password123#",
  },
};

export const LoginUsuario = {
  ...z.toJSONSchema(iniciarSesionSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    email: "admin@ponchodigital.gob.ar",
    password: "Admin1234#",
  },
};

export const UsuarioRespuesta = {
  type: "object",
  required: ["id", "nombre", "email", "activo", "roles"],
  properties: {
    id: { type: "string", format: "uuid" },
    nombre: { type: "string" },
    email: { type: "string", format: "email" },
    activo: { type: "boolean" },
    roles: {
      type: "array",
      items: { type: "string" },
    },
  },
  example: {
    id: "39353b0a-26f7-44a8-b148-63500c4e4cbe",
    nombre: "Administrador Poncho",
    email: "admin@ponchodigital.gob.ar",
    activo: true,
    roles: ["ADMINISTRADOR"],
  },
};

export const LoginRespuesta = {
  type: "object",
  required: ["token", "usuario"],
  properties: {
    token: { type: "string" },
    usuario: { $ref: "#/components/schemas/UsuarioRespuesta" },
  },
  example: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    usuario: {
      id: "39353b0a-26f7-44a8-b148-63500c4e4cbe",
      nombre: "Administrador Poncho",
      email: "admin@ponchodigital.gob.ar",
      activo: true,
      roles: ["ADMINISTRADOR"],
    },
  },
};

export const AsignarAdminBody = {
  ...z.toJSONSchema(asignarAdministradorSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    rol: "ADMINISTRADOR",
  },
};

export const ActualizarActivoBody = {
  ...z.toJSONSchema(actualizarActivoSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    activo: true,
  },
};

// ───────────────────────────────────────────────────────────
// 3. MÓDULO: ARTESANOS
// ───────────────────────────────────────────────────────────

export const CompletarPerfilArtesano = {
  ...z.toJSONSchema(completarPerfilArtesanoSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    nombre: "Juan Carlos",
    apellido: "Páez",
    dni: "28123456",
    telefono: "+54 3835 420111",
    localidadId: 3,
    rubro: "Textil (Poncho y Telar)",
    nombreEmprendimiento: "Tejidos El Belicho",
    descripcionTrayectoria: "Maestro artesano telerero de Belén, tercera generación tejiendo ponchos en telar criollo.",
  },
};

export const ActualizarMiPerfilArtesano = {
  ...z.toJSONSchema(actualizarMiPerfilArtesanoSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    telefono: "+54 3835 999888",
    nombreEmprendimiento: "Tejidos Tradicionales El Belicho",
  },
};

export const CrearArtesanoAdmin = {
  ...z.toJSONSchema(crearArtesanoSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    nombre: "María Rosa",
    apellido: "Gutiérrez",
    dni: "30987654",
    email: "maria.ceramica@ponchodigital.gob.ar",
    telefono: "+54 3838 421234",
    localidadId: 5,
    rubro: "Cerámica y Alfarería",
    nombreEmprendimiento: "Alfarería Santa María",
    descripcionTrayectoria: "Alfarera especializada en piezas ceremoniales y decorativas.",
    usuarioId: "181298ce-dc08-4567-bbb8-894a7098d028",
    activo: false,
  },
};

export const ActualizarArtesanoAdmin = {
  ...z.toJSONSchema(actualizarArtesanoSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    nombreEmprendimiento: "Alfarería Santamariana",
    rubro: "Cerámica Arqueológica",
  },
};

export const ArtesanoRespuesta = {
  type: "object",
  required: [
    "id",
    "usuarioId",
    "nombre",
    "apellido",
    "dni",
    "email",
    "localidadId",
    "rubro",
    "nombreEmprendimiento",
    "activo",
  ],
  properties: {
    id: { type: "integer" },
    usuarioId: { type: "string", format: "uuid" },
    nombre: { type: "string" },
    apellido: { type: "string" },
    dni: { type: "string" },
    email: { type: "string", format: "email" },
    telefono: { type: "string", nullable: true },
    localidadId: { type: "integer" },
    rubro: { type: "string" },
    nombreEmprendimiento: { type: "string" },
    descripcionTrayectoria: { type: "string", nullable: true },
    activo: { type: "boolean" },
  },
  example: {
    id: 1,
    usuarioId: "0d162195-6cb4-4add-a30e-0986c8d4ad28",
    nombre: "Juan Carlos",
    apellido: "Páez",
    dni: "28123456",
    email: "artesano_demo@ponchodigital.gob.ar",
    telefono: "+54 3835 420111",
    localidadId: 3,
    rubro: "Textil (Poncho y Telar)",
    nombreEmprendimiento: "Tejidos El Belicho",
    descripcionTrayectoria: "Maestro artesano telerero.",
    activo: true,
  },
};

export const ListadoArtesanos = {
  type: "object",
  required: ["artesanos", "paginacion"],
  properties: {
    artesanos: {
      type: "array",
      items: { $ref: "#/components/schemas/ArtesanoRespuesta" },
    },
    paginacion: { $ref: "#/components/schemas/PaginacionRespuesta" },
  },
};

// ───────────────────────────────────────────────────────────
// 4. MÓDULO: PRODUCTOS
// ───────────────────────────────────────────────────────────

export const NuevoProducto = {
  ...z.toJSONSchema(crearProductoSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    nombre: "Poncho de Vicuña Guarda Atada",
    descripcion: "Poncho artesanal hilado fino en telar criollo con tintes naturales.",
    precio: 250000,
    stock: 3,
    artesanoId: 1,
  },
};

export const ActualizarProducto = {
  ...z.toJSONSchema(actualizarProductoSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    nombre: "Poncho de Vicuña Fino",
    descripcion: "Edición especial con tintes naturales y flecos criollos.",
    precio: 260000,
    stock: 2,
  },
};

export const ProductoRespuesta = {
  type: "object",
  required: ["id", "nombre", "precio", "stock", "activo", "artesanoId"],
  properties: {
    id: { type: "integer" },
    nombre: { type: "string" },
    descripcion: { type: "string", nullable: true },
    precio: { type: "number" },
    stock: { type: "integer" },
    activo: { type: "boolean" },
    artesanoId: { type: "integer" },
  },
  example: {
    id: 1,
    nombre: "Poncho de Vicuña Guarda Atada",
    descripcion: "Poncho artesanal hilado fino en telar criollo con tintes naturales.",
    precio: 250000,
    stock: 3,
    activo: true,
    artesanoId: 1,
  },
};

export const ListadoProductos = {
  type: "object",
  required: ["productos", "paginacion"],
  properties: {
    productos: {
      type: "array",
      items: { $ref: "#/components/schemas/ProductoRespuesta" },
    },
    paginacion: { $ref: "#/components/schemas/PaginacionRespuesta" },
  },
};

// ───────────────────────────────────────────────────────────
// 5. MÓDULO: STANDS
// ───────────────────────────────────────────────────────────

export const NuevoStand = {
  ...z.toJSONSchema(crearStandSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    codigo: "PZ-A05",
    numero: 5,
    pabellonId: 1,
    sectorId: 1,
    estado: "DISPONIBLE",
  },
};

export const ActualizarStand = {
  ...z.toJSONSchema(actualizarStandSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    codigo: "PZ-A05-BIS",
    numero: 6,
    estado: "MANTENIMIENTO",
  },
};

export const AsignarArtesanoStand = {
  ...z.toJSONSchema(asignarArtesanoSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    artesanoId: 1,
  },
};

export const StandRespuesta = {
  type: "object",
  required: ["id", "codigo", "estado", "pabellonId", "sectorId"],
  properties: {
    id: { type: "integer" },
    codigo: { type: "string" },
    numero: { type: "integer", nullable: true },
    estado: {
      type: "string",
      enum: ["DISPONIBLE", "OCUPADO", "MANTENIMIENTO"],
    },
    pabellonId: { type: "integer" },
    sectorId: { type: "integer" },
    artesanoId: { type: "integer", nullable: true },
  },
  example: {
    id: 1,
    codigo: "PZ-A01",
    numero: 1,
    estado: "OCUPADO",
    pabellonId: 1,
    sectorId: 1,
    artesanoId: 1,
  },
};

export const ListadoStands = {
  type: "object",
  required: ["stands", "paginacion"],
  properties: {
    stands: {
      type: "array",
      items: { $ref: "#/components/schemas/StandRespuesta" },
    },
    paginacion: { $ref: "#/components/schemas/PaginacionRespuesta" },
  },
};

// ───────────────────────────────────────────────────────────
// 6. MÓDULO: PABELLONES Y SECTORES
// ───────────────────────────────────────────────────────────

export const NuevoPabellon = {
  ...z.toJSONSchema(crearPabellonSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    nombre: "Pabellón de Diseño e Innovación",
  },
};

export const ActualizarPabellon = {
  ...z.toJSONSchema(actualizarPabellonSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    nombre: "Pabellón de Diseño Regional",
  },
};

export const PabellonRespuesta = {
  type: "object",
  required: ["id", "nombre"],
  properties: {
    id: { type: "integer" },
    nombre: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
  },
  example: {
    id: 1,
    nombre: "Pabellón Peregrina Zárate",
    createdAt: "2026-10-22T21:44:03.327Z",
  },
};

export const NuevoSector = {
  ...z.toJSONSchema(crearSectorSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    nombre: "Sector Joyería y Filigrana",
  },
};

export const ActualizarSector = {
  ...z.toJSONSchema(actualizarSectorSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    nombre: "Sector Filigrana y Metales Nobles",
  },
};

export const SectorRespuesta = {
  type: "object",
  required: ["id", "nombre"],
  properties: {
    id: { type: "integer" },
    nombre: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
  },
  example: {
    id: 1,
    nombre: "Sector Textil Tradicional",
    createdAt: "2026-10-22T21:44:22.490Z",
  },
};

// ───────────────────────────────────────────────────────────
// 7. MÓDULO: LOCALIDADES
// ───────────────────────────────────────────────────────────

export const LocalidadRespuesta = {
  type: "object",
  required: ["id", "nombre", "provincia"],
  properties: {
    id: { type: "integer" },
    nombre: { type: "string" },
    provincia: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
  },
  example: {
    id: 3,
    nombre: "Belén",
    provincia: "Catamarca",
    createdAt: "2026-10-02T01:01:08.026Z",
  },
};

// ───────────────────────────────────────────────────────────
// 8. MÓDULO: SOLICITUDES DE POSTULACIÓN
// ───────────────────────────────────────────────────────────

export const NuevaSolicitud = {
  ...z.toJSONSchema(crearSolicitudSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    observaciones: "Postulación para stand individual en el pabellón textil tradicional.",
  },
};

export const EvaluarSolicitud = {
  ...z.toJSONSchema(evaluarSolicitudSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    estado: "APROBADA",
    observaciones: "Cumple con todos los estándares y trayectoria ferial requerida.",
  },
};

export const AsignarStandSolicitud = {
  ...z.toJSONSchema(asignarStandSolicitudSchema, {
    target: "openapi-3.0",
    io: "input",
  }),
  example: {
    standId: 1,
  },
};

export const SolicitudRespuesta = {
  type: "object",
  required: ["id", "artesanoId", "estado", "fechaPresentacion"],
  properties: {
    id: { type: "integer" },
    artesanoId: { type: "integer" },
    standId: { type: "integer", nullable: true },
    evaluadorId: { type: "string", format: "uuid", nullable: true },
    estado: {
      type: "string",
      enum: ["PENDIENTE", "EN_REVISION", "APROBADA", "RECHAZADA", "CANCELADA"],
    },
    observaciones: { type: "string", nullable: true },
    fechaPresentacion: { type: "string", format: "date-time" },
  },
  example: {
    id: 1,
    artesanoId: 1,
    standId: 1,
    evaluadorId: "39353b0a-26f7-44a8-b148-63500c4e4cbe",
    estado: "APROBADA",
    observaciones: "Aprobada por el comité de selección.",
    fechaPresentacion: "2026-10-22T21:45:00.000Z",
  },
};

export const ListadoSolicitudes = {
  type: "object",
  required: ["solicitudes", "paginacion"],
  properties: {
    solicitudes: {
      type: "array",
      items: { $ref: "#/components/schemas/SolicitudRespuesta" },
    },
    paginacion: { $ref: "#/components/schemas/PaginacionRespuesta" },
  },
};
