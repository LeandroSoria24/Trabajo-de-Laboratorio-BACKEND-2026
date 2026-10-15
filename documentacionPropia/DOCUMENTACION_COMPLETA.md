# Poncho Digital — Documentación Técnica Integral y Manual de Arquitectura
### Plataforma de Gestión y Difusión de la Fiesta Nacional e Internacional del Poncho (Catamarca)

**Cátedra:** Desarrollo Backend  
**Carrera:** Tecnicatura Universitaria en Diseño de Software  
**Institución:** Facultad de Tecnología y Ciencias Aplicadas — Universidad Nacional de Catamarca (UNCa)  

**Integrantes:**
* **Leandro Soria Rosales** — M.U. N° 00292
* **Santiago Ortiz** — M.U. N° 00451

**Stack Tecnológico:** Node.js, Express 5, Prisma ORM 7, PostgreSQL (Supabase), Bcrypt, JSON Web Tokens (jsonwebtoken), Zod 4.

---

## Índice General de la Documentación Unificada

1. [Parte 1: Arquitectura por Capas — API Poncho Digital](#parte-1-arquitectura-por-capas--api-poncho-digital)
2. [Parte 2: Estructura del Esquema de Base de Datos](#parte-2-estructura-del-esquema-de-base-de-datos)
3. [Parte 3: Guía Completa de Prisma ORM (v7) + PostgreSQL](#parte-3-guía-completa-de-prisma-orm-v7--postgresql)
4. [Parte 4: Métodos de Consulta y Operaciones CRUD en Prisma ORM](#parte-4-métodos-de-consulta-y-operaciones-crud-en-prisma-orm)
5. [Parte 5: Guía Completa: Zod — Validación de Datos en JavaScript](#parte-5-guía-completa-zod--validación-de-datos-en-javascript)
6. [Parte 6: Guía Detallada: Middlewares y Utilidades](#parte-6-guía-detallada-middlewares-y-utilidades)
7. [Parte 7: Flujo de Ejecución y Manejo de Errores en Express](#parte-7-flujo-de-ejecución-y-manejo-de-errores-en-express)

---


# Parte 1: Arquitectura por Capas — API Poncho Digital

# Arquitectura por Capas — API Poncho Digital
### Fiesta Nacional e Internacional del Poncho (Catamarca)
**Cátedra:** Desarrollo Backend — **Carrera:** Tecnicatura Universitaria en Diseño de Software (UNCa)

Este documento explica la organización modular en capas del proyecto, qué responsabilidad asume cada una, qué reglas de negocio maneja y cómo interactúan los componentes para cumplir los estándares de la cátedra.

---

## Índice
1. [¿Qué es una Arquitectura por Capas?](#qué-es-una-arquitectura-por-capas)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Capa 1: Punto de Entrada (`app.js`)](#capa-1-punto-de-entrada-appjs)
4. [Capa 2: Rutas (`routes/`)](#capa-2-rutas-routes)
5. [Capa 3: Middlewares (`middlewares/`)](#capa-3-middlewares-middlewares)
6. [Capa 4: Validadores (`validators/`)](#capa-4-validadores-validators)
7. [Capa 5: Controladores (`controllers/`)](#capa-5-controladores-controllers)
8. [Capa 6: Servicios (`services/`)](#capa-6-servicios-services)
9. [Capa 7: Acceso a Datos — Prisma ORM (`config/`, `prisma/`)](#capa-7-acceso-a-datos--prisma-orm)
10. [Capa Transversal: Utilidades (`utils/`)](#capa-transversal-utilidades-utils)
11. [Flujo Completo de una Petición](#flujo-completo-de-una-petición)
12. [Reglas de Negocio por Entidad](#reglas-de-negocio-por-entidad)
13. [Mapeo y Correspondencia: Cátedra UNCa (Unidad 4) vs Poncho Digital](#mapeo-y-correspondencia-cátedra-unca-unidad-4-vs-poncho-digital)
14. [Tabla Resumen: Quién Hace Qué](#tabla-resumen-quién-hace-qué)
15. [Diagrama de Dependencias entre Capas](#diagrama-de-dependencias-entre-capas)

---

## ¿Qué es una Arquitectura por Capas?

Es un patrón de diseño que divide el software en niveles jerárquicos donde **cada capa tiene una responsabilidad única y bien delimitada**:

* La capa HTTP no conoce detalles de la base de datos.
* La capa de persistencia no depende de Express ni de `req`/`res`.
* La validación de entrada ocurre antes de que el controlador comience a procesar la solicitud.

---

## Estructura del Proyecto

```text
src/
├── app.js                              ← Punto de entrada (Express, middlewares globales, rutas e inicio de daemons)
│
├── routes/                             ← Capa de Enrutamiento (define endpoints, autorizaciones y validaciones)
│   ├── artesano.routes.js              ← Perfil /me (artesano), catálogo público y administración
│   ├── producto.routes.js              ← Catálogo público y gestión con filtro de propiedad
│   ├── stand.routes.js                 ← Catálogo ferial público y administración de stands 1:1
│   ├── pabellon.routes.js              ← Consulta pública y gestión de pabellones feriales
│   ├── sector.routes.js                ← Consulta pública y gestión de sectores feriales
│   ├── localidad.routes.js             ← Consulta de localidades de Catamarca
│   ├── solicitud.routes.js             ← Postulaciones de artesanos, dictamen y asignación de stands
│   └── usuario.routes.js               ← Registro (rol ARTESANO), login, /me, roles y control de cuentas activas
│
├── middlewares/                         ← Capa de Middlewares (filtros de seguridad y ciclo de vida)
│   ├── logger.js                       ← Monitoreo de tiempos de respuesta y estado HTTP
│   ├── autenticarUsuario.js            ← Verificación de Bearer JWT y consulta de lista negra (revocaciones)
│   ├── autorizacion.js                 ← Contexto de usuario (`cargarContextoUsuario`) y RBAC (`autorizarRoles`)
│   ├── manejoErrores.js                ← Mapeo canónico de errores de Prisma (404/409) y respuesta JSON homogénea
│   ├── rutaNoEncontrada.js             ← Captura de 404
│   └── validarSchema.js                ← Fábrica universal de validación Zod (body, params, query)
│
├── validators/                         ← Capa de Esquemas de Validación (Zod 4)
│   ├── comun.schemas.js                ← Esquemas compartidos (validación de :id numérico y :id UUID)
│   ├── artesano.schemas.js             ← Validación de alta, edición y filtros de artesanos
│   ├── producto.schemas.js             ← Validación de productos y catálogo
│   ├── stand.schemas.js                ← Validación de stands y asignación ferial
│   ├── pabellon.schemas.js             ← Validación de pabellones
│   ├── sector.schemas.js               ← Validación de sectores
│   ├── localidad.schemas.js            ← Validación de localidades
│   ├── solicitud.schemas.js            ← Validación de postulación ferial, evaluación y stands
│   ├── roles.schemas.js                ← Validación de asignación y retiro de roles
│   ├── estado.schemas.js               ← Validación de cambio de estado activo
│   └── usuario.schemas.js              ← Validación de registro y login
│
├── controllers/                        ← Capa de Controladores (gestión HTTP y delegación DTO)
│   ├── artesano.controllers.js
│   ├── producto.controllers.js
│   ├── stand.controllers.js
│   ├── pabellon.controllers.js
│   ├── sector.controllers.js
│   ├── localidad.controllers.js
│   ├── solicitud.controllers.js
│   ├── roles.controllers.js
│   ├── estado.controllers.js
│   ├── sesiones.controllers.js         ← Cierre de sesión y revocación de JWT
│   └── usuario.controllers.js          ← Registro, login con emisión de JWT y perfil (/me)
│
├── services/                           ← Capa de Servicios (lógica de negocio y persistencia con Prisma)
│   ├── artesano.services.js            ← Gestión de perfil, moderación y soft delete
│   ├── producto.services.js            ← CRUD de productos con control de stock y propiedad
│   ├── stand.services.js               ← Asignación atómica 1:1 y liberación de stands
│   ├── pabellon.services.js            ← Mantenimiento de pabellones
│   ├── sector.services.js              ← Mantenimiento de sectores
│   ├── localidad.services.js           ← Catálogo de localidades
│   ├── solicitud.services.js           ← Circuito de postulación, evaluación y asignación
│   ├── roles.services.js               ← Asignación y retiro seguro de roles (RBAC)
│   ├── estado.services.js              ← Activación/desactivación de cuentas (regla de admin activo)
│   ├── usuario.services.js             ← Registro, verificación bcrypt y contexto de cuenta
│   ├── token.services.js               ← Emisión HS256 (15m, JTI) y validación de claims con Zod
│   └── revocaciones.services.js        ← Comprobación, inserción y purga de tokens revocados
│
├── tareas/                             ← Tareas Programadas y Asíncronas en Segundo Plano
│   └── limpiezaRevocaciones.js         ← Purga periódica por hora de tokens expirados en la BD
│
├── config/                             ← Capa de Configuración
│   ├── prisma.js                       ← Instancia singleton de Prisma Client con adapter-pg
│   └── jwt.js                          ← Carga y validación estricta de variable JWT_SECRET
│
├── utils/                              ← Utilidades transversales
│   ├── crearError.js                   ← Fábrica de errores HTTP con status y details
│   └── ErroresZod.js                   ← Formateador estructurado de errores Zod { path, message }
│
└── generated/prisma/                   ← Cliente generado por Prisma ORM
```

---

## Capa 1: Punto de Entrada (`app.js`)

**Archivo:** `src/app.js`  
**Responsabilidad:** Configurar Express, registrar middlewares globales, montar los enrutadores principales e inicializar servicios en segundo plano y configuraciones críticas:

```javascript
import "./config/jwt.js"; // Valida presencia de JWT_SECRET en el entorno
import { iniciarLimpiezaRevocaciones } from "./tareas/limpiezaRevocaciones.js";

// Montaje de rutas
app.use('/artesanos',   artesanosRoutes);
app.use('/productos',   productosRoutes);
app.use('/usuarios',    usuariosRoutes);
app.use('/stands',      standsRoutes);
app.use('/pabellones',  pabellonesRoutes);
app.use('/sectores',    sectoresRoutes);
app.use('/localidades', localidadesRoutes);
app.use('/solicitudes', solicitudesRoutes);

app.use(rutaNoEncontrada);
app.use(manejoErrores);

app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
    iniciarLimpiezaRevocaciones(); // Inicia daemon de purga periódica de tokens
});
```

---

## Capa 2: Rutas (`routes/`)

**Archivos:** `src/routes/artesano.routes.js`, `src/routes/producto.routes.js`, `src/routes/usuario.routes.js`  
**Responsabilidad:** Declarar los endpoints y establecer el orden de ejecución:
1. Validaciones previas con `validarSchema` (`query`, `params`, `body`).
2. Middlewares de seguridad y sesión (`autenticarUsuario`).
3. Controlador final.

```javascript
// Rutas de productos:
router.get('/', validarSchema(obtenerProductosSchema, 'query'), getProductos);
router.get('/:id', validarSchema(idParamSchema, 'params'), getProductoPorId);
router.post('/', validarSchema(crearProductoSchema, 'body'), createProducto);
router.put('/:id', validarSchema(idParamSchema, 'params'), validarSchema(actualizarProductoSchema, 'body'), updateProducto);
router.delete('/:id', validarSchema(idParamSchema, 'params'), deleteProducto);
router.patch('/:id', validarSchema(idParamSchema, 'params'), deleteProductoLogico);

// Rutas de autenticación y usuarios:
router.post("/registro", validarSchema(registrarUsuarioSchema, 'body'), postUsuario);
router.post("/login", validarSchema(iniciarSesionSchema, 'body'), iniciarSesion);
router.get("/me", autenticarUsuario, obtenerMiPerfil);
router.post("/logout", autenticarUsuario, cerrarSesion);
```

---

## Capa 3: Middlewares (`middlewares/`)

**Responsabilidad:** Interceptar y procesar la petición antes o después de los controladores.

* **`logger.js`**: Mide con precisión milisegundos y status HTTP al completarse la respuesta (`res.on('finish')`).
* **`validarSchema.js`**: Middleware fábrica universal de validación. Recibe el esquema Zod y el origen (`body`, `params`, `query`), aplica `safeParse()`, sanitiza y limpia los datos en `req[origen]`. Si hay fallos, delega a `detallarErroresZod` y `crearError(400)`.
* **`autenticarUsuario.js`**: Middleware de autenticación y seguridad mediante tokens JWT según estándar **RFC 6750**:
  - Extrae y valida el encabezado `Authorization: Bearer <token>`.
  - Verifica la firma criptográfica y expiración usando `verificarToken()`.
  - Consulta en base de datos si el identificador único `jti` está en la lista negra (`tokenEstaRevocado()`).
  - Emite cabeceras de respuesta `WWW-Authenticate` con diagnósticos ante fallos (`Bearer`, `error="invalid_request"`, `error="invalid_token"`).
  - Inyecta la identidad decodificada en `req.usuario = { id, jti, exp }` para los siguientes controladores.
* **`rutaNoEncontrada.js`**: Captura URLs que no coincidan con ninguna ruta registrada y arroja 404.
* **`manejoErrores.js`**: Middleware final de 4 parámetros `(err, req, res, next)` que estandariza las respuestas de error en formato JSON homogéneo `{ error, details? }`.

---

## Capa 4: Validadores (`validators/`)

**Archivos:** `src/validators/comun.schemas.js`, `src/validators/producto.schemas.js`  
**Responsabilidad:** Declarar los contratos formales que debe cumplir el cuerpo de la petición, los parámetros de ruta y los query strings usando **Zod 4**.

```javascript
// comun.schemas.js
export const idParamSchema = z.object({ ... });

// producto.schemas.js
export const crearProductoSchema = z.object({ ... });
export const actualizarProductoSchema = z.object({ ... });
export const obtenerProductosSchema = z.object({ ... });
```

---

## Capa 5: Controladores (`controllers/`)

**Archivos:** `src/controllers/artesano.controllers.js`, `src/controllers/producto.controllers.js`, `src/controllers/usuario.controllers.js`, `src/controllers/sesiones.controllers.js`  
**Responsabilidad:** Coordinar el flujo HTTP.
* Recibe los datos validados desde `req.body` como un **DTO** o el `id` desde `req.params`.
* Invoca a la capa de servicios:
  ```javascript
  // Creación de producto
  const crearProductoDto = req.body;
  const nuevoProducto = await crearProducto(crearProductoDto);
  return res.status(201).json(nuevoProducto);

  // Inicio de sesión y emisión de JWT:
  const usuario = await loginService(req.body);
  const token = generarToken(usuario);
  return res.status(200).json({ mensaje: "Inicio de sesión exitoso.", token, usuario });

  // Perfil autenticado (/me):
  const usuario = await obtenerUsuarioPorId(req.usuario.id);
  return res.status(200).json({ usuario });

  // Cierre de sesión (/logout):
  await revocarToken(req.usuario);
  return res.status(204).end();
  ```
* En caso de error, el bloque `try/catch` lo remite a `next(error)`.

---

## Capa 6: Servicios (`services/`)

**Archivos:** `src/services/producto.services.js`, `src/services/usuario.services.js`, `src/services/token.services.js`, `src/services/revocaciones.services.js`  
**Responsabilidad:** Contener la lógica de negocio, seguridad criptográfica y comunicarse directamente con Prisma Client.

* **Desacoplado de Express:** No recibe `req`, `res` ni `next`. Trabaja únicamente con tipos primitivos y DTOs planos. Si ocurre un fallo de negocio, lanza excepciones mediante `throw crearError(...)` que el controlador captura en su bloque `catch`.
* **Reglas de negocio y persistencia limpia:**
  - `producto.services.js`: comprueba existencia de artesanos, alta, modificación, bajas físicas (`delete`) y lógicas (`update activo: false`).
  - `usuario.services.js`: registra cuentas con hash Bcrypt (cost 10), valida login y provee `obtenerUsuarioPorId` con proyección segura (`select: { id, nombre, email }`).
  - `token.services.js`:
    - `generarToken`: emite un JWT firmado con HS256, expiración a 15 minutos (`expiresIn: "15m"`), subject `sub: usuario.id` y `jti: randomUUID()`.
    - `verificarToken`: verifica firma contra `secretoJWT`, algoritmos permitidos, y valida defensivamente los claims con **Zod** (`z.uuid().safeParse(payload.sub)` y `payload.jti`).
  - `revocaciones.services.js`:
    - `tokenEstaRevocado(jti)`: comprueba existencia del token en la tabla `TokenRevocado`.
    - `revocarToken({ jti, exp })`: almacena el `jti` y su fecha de expiración usando `prisma.tokenRevocado.upsert`.
    - `eliminarRevocacionesVencidas()`: elimina masivamente registros cuyo `venceEn` sea menor o igual a la fecha actual (`deleteMany`).

---

## Capa 7: Acceso a Datos y Configuración (`config/`, `prisma/`)

**Archivos:** `src/config/prisma.js`, `src/config/jwt.js`, `prisma/schema.prisma`  
**Responsabilidad:** Definir las tablas relacionales en PostgreSQL, validar secretos del entorno y proveer el cliente singleton de consultas.

```prisma
model Usuario {
  id           String       @id @default(uuid()) @db.Uuid
  nombre       String
  email        String       @unique
  passwordHash String
  activo       Boolean      @default(true)
  artesano     Artesano?
  roles        UsuarioRol[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}

model Rol {
  id       Int          @id @default(autoincrement())
  nombre   String       @unique // "ADMINISTRADOR", "ARTESANO"
  usuarios UsuarioRol[]
}

model UsuarioRol {
  usuarioId String  @db.Uuid
  rolId     Int
  usuario   Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  rol       Rol     @relation(fields: [rolId], references: [id], onDelete: Restrict)

  @@id([usuarioId, rolId])
}

model Artesano {
  id                     Int        @id @default(autoincrement())
  usuarioId              String     @unique @db.Uuid
  usuario                Usuario    @relation(fields: [usuarioId], references: [id], onDelete: Restrict)
  localidadId            Int
  localidad              Localidad  @relation(fields: [localidadId], references: [id])
  nombre                 String
  apellido               String
  dni                    String     @unique
  email                  String     @unique
  activo                 Boolean    @default(false)
  email                  String     @unique
  telefono               String?
  nombreEmprendimiento   String
  rubro                  String
  descripcionTrayectoria String?    @db.Text
  activo                 Boolean    @default(true)
  productos              Producto[]
  stand                  Stand?
  createdAt              DateTime   @default(now())
  updatedAt              DateTime   @updatedAt
}

model Producto {
  id          Int      @id @default(autoincrement())
  artesanoId  Int
  artesano    Artesano @relation(fields: [artesanoId], references: [id], onDelete: Cascade)
  nombre      String
  descripcion String?  @db.Text
  precio      Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  activo      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([artesanoId])
}

model TokenRevocado {
  jti     String   @id
  venceEn DateTime

  @@index([venceEn])
}
```

---

## Capa 8: Tareas Programadas en Segundo Plano (`tareas/`)

**Archivo:** `src/tareas/limpiezaRevocaciones.js`  
**Responsabilidad:** Ejecutar procesos de mantenimiento en segundo plano sin bloquear el bucle de eventos de Node.js.
* **`iniciarLimpiezaRevocaciones()`**: Configura un bucle recurrente cada 1 hora (`60 * 60 * 1000` ms) utilizando `setTimeout(ejecutar, INTERVALO_MS).unref()`.
* Invoca `eliminarRevocacionesVencidas()` para purgar registros de la lista negra cuyos tokens ya hayan expirado naturalmente, evitando el crecimiento desmedido de la tabla `TokenRevocado`.

---

## Flujo Completo de una Petición

### Caso Exitoso: `POST /productos`

```text
Cliente envía POST /productos
{ "nombre": "Poncho de Vicuña", "precio": 180000, "artesanoId": 1 }
   │
   ▼
app.js (express.json() parsea body, logger inicia cronómetro)
   │
   ▼
producto.routes.js (router.post('/', validarProducto, createProducto))
   │
   ▼
validarProducto.js (Zod ejecuta safeParse: datos válidos)
   │  → Asigna req.body = resultado.data (DTO)
   ▼
producto.controllers.js (createProducto)
   │  → const crearProductoDto = req.body
   │  → Invoca: await crearProductoService(crearProductoDto)
   ▼
producto.services.js (crearProducto)
   │  → 1. ¿Existe artesanoId 1? Sí
   │  → 2. prisma.producto.create(...)
   ▼
Prisma ORM → PostgreSQL (Persiste en tabla "Producto")
   │
   ▼
Vuelta: BD → Prisma → Service → Controller
   │
   ▼
Controller responde: 201 Created con el objeto JSON creado
```

### Caso Error 1: Formato inválido (Rechazado en Middleware Zod)
```text
Body: { "nombre": "  ", "precio": -50 }
   │
   ▼
validarProducto.js (safeParse detecta fallos)
   │
   ▼
next(crearError("Error en el campo 'nombre'...", 400))
   │  (El controlador y el servicio NUNCA se ejecutan)
   ▼
manejoErrores.js responde: 400 Bad Request
```

### Caso Error 2: Regla de negocio rota (Rechazado en Servicio)
```text
Body: { "nombre": "Poncho", "precio": 1000, "artesanoId": 9999 }
   │
   ▼
validarProducto.js (Formato válido)
   │
   ▼
producto.controllers.js delega a producto.services.js
   │
   ▼
producto.services.js comprueba en BD: artesano 9999 NO existe
   │
   ▼
throw crearError("Artesano inexistente.", 400)
   │
   ▼
Controller captura en catch(error) y envía a next(error)
   │
   ▼
manejoErrores.js responde: 400 Bad Request ("Artesano inexistente.")
```

---

## Reglas de Negocio por Entidad

### Artesano
| Regla | Capa | Detalle |
|---|---|---|
| DNI único | `@unique` en Prisma | No puede haber dos artesanos con el mismo documento |
| Email único | `@unique` en Prisma | No puede haber dos artesanos con el mismo correo |
| Localidad existente | `services/artesano.services.js` | `localidadId` debe referenciar una `Localidad` registrada |
| Datos obligatorios | `validators/artesano.schemas.js` | nombre, apellido, dni, email, localidadId, rubro, nombreEmprendimiento |
| Soft delete | `services/artesano.services.js` | `DELETE /artesanos/:id` → `activo: false` (no se borra físicamente) |
| Filtro por activo | `services/artesano.services.js` | `GET /artesanos` filtra `activo: true` por defecto |

### Producto
| Regla | Capa | Detalle |
|---|---|---|
| Nombre obligatorio | `validators/producto.schemas.js` | Mínimo 1 carácter sin espacios en blanco |
| Precio positivo | `validators/producto.schemas.js` | Mayor a 0 |
| Stock no negativo | `validators/producto.schemas.js` | Mayor o igual a 0 |
| Artesano existente | `services/producto.services.js` | El producto debe vincularse a un artesano registrado |
| Eliminación en cascada | `prisma/schema.prisma` | `onDelete: Cascade` — si se elimina un artesano, sus productos se eliminan |
| Soft delete | `services/producto.services.js` | `DELETE /productos/:id` → baja lógica (`activo = false`) |

### Localidad
| Regla | Capa | Detalle |
|---|---|---|
| Nombre único | `@unique` en Prisma | No puede haber dos localidades con el mismo nombre |
| Provincia con default | `prisma/schema.prisma` | Por defecto `"Catamarca"` |

### Stand
| Regla | Capa | Detalle |
|---|---|---|
| Código único | `@unique` en Prisma | Identificador único del stand (ej. `STD-101`) |
| Asignación 1:1 | `artesanoId @unique` | Un artesano tiene como máximo un stand |
| Asignación atómica | `services/stand.services.js` | Usa `prisma.$transaction` para evitar race conditions |
| Stand disponible | `services/stand.services.js` | Solo se puede asignar un stand con `estado: DISPONIBLE` |
| Artesano sin stand | `services/stand.services.js` | El artesano no puede tener otro stand ya asignado |

### SolicitudPostulacion
| Regla | Capa | Detalle |
|---|---|---|
| Estado controlado | `EstadoSolicitud` enum | `PENDIENTE`, `EN_REVISION`, `APROBADA`, `RECHAZADA`, `CANCELADA` |
| Evaluación por administración | `evaluadorId UUID?` | Asignado al administrador dictaminador |
| Postulante obligatorio | `artesanoId Int` | Vínculo requerido con el artesano solicitante |

### Usuario
| Regla | Capa | Detalle |
|---|---|---|
| ID seguro | `id UUID` | Generado con `default(uuid())` a nivel base de datos |
| Email único | `@unique` en Prisma | Un solo usuario por dirección de email |
| Password hasheada | `services/usuario.services.js` | Encriptada de forma unidireccional con Bcrypt (cost 10) |
| Roles relacionales (RBAC) | `Rol` y `UsuarioRol` | Roles M:N (`ADMINISTRADOR`, `ARTESANO`). Un usuario puede tener múltiples roles |
| Rol por defecto | `services/usuario.services.js` | Todo nuevo registro público adquiere rol `ARTESANO` automáticamente |
| Cuenta activa | `Usuario.activo` | Control de habilitación/desactivación por administración |

### Sesiones y Autenticación JWT (`TokenRevocado`)
| Regla | Capa | Detalle |
|---|---|---|
| Firma y expiración | `services/token.services.js` | Algoritmo HS256, vigencia de 15 minutos (`expiresIn: "15m"`) y secreto en `JWT_SECRET` |
| Identificador de token (JTI) | `services/token.services.js` | Cada token emitido genera un `jti` criptográfico con `crypto.randomUUID()` |
| Verificación defensiva Zod | `services/token.services.js` | Valida que `sub` sea UUID válido (`z.uuid()`), `exp` sea número y `jti` no esté vacío |
| Autenticación Bearer | `middlewares/autenticarUsuario.js` | Extrae encabezado `Authorization: Bearer <token>`, valida formato y firma, e inyecta `req.usuario` |
| Cierre de sesión (Revocación) | `services/revocaciones.services.js` | Invalida el token guardando `{ jti, venceEn }` en la tabla `TokenRevocado` con `upsert` |
| Verificación de lista negra | `middlewares/autenticarUsuario.js` | Rechaza peticiones si el token se encuentra registrado como revocado en la BD |
| Purga periódica en segundo plano | `tareas/limpiezaRevocaciones.js` | Tarea recurrente cada 1 hora que elimina tokens vencidos de `TokenRevocado` con `deleteMany` |

---

## 13. Mapeo y Correspondencia: Cátedra UNCa (Unidad 4) vs Poncho Digital

En las diapositivas de la cátedra (**Unidad 4: Autorización y Protección de Recursos**) se utiliza un proyecto didáctico genérico basado en *Usuarios, Participantes, Eventos e Inscripciones*. 

En **Poncho Digital**, todas las directivas, patrones arquitectónicos y buenas prácticas de seguridad enseñadas por la cátedra fueron **estrictamente respetadas y aplicadas al dominio real de la Fiesta Nacional e Internacional del Poncho**:

### Comparativa de Modelos y Dominio

| Componente Teórico Cátedra (`1.md`) | Implementación en Poncho Digital | Justificación de Negocio Ferial |
|---|---|---|
| **Modelo `Usuario`** | **`Usuario`** | Idéntico: Credenciales, hash Bcrypt, `activo: Boolean @default(true)`, y relación M:N con `Rol`. |
| **Modelo `Rol`** | **`Rol`** | Idéntico: Catálogo con nombres únicos. En Poncho Digital: `ARTESANO` y `ADMINISTRADOR`. |
| **Modelo `UsuarioRol`** | **`UsuarioRol`** | Idéntico: Tabla intermedia con clave compuesta `@@id([usuarioId, rolId])` para RBAC múltiple. |
| **Modelo `Participante`** | **`Artesano`** | El artesano es el expositor participante del evento ferial. Relación 1:1 estricta con `Usuario` (`usuarioId @unique @db.Uuid`, `onDelete: Restrict`). Nace con `activo = false`. |
| **Modelo `Inscripcion`** | **`SolicitudPostulacion`** | Trámite formal del artesano para solicitar un espacio. Posee ciclo de vida (`PENDIENTE`, `EN_REVISION`, `APROBADA`, `RECHAZADA`, `CANCELADA`). |
| **Modelo `Evento`** | **`Stand` (en `Pabellon` y `Sector`)** | El recurso físico administrado por la organización para albergar artesanos expositores. |

---

### Comparativa de Endpoints y Matriz de Acceso

| Endpoint Didáctico Cátedra | Endpoint Real Poncho Digital | Quién tiene acceso | Acción que realiza |
|---|---|---|---|
| `POST /usuarios/registro-participante` | `POST /usuarios/registro` | 🟢 **Público** | Registro inicial. Crea `Usuario` y le asigna el rol `ARTESANO` por defecto en una sola transacción. |
| `POST /usuarios/login` | `POST /usuarios/login` | 🟢 **Público** | Valida credenciales Bcrypt y emite JWT firmado (15 min) con identificador `jti`. |
| `GET /participantes/me` | `GET /artesanos/me` | 🟡 **ARTESANO** | Filtro de propiedad: consulta únicamente los datos de perfil del artesano autenticado. |
| `POST /participantes` | `POST /artesanos/me` | 🟡 **ARTESANO** | Completa los datos personales y de taller del expositor (nace con `activo: false`). |
| `PUT /participantes/me` | `PUT /artesanos/me` | 🟡 **ARTESANO** | Modifica datos comerciales propios (teléfono, emprendimiento). |
| `POST /inscripciones` | `POST /solicitudes` | 🟡 **ARTESANO** | Presenta postulación para participar en la feria (inicia en `PENDIENTE`). |
| `GET /inscripciones/me` | `GET /solicitudes/me` | 🟡 **ARTESANO** | Lista únicamente el historial de postulaciones del usuario solicitante. |
| — | `PATCH /solicitudes/:id/cancelar` | 🟡 **ARTESANO** | Permite al artesano cancelar su postulación antes de que sea evaluada. |
| `POST /eventos` | `POST /stands` (y `/pabellones`) | 🔴 **ADMINISTRADOR** | Alta de stands y pabellones físicos en el predio ferial. |
| `PUT/DELETE /eventos/:id` | `PUT/DELETE /stands/:id` | 🔴 **ADMINISTRADOR** | Modificación física y mantenimiento de stands. |
| — | `GET /solicitudes` | 🔴 **ADMINISTRADOR** | Auditoría global de todas las postulaciones con filtros por estado. |
| — | `PATCH /solicitudes/:id/evaluar` | 🔴 **ADMINISTRADOR** | Dictamina la solicitud. Al dictaminar `APROBADA`, activa automáticamente al artesano en BD (`activo = true`). |
| — | `PATCH /solicitudes/:id/asignar-stand` | 🔴 **ADMINISTRADOR** | Asigna un stand libre (`DISPONIBLE` $\rightarrow$ `OCUPADO`) vinculándolo 1:1 al artesano. |
| `POST /usuarios/registro-administrador` | `POST /usuarios/registro-administrador` | 🔴 **ADMINISTRADOR** | Alta de una nueva cuenta con rol `ADMINISTRADOR`. |
| `POST /usuarios/:id/roles` | `POST /usuarios/:id/roles` | 🔴 **ADMINISTRADOR** | Asigna un nuevo rol a un usuario existente. |
| `DELETE /usuarios/:id/roles/:rol` | `DELETE /usuarios/:id/roles/:rol` | 🔴 **ADMINISTRADOR** | Retira un rol aplicando reglas de seguridad (conservar al menos 1 rol y 1 admin activo). |
| `PATCH /usuarios/:id/activo` | `PATCH /usuarios/:id/activo` | 🔴 **ADMINISTRADOR** | Habilita o inhabilita una cuenta en el sistema (no permite desactivar el último admin). |

---

## 14. Tabla Resumen: Quién Hace Qué

| Capa | Carpeta | Responsabilidad | Importa | NO importa |
|---|---|---|---|---|
| **Punto de Entrada** | `app.js` | Configura Express, monta rutas e inicia tareas | `express`, `routes`, `middlewares`, `tareas` | `prisma`, `validators` |
| **Rutas** | `routes/` | Declara endpoints y orden de handlers | `controllers`, `middlewares` | `prisma`, `validators` |
| **Middlewares** | `middlewares/` | Valida con Zod, autentica JWT (`autenticarUsuario`), captura errores | `utils`, `validators`, `services/token`, `services/revocaciones` | `controllers` |
| **Validadores** | `validators/` | Define contratos Zod | `zod` | Todo lo demás |
| **Controladores** | `controllers/` | Recibe HTTP, transfiere DTO, responde | `services`, `utils` | `express.Router`, `validators` |
| **Servicios** | `services/` | Lógica de negocio, persistencia, emisión/verificación JWT | `prisma`, `utils`, `jsonwebtoken`, `zod`, `crypto` | `express` (`req`/`res`) |
| **Tareas en 2do Plano** | `tareas/` | Daemons recurrentes de mantenimiento y purga | `services/revocaciones` | `express`, `routes` |
| **Acceso a Datos** | `config/`, `prisma/` | Conexión, secretos de entorno y modelos BD | `@prisma`, `dotenv` | Todo lo demás |
| **Utilidades** | `utils/` | Estandarización de errores y formateo Zod | Independiente | Todo lo demás |

---

## Diagrama de Dependencias entre Capas

```mermaid
flowchart TD
    APP["app.js\n(Punto de Entrada)"]
    ROUTES["routes/\n(Enrutamiento)"]
    MW["middlewares/\n(Filtros y Zod)"]
    VAL["validators/\n(Esquemas Zod)"]
    CTRL["controllers/\n(Gestión HTTP)"]
    SERV["services/\n(Lógica de Negocio)"]
    PRISMA["config/prisma.js\n(Acceso a Datos)"]
    UTILS["utils/\n(Herramientas)"]
    BD[("PostgreSQL\n(Base de Datos)")]

    APP --> ROUTES
    APP --> MW
    ROUTES --> MW
    ROUTES --> CTRL
    MW --> VAL
    MW --> UTILS
    CTRL --> SERV
    CTRL --> UTILS
    SERV --> PRISMA
    SERV --> UTILS
    PRISMA --> BD

    style APP fill:#38bdf8,stroke:#0284c7,color:#000
    style ROUTES fill:#a78bfa,stroke:#7c3aed,color:#000
    style MW fill:#fde047,stroke:#eab308,color:#000
    style VAL fill:#34d399,stroke:#059669,color:#000
    style CTRL fill:#fb923c,stroke:#ea580c,color:#000
    style SERV fill:#f472b6,stroke:#db2777,color:#000
    style PRISMA fill:#f87171,stroke:#dc2626,color:#fff
    style UTILS fill:#94a3b8,stroke:#64748b,color:#000
    style BD fill:#e2e8f0,stroke:#94a3b8,color:#000
```


---


# Parte 2: Estructura del Esquema de Base de Datos — Poncho Digital

# Estructura del Esquema de Base de Datos — Poncho Digital

**Cátedra:** Desarrollo Backend  
**Proyecto:** Poncho Digital — API REST de la Fiesta Nacional e Internacional del Poncho  
**ORM:** Prisma 7 con PostgreSQL  

---

## 1. Introducción y Fundamentos Teóricos

El modelo de datos de **Poncho Digital** fue diseñado bajo los principios de **diseño relacional en Tercera Forma Normal (3FN)** para garantizar la integridad referencial, evitar redundancias innecesarias y representar con precisión las reglas del dominio de la feria artesanal y la seguridad de la Unidad 4 (Autorización y RBAC).

### Principales decisiones de diseño:
1. **Control de Acceso Basado en Roles (RBAC Relacional M:N):**  
   Se reemplazó el enum estático por una estructura normalizada `Rol` y `UsuarioRol`. Esto permite que un usuario pueda poseer múltiples roles (`ADMINISTRADOR`, `ARTESANO`), desacopla los permisos del registro de usuario y cumple con los estándares de seguridad de la cátedra.
2. **Cuentas Activas y Moderación:**  
   - `Usuario.activo` (`Boolean @default(true)`): permite inhabilitar el acceso al sistema de una cuenta comprometida o dada de baja.
   - `Artesano.activo` (`Boolean @default(false)`): los nuevos artesanos inician inactivos hasta que su postulación a la feria (`SolicitudPostulacion`) sea aprobada formalmente por un administrador.
3. **Identificadores Criptográficos (UUID) para Cuentas de Usuario:**  
   Se utiliza el tipo nativo `UUID` de PostgreSQL para la entidad `Usuario`. Esto previene ataques de enumeración (adivinación secuencial de IDs), desacopla la generación de identificadores y se alinea con estándares de seguridad modernos.
4. **Identificadores Enteros Autoincrementales para Entidades de Negocio:**  
   Las entidades del dominio físico o de catálogo (`Artesano`, `Producto`, `Stand`, `Pabellon`, `Sector`, `Localidad`, `SolicitudPostulacion`) emplean enteros autoincrementales (`SERIAL / Int`), optimizando el tamaño de los índices B-Tree en llaves foráneas y búsquedas por clave primaria.
5. **Manejo de Moneda con `Decimal(10, 2)`:**  
   En `Producto`, el precio se define como `Decimal(10, 2)` en lugar de coma flotante (`Float`), garantizando exactitud matemática sin pérdidas por redondeo binario.
6. **Soft Delete (Baja Lógica):**  
   `Artesano` y `Producto` implementan baja lógica vía `activo: false`, preservando el histórico de asignaciones feriales y ventas sin destruir registros.
7. **Lista Negra Persistente de Tokens Revocados (`TokenRevocado`):**  
   Para implementar un cierre de sesión seguro en un esquema de autenticación sin estado (stateless JWT), se modela una entidad dedicada con clave primaria `jti` (JWT ID criptográfico) y marca de tiempo `venceEn`. Un índice B-Tree sobre `venceEn` garantiza consultas ultrarrápidas y permite a tareas en segundo plano purgar masivamente registros expirados.

---

## 2. Diagrama Entidad-Relación (Mermaid)

```mermaid
erDiagram
    TOKEN_REVOCADO {
        String jti PK "Identificador único JWT (UUID)"
        DateTime venceEn "Fecha de expiración del token"
    }

    USUARIO {
        Uuid id PK "UUID autogenerado"
        String nombre
        String email UK
        String passwordHash "Hash Bcrypt"
        Boolean activo "default(true)"
        DateTime createdAt
        DateTime updatedAt
    }

    ROL {
        Int id PK "autoincrement()"
        String nombre UK "ADMINISTRADOR | ARTESANO"
    }

    USUARIO_ROL {
        Uuid usuarioId PK, FK
        Int rolId PK, FK
    }

    LOCALIDAD {
        Int id PK "autoincrement()"
        String nombre UK
        String provincia "default('Catamarca')"
        DateTime createdAt
    }

    ARTESANO {
        Int id PK "autoincrement()"
        Uuid usuarioId FK,UK "1 a 1 estricto con Usuario (Restrict)"
        Int localidadId FK
        String nombre
        String apellido
        String dni UK
        String email UK
        String telefono "nullable"
        String nombreEmprendimiento
        String rubro
        Text descripcionTrayectoria "nullable"
        Boolean activo "default(false) - Habilitado tras aprobación"
        DateTime createdAt
        DateTime updatedAt
    }

    PRODUCTO {
        Int id PK "autoincrement()"
        Int artesanoId FK
        String nombre
        Text descripcion "nullable"
        Decimal precio "Decimal(10,2)"
        Int stock "default(0)"
        Boolean activo "default(true)"
        DateTime createdAt
        DateTime updatedAt
    }

    PABELLON {
        Int id PK "autoincrement()"
        String nombre UK
        DateTime createdAt
    }

    SECTOR {
        Int id PK "autoincrement()"
        String nombre UK
        DateTime createdAt
    }

    STAND {
        Int id PK "autoincrement()"
        String codigo UK "Código único (ej: STD-101)"
        Int numero "nullable"
        EstadoStand estado "default(DISPONIBLE)"
        Int pabellonId FK
        Int sectorId FK
        Int artesanoId FK,UK "1 a 1 opcional con Artesano"
        DateTime createdAt
        DateTime updatedAt
    }

    SOLICITUD_POSTULACION {
        Int id PK "autoincrement()"
        Int artesanoId FK
        Int standId FK "nullable"
        Uuid evaluadorId FK "nullable"
        EstadoSolicitud estado "default(PENDIENTE)"
        Text observaciones "nullable"
        DateTime fechaPresentacion "default(now())"
        DateTime updatedAt
    }

    %% Relaciones
    USUARIO ||--o{ USUARIO_ROL : "posee (1 a N)"
    ROL ||--o{ USUARIO_ROL : "asignado a (1 a N)"
    USUARIO ||--|| ARTESANO : "perfil artesanal (1 a 1)"
    USUARIO ||--o{ SOLICITUD_POSTULACION : "evalúa como admin (1 a N)"
    LOCALIDAD ||--o{ ARTESANO : "radica en (1 a N)"
    ARTESANO ||--o{ PRODUCTO : "publica (1 a N)"
    ARTESANO ||--o| STAND : "ocupa stand ferial (1 a 1 opcional)"
    ARTESANO ||--o{ SOLICITUD_POSTULACION : "postula (1 a N)"
    PABELLON ||--o{ STAND : "alberga (1 a N)"
    SECTOR ||--o{ STAND : "ubica (1 a N)"
    STAND ||--o{ SOLICITUD_POSTULACION : "asignado en (1 a N)"
```

---

## 3. Tipos Enumerados (Enums)

### `EstadoStand`
Controla la disponibilidad física y operativa de los espacios:
- **`DISPONIBLE`**: El stand no tiene ningún artesano asignado y está listo para ser otorgado.
- **`OCUPADO`**: Stand asignado a un artesano titular.
- **`MANTENIMIENTO`**: Stand inhabilitado temporalmente por refacciones técnicas, cableado o inspección.

### `EstadoSolicitud`
Gestiona el ciclo de vida del trámite de postulación ferial:
- **`PENDIENTE`**: Solicitud enviada por el artesano en espera de revisión administrativa.
- **`EN_REVISION`**: La solicitud está siendo analizada por el equipo evaluador.
- **`APROBADA`**: Postulación aceptada formalmente (activa al artesano y habilita la asignación del stand).
- **`RECHAZADA`**: Postulación desestimada con observaciones explicativas.
- **`CANCELADA`**: Postulación cancelada voluntariamente por el propio artesano solicitante antes de ser evaluada.

---

## 4. Modelos en Detalle

### 4.1. `Usuario`, `Rol` y `UsuarioRol` (RBAC)
- **`Usuario`**: Representa las credenciales de acceso (`email`, `passwordHash` con Bcrypt) y la bandera `activo`.
- **`Rol`**: Entidad de catálogo con valores únicos (`ADMINISTRADOR`, `ARTESANO`).
- **`UsuarioRol`**: Tabla intermedia que vincula usuarios con roles (`usuarioId_rolId`). Permite que un usuario administrador también pueda poseer el rol de artesano si participa en la feria.

### 4.2. `Artesano`
Entidad central del negocio. Representa al productor artesanal y su taller:
- **`usuarioId` (`UUID`, `@unique`)**: Relación 1:1 con `Usuario` bajo política `onDelete: Restrict` para impedir eliminar accidentalmente una cuenta de usuario que mantenga un perfil de artesano activo.
- **`activo` (`Boolean`, `@default(false)`)**: Se inicializa en `false` al completar el perfil y pasa a `true` automáticamente cuando la administración dictamina `APROBADA` su postulación.

### 4.3. `Stand` y Asignación 1:1
- **`artesanoId` (`Int? @unique`)**: Relación 1:1 opcional con `Artesano`. Al ser `@unique`, el motor PostgreSQL impide a nivel relacional que un artesano posea más de un stand simultáneamente.
- **`onDelete: SetNull`**: Si el artesano se desvincula o da de baja, el espacio físico permanece intacto en el predio ferial en estado `DISPONIBLE`.

### 4.4. `SolicitudPostulacion`
- Registra el pedido formal del artesano para obtener espacio en la fiesta.
- Vincula al `artesanoId` (solicitante), `evaluadorId` (`Usuario` administrador que dictamina) y `standId` (stand asignado).

---

## 5. Resumen de Políticas de Integridad Referencial (`onDelete`)

| Origen | Destino | Relación | Política `onDelete` | Justificación de Negocio |
|---|---|---|---|---|
| `UsuarioRol` | `Usuario` | N a 1 | **`Cascade`** | Si se borra la cuenta, se eliminan sus asignaciones de roles. |
| `UsuarioRol` | `Rol` | N a 1 | **`Restrict`** | No se puede eliminar un rol del sistema si está asignado a usuarios. |
| `Artesano` | `Usuario` | 1 a 1 | **`Restrict`** | Evita la eliminación accidental de un usuario con perfil ferial registrado. |
| `Producto` | `Artesano` | N a 1 | **`Cascade`** | El catálogo depende íntegramente de la existencia de su artesano titular. |
| `Stand` | `Artesano` | 1 a 1 | **`SetNull`** | Si un artesano se da de baja, el stand físico se conserva y se libera. |
| `Stand` | `Pabellon` | N a 1 | **`Restrict`** | No se puede eliminar un pabellón que albergue stands. |
| `Stand` | `Sector` | N a 1 | **`Restrict`** | No se puede eliminar un sector mientras contenga stands. |
| `Solicitud` | `Artesano` | N a 1 | **`Cascade`** | Las postulaciones son propiedad exclusiva del artesano solicitante. |
| `Solicitud` | `Usuario` | N a 1 | **`SetNull`** | Si un evaluador se elimina, la postulación preserva su histórico de auditoría. |
| `TokenRevocado` | *Independiente* | Sin FK | **—** | Tabla de revocación técnica administrada por purga automática temporal (`deleteMany`). |


---


# Parte 3: Guía Completa de Prisma ORM (v7) + PostgreSQL

# Guía Completa de Prisma ORM (v7) + PostgreSQL
### Cátedra: Desarrollo Backend — Facultad de Tecnología y Ciencias Aplicadas (UNCa)

Guía técnica, conceptual y paso a paso que recopila todos los comandos, archivos de configuración, definiciones del lenguaje y buenas prácticas utilizadas en el proyecto para integrar **Prisma ORM 7** con **PostgreSQL**.

---

## Contenido
1. [Flujo General: Del Código a la Base de Datos](#1-flujo-general-del-código-a-la-base-de-datos)
2. [Instalación de Dependencias](#2-instalación-de-dependencias)
3. [Inicialización del Entorno Prisma](#3-inicialización-del-entorno-prisma)
4. [Configuración de Variables de Entorno (`.env`)](#4-configuración-de-variables-de-entorno-env)
5. [Configuración de Prisma 7 (`prisma7.config.ts`)](#5-configuración-de-prisma-7-prisma7configts)
6. [El Esquema Declarativo (`schema.prisma`)](#6-el-esquema-declarativo-schemaprisma)
   - [¿Qué es Prisma Schema Language (PSL)?](#qué-es-prisma-schema-language-psl)
   - [Bloques `generator` y `datasource`](#bloques-generator-y-datasource)
   - [Tipos de Datos y Atributos](#tipos-de-datos-y-atributos)
   - [Mapeo Conceptual: Cátedra vs Poncho Digital](#mapeo-conceptual-cátedra-vs-poncho-digital)
   - [Modelos del Proyecto Poncho Digital (`Usuario`, `Artesano`, `Producto`, etc.)](#modelos-del-proyecto-poncho-digital-usuario-artesano-producto-stand-etc)
7. [Migraciones con Prisma Migrate (`migrate dev`)](#7-migraciones-con-prisma-migrate-migrate-dev)
8. [Generación de Prisma Client (`generate`)](#8-generación-de-prisma-client-generate)
9. [Centralización del Cliente (`src/config/prisma.js`)](#9-centralización-del-cliente-srcconfigprismajs)
10. [Exploración de Datos con Prisma Studio](#10-exploración-de-datos-con-prisma-studio)
11. [Tabla Resumen de Comandos](#11-tabla-resumen-de-comandos)

---

## 1. Flujo General: Del Código a la Base de Datos

```mermaid
flowchart TD
    subgraph Configuración ["1. Declaración y Configuración"]
        ENV[".env (DATABASE_URL)"] --> CONFIG["prisma7.config.ts (env helper)"]
        SCHEMA["prisma/schema.prisma (PSL declarativo)"] --> CONFIG
    end

    subgraph BaseDeDatos ["2. Persistencia en PostgreSQL"]
        MIGRATE["npx prisma migrate dev --name init"]
        MIGRATE -->|"1. Compara cambios<br>2. Genera SQL versionado<br>3. Crea tablas"| DB[("PostgreSQL / Supabase (poncho_digital)")]
    end

    subgraph CodigoCliente ["3. Código y Aplicación"]
        GENERATE["npx prisma generate"]
        SCHEMA --> GENERATE
        GENERATE -->|"Genera código adaptado"| CLIENT_FOLDER["src/generated/prisma/"]
        CLIENT_FOLDER --> SINGLETON["src/config/prisma.js (Instancia única)"]
        SINGLETON --> CONTROLLERS["Controladores Express (src/controllers)"]
    end

    subgraph Exploracion ["4. Inspección"]
        STUDIO["npx prisma studio (localhost:5555)"] <--> DB
    end

    CONFIG --> MIGRATE

    style ENV fill:#fde047,stroke:#eab308,color:#000
    style CONFIG fill:#38bdf8,stroke:#0284c7,color:#000
    style SCHEMA fill:#a855f7,stroke:#7e22ce,color:#fff
    style DB fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style CLIENT_FOLDER fill:#4ade80,stroke:#16a34a,color:#000
    style SINGLETON fill:#f97316,stroke:#ea580c,color:#fff
    style STUDIO fill:#ec4899,stroke:#be185d,color:#fff
```

---

## 2. Instalación de Dependencias

Para configurar **Prisma 7** con **PostgreSQL** y Node.js se instalaron los siguientes paquetes:

```bash
# Dependencias de producción (Cliente, adaptador de PostgreSQL, driver pg y dotenv)
npm install @prisma/client @prisma/adapter-pg pg dotenv

# Dependencia de desarrollo (CLI de Prisma alineado a la misma versión del cliente)
npm install --save-dev prisma@^7.0.0 @prisma/client@^7.0.0
```

### Rol de cada paquete:
* **`prisma`**: Interfaz de línea de comandos (CLI) de Prisma para ejecutar migraciones, validaciones y utilidades.
* **`@prisma/client`**: Motor cliente generado que permite interactuar con la base de datos desde JavaScript.
* **`@prisma/adapter-pg`**: Adaptador oficial de Prisma 7 para comunicar las consultas directamente con el driver de PostgreSQL.
* **`pg`**: Driver nativo oficial de PostgreSQL para Node.js.
* **`dotenv`**: Librería para cargar variables de entorno desde el archivo `.env`.

---

## 3. Inicialización del Entorno Prisma

El comando utilizado inicialmente para generar la estructura básica de Prisma fue:

```bash
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma
```

### ¿Qué hace este comando?
1. Crea la carpeta `prisma/` con el archivo inicial `schema.prisma`.
2. Genera el archivo de configuración `prisma7.config.ts` (o `prisma.config.ts`).
3. Crea un archivo `.env` con la plantilla de conexión.
4. Configura el proveedor como `postgresql` y fija la salida del cliente generado en `../src/generated/prisma`.

---

## 4. Configuración de Variables de Entorno (`.env`)

Ubicado en la raíz del proyecto. Contiene los datos confidenciales de acceso a la base de datos.

### Estructura de la cadena de conexión:
```text
postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/BASE_DE_DATOS?schema=ESQUEMA
```

### Implementación en el proyecto:
```env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/gestion_eventos_db?schema=public"
```

* **`postgres`**: Usuario administrador por defecto.
* **`1234`**: Contraseña del usuario PostgreSQL.
* **`localhost`**: Servidor local.
* **`5432`**: Puerto estándar de PostgreSQL.
* **`gestion_eventos_db`**: Nombre de la base de datos que Prisma utilizará (o creará automáticamente si no existe).
* **`schema=public`**: Esquema predeterminado de tablas en PostgreSQL.

> [!WARNING]
> El archivo `.env` **nunca debe subirse al repositorio Git**. Debe estar listado en `.gitignore`.

---

## 5. Configuración de Prisma 7 (`prisma7.config.ts`)

Prisma 7 introduce este archivo para configurar la fuente de datos mediante código TypeScript/JavaScript:

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

### ¿Por qué se utiliza el helper `env()` en lugar de `process.env`?
El archivo generado originalmente suele utilizar `process.env`. Sin embargo, VS Code puede mostrar advertencias de tipo en proyectos JavaScript que no cuentan con definiciones globales de Node.js instaladas. Para evitar advertencias y garantizar tipado seguro, se utiliza el helper **`env()`** provisto por `prisma/config`.

---

## 6. El Esquema Declarativo (`schema.prisma`)

### ¿Qué es Prisma Schema Language (PSL)?
El archivo `schema.prisma` contiene la descripción formal del modelo de datos. Se escribe utilizando **Prisma Schema Language (PSL)**, un lenguaje declarativo diseñado específicamente para describir estructuras de datos.

> **¿Qué significa que sea declarativo?**  
> La aplicación especifica **qué estructura necesita**, sin detallar paso a paso las instrucciones SQL necesarias para crearla.

### Bloques `generator` y `datasource`
```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

* **`generator client`**: Configura la generación de Prisma Client.
  * `provider = "prisma-client"`: Selecciona el generador oficial de Prisma Client.
  * `output`: Indica la carpeta destino del cliente generado (no se crea aquí, sino luego al ejecutar `npx prisma generate`).
* **`datasource db`**: Identifica el sistema de base de datos.
  * `db`: Nombre interno asignado al origen de datos.
  * `provider = "postgresql"`: Indica que Prisma utilizará el conector de PostgreSQL.

---

### Tipos de Datos y Atributos

#### Tipos de Datos
Indican qué clase de información puede almacenarse en cada campo:
* **`Int`**: Almacena números enteros sin parte decimal.
* **`String`**: Cadenas de texto (nombres, títulos, descripciones).
* **`DateTime`**: Almacena conjuntamente fecha y hora.

#### Atributos (comienzan con `@`)
Establecen restricciones, valores predeterminados o comportamientos especiales:
* **`@id`**: Establece que el campo identifica de manera única cada registro (clave primaria en PostgreSQL).
* **`@default(...)`**: Define el valor por defecto que se asignará si no se envía uno:
  * `autoincrement()`: Genera automáticamente un número entero superior al último (`SERIAL`).
  * `now()`: Asigna la fecha y hora exactas del momento de creación.
* **`@updatedAt`**: Actualiza automáticamente el campo cada vez que el registro se modifica a través de Prisma.
* **Modificador opcional (`?`)**: Un campo sin `?` es obligatorio (`NOT NULL`). Un campo con `?` permite valores nulos (`NULL`).

---

### Mapeo Conceptual: Cátedra vs Poncho Digital

En las diapositivas de la cátedra se utiliza un modelo ilustrativo genérico (`Evento`, `Participante`, `Inscripcion`). En **Poncho Digital**, estos conceptos se traducen de forma 1 a 1 a las entidades reales del predio ferial:

| Concepto Teórico Cátedra | Modelo en Poncho Digital | Rol en el Dominio Ferial |
|---|---|---|
| Sujeto que se registra | `Artesano` (1:1 con `Usuario`) | Expositor ferial que postula y gestiona productos |
| Trámite de inscripción | `SolicitudPostulacion` | Petición formal de stand (`PENDIENTE` $\rightarrow$ `APROBADA`) |
| Recurso asignado | `Stand` (en `Pabellon` / `Sector`) | Espacio físico asignado tras la aprobación del jurado |
| Catálogo ofertado | `Producto` | Artículos artesanales vinculados al artesano |

Ejemplo de modelo básico con clave primaria y atributos estándar:
```prisma
model Localidad {
  id        Int        @id @default(autoincrement())
  nombre    String     @unique
  provincia String     @default("Catamarca")
  artesanos Artesano[]
  createdAt DateTime   @default(now())
}
```

**Convenciones utilizadas:**
* Los modelos se escriben en singular y con formato **PascalCase**: `Localidad`, `Artesano`.
* Los campos se escriben con **camelCase**: `createdAt`, `usuarioId`.
* Los campos sin `?` son obligatorios (`nombre`, `dni`).

---

### Modelos del Proyecto Poncho Digital (`Usuario`, `Artesano`, `Producto`, `Stand`, etc.)
Aplicando exactamente las mismas reglas y tipos de datos a los recursos de nuestra API:

```prisma
enum EstadoStand {
  DISPONIBLE
  OCUPADO
  MANTENIMIENTO
}

enum EstadoSolicitud {
  PENDIENTE
  EN_REVISION
  APROBADA
  RECHAZADA
  CANCELADA
}

model Usuario {
  id                   String                 @id @default(uuid()) @db.Uuid
  nombre               String
  email                String                 @unique
  passwordHash         String
  activo               Boolean                @default(true)
  artesano             Artesano?
  solicitudesEvaluadas SolicitudPostulacion[] @relation("EvaluadorSolicitud")
  roles                UsuarioRol[]
  createdAt            DateTime               @default(now())
  updatedAt            DateTime               @updatedAt
}

model Rol {
  id       Int          @id @default(autoincrement())
  nombre   String       @unique // "ADMINISTRADOR", "ARTESANO"
  usuarios UsuarioRol[]
}

model UsuarioRol {
  usuarioId String  @db.Uuid
  rolId     Int
  usuario   Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  rol       Rol     @relation(fields: [rolId], references: [id], onDelete: Restrict)

  @@id([usuarioId, rolId])
}

model Artesano {
  id                     Int                    @id @default(autoincrement())
  usuarioId              String                 @unique @db.Uuid
  usuario                Usuario                @relation(fields: [usuarioId], references: [id], onDelete: Restrict)
  localidadId            Int
  localidad              Localidad              @relation(fields: [localidadId], references: [id])
  nombre                 String
  apellido               String
  dni                    String                 @unique
  email                  String                 @unique
  telefono               String?
  nombreEmprendimiento   String
  rubro                  String
  descripcionTrayectoria String?                @db.Text
  activo                 Boolean                @default(false) // Se activa al aprobar su postulación
  productos              Producto[]
  stand                  Stand?
  solicitudes            SolicitudPostulacion[]
  createdAt              DateTime               @default(now())
  updatedAt              DateTime               @updatedAt
}

model Producto {
  id          Int      @id @default(autoincrement())
  artesanoId  Int
  artesano    Artesano @relation(fields: [artesanoId], references: [id], onDelete: Cascade)
  nombre      String
  descripcion String?  @db.Text
  precio      Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  activo      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([artesanoId])
}

model TokenRevocado {
  jti     String   @id
  venceEn DateTime

  @@index([venceEn])
}
```

---

## 7. Migraciones con Prisma Migrate (`migrate dev`)

> [!IMPORTANT]
> **Definir el modelo en `schema.prisma` todavía no crea ninguna tabla en PostgreSQL.**  
> Solamente declaramos la estructura que la aplicación necesita. Para plasmarla en la base de datos se requiere una **migración**.

### ¿Qué es una migración?
Una migración es un **conjunto versionado de instrucciones SQL** que modifica la estructura de una base de datos para llevarla desde un estado conocido hacia un nuevo estado.

### ¿Por qué se versionan las migraciones?
* Conservan el historial de evolución del modelo a lo largo del tiempo.
* Permiten reproducir la misma estructura en otros equipos y entornos de despliegue.
* Facilitan que todo el equipo de trabajo trabaje con una base consistente.
* Vinculan los cambios del código con los cambios reales de la base de datos.

### El comando de migración:
```bash
npx prisma migrate dev --name init
```

#### Desglose del comando:
* **`npx`**: Ejecuta una herramienta instalada localmente en el proyecto sin requerir instalación global.
* **`prisma`**: Invoca la CLI de Prisma ORM.
* **`migrate`**: Selecciona el conjunto de comandos encargado de administrar migraciones.
* **`dev`**: Crea y aplica migraciones sobre una base de datos en entorno de desarrollo.
* **`--name init`**: Asigna el nombre descriptivo `"init"` a la migración inicial (crea la carpeta `prisma/migrations/XXXXXXXXXXXXXX_init/migration.sql`).

#### ¿Qué realiza Prisma Migrate en este paso?
1. Compara el estado esperado (`schema.prisma`) con el estado actual de PostgreSQL.
2. Si la base de datos no existe (`gestion_eventos_db`), la crea automáticamente.
3. Determina los cambios estructurales necesarios y genera el archivo `migration.sql`.
4. Ejecuta el SQL sobre PostgreSQL creando las tablas.
5. Registra la migración en la tabla interna `_prisma_migrations`.
6. Dispara automáticamente `prisma generate` para sincronizar el cliente.

---

## 8. Generación de Prisma Client (`generate`)

```bash
npx prisma generate
```

### ¿Qué significa el comando?
* **`npx`**: Ejecuta el ejecutable local de Prisma.
* **`prisma`**: CLI de Prisma.
* **`generate`**: Ejecuta los generadores configurados en `schema.prisma`.

### ¿Qué operaciones realiza?
En base a `schema.prisma`:
1. Interpreta el bloque `generator client`.
2. Analiza los modelos definidos (`Artesano` y `Producto`).
3. Genera el código tipado adaptado a esos modelos.
4. Guarda los archivos en la carpeta configurada mediante `output` (`src/generated/prisma`).

> [!CAUTION]
> **`prisma generate` genera código para ser usado por la aplicación.**  
> No crea tablas, no ejecuta migraciones y no agrega registros en PostgreSQL.

---

## 9. Centralización del Cliente (`src/config/prisma.js`)

Para interactuar con la base de datos desde los controladores de Express, creamos una **única instancia reutilizable** de Prisma Client:

```javascript
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

// 1. Configurar el adaptador con la cadena de conexión de PostgreSQL
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

// 2. Instanciar Prisma Client inyectando el adaptador
const prisma = new PrismaClient({ adapter });

export default prisma;
```

### ¿Qué realiza cada parte?
* **`dotenv/config`**: Carga las variables definidas en `.env`.
* **`PrismaPg`**: Configura el adaptador para PostgreSQL.
* **`PrismaClient`**: Importa el cliente generado para nuestros modelos.
* **`new PrismaClient({ adapter })`**: Crea la instancia que utilizará la API.

### ¿Por qué utilizar un archivo separado (Patrón Singleton)?
* **Centraliza la configuración** del acceso a datos en un único punto.
* **Evita repetir la lógica de conexión** en cada controlador.
* **Previene agotar el grupo de conexiones (connection pool)** de PostgreSQL reutilizando siempre la misma instancia.
* Los controladores simplemente importan `prisma` ya preparado:
  ```javascript
  import prisma from '../config/prisma.js';
  ```

---

## 10. Exploración de Datos con Prisma Studio

Para inspeccionar o insertar datos de prueba sin escribir código:

```bash
npx prisma studio
```

Normalmente se abre automáticamente en el navegador en: **`http://localhost:5555`**

### ¿Qué es Prisma Studio?
Es una interfaz gráfica web de desarrollo que permite visualizar, filtrar, crear, editar y eliminar registros de los modelos definidos en `schema.prisma`.

> [!NOTE]
> **Prisma Studio no reemplaza a pgAdmin ni DBeaver:**  
> Cada herramienta se utiliza según su responsabilidad: pgAdmin administra el servidor PostgreSQL (permisos, bases de datos, copias de seguridad), mientras que Prisma Studio es un visualizador rápido centrado en los modelos de la aplicación.

---

## 11. Tabla Resumen de Comandos

| Comando | Función Principal | ¿Afecta la BD? | ¿Afecta el Código? |
|---|---|:---:|:---:|
| `npx prisma init` | Inicializa la estructura de Prisma en el proyecto | No | Sí (crea archivos) |
| `npx prisma validate` | Valida sintaxis y tipos en `schema.prisma` | No | No |
| `npx prisma format` | Alinea e indenta automáticamente `schema.prisma` | No | Sí (formatea archivo) |
| `npx prisma migrate dev --name <nombre>` | Crea el archivo SQL y aplica los cambios estructurales en PostgreSQL | **Sí (crea/modifica tablas)** | Sí (dispara `generate`) |
| `npx prisma generate` | Construye los archivos del cliente en `src/generated/prisma` | No | **Sí (compila el cliente)** |
| `npx prisma studio` | Abre la consola web en el puerto `5555` | Solo si editas registros | No |


---


# Parte 4: Métodos de Consulta y Operaciones CRUD en Prisma ORM

# Guía de Métodos de Consulta y Operaciones CRUD en Prisma ORM
### Cátedra: Desarrollo Backend — Facultad de Tecnología y Ciencias Aplicadas (UNCa)

Esta guía recopila todas las formas de pedir, filtrar, ordenar, paginar y modificar datos en PostgreSQL utilizando **Prisma Client**, con ejemplos prácticos aplicados a los modelos de nuestro proyecto (`Artesano` y `Producto`).

> [!NOTE]
> **Evolución Arquitectónica (Unidad 3 de la UNCa):**  
> En la arquitectura modular por capas del proyecto, las consultas y mutaciones de Prisma aquí documentadas se alojan dentro de la **Capa de Servicios** (`src/services/`), como por ejemplo `src/services/producto.services.js`. Los controladores no hablan directamente con Prisma en las operaciones con servicios, sino que delegan la operación correspondiente entregándole un **DTO**.

---

## Índice
1. [Concepto Central: Modelos y Delegados](#1-concepto-central-modelos-y-delegados)
2. [Métodos de Lectura (Consultas)](#2-métodos-de-lectura-consultas)
   - [`findMany`](#a-findmany--obtener-múltiples-registros)
   - [`findUnique`](#b-findunique--obtener-un-registro-por-campo-único-o-id)
   - [`findFirst`](#c-findfirst--obtener-el-primer-registro-que-cumpla-una-condición)
   - [`count`](#d-count--contar-registros)
3. [Modificadores y Opciones de Consulta](#3-modificadores-y-opciones-de-consulta)
   - [`where` y Operadores de Filtro](#where-y-operadores-de-filtro)
   - [`select`: Proyección de columnas](#select-proyección-de-columnas)
   - [`orderBy`: Ordenamiento](#orderby-ordenamiento)
   - [`take` y `skip`: Paginación y Límites](#take-y-skip-paginación-y-límites)
4. [Métodos de Escritura (Mutaciones CRUD)](#4-métodos-de-escritura-mutaciones-crud)
   - [`create`](#a-create--insertar-un-nuevo-registro)
   - [`update`](#b-update--modificar-un-registro-existente)
   - [`delete`](#c-delete--eliminar-un-registro)
   - [`upsert`](#d-upsert--crear-o-actualizar-según-exista)
   - [Operaciones en Lote (`createMany`, `deleteMany`, `updateMany`)](#e-operaciones-en-lote)
5. [Mapeo Práctico: De Memoria a Prisma en los Controladores](#5-mapeo-práctico-de-memoria-a-prisma-en-los-controladores)
6. [Manejo de Respuestas, Valores Nulos y Errores](#6-manejo-de-respuestas-valores-nulos-y-errores)
7. [Relaciones en Prisma ORM (1:1, 1:N y N:M)](#7-relaciones-en-prisma-orm-11-1n-y-nm)
   - [Sintaxis Base y el Decorador `@relation`](#sintaxis-base-y-el-decorador-relation)
   - [Relación 1 a 1 (Uno a Uno)](#a-relación-1-a-1-uno-a-uno)
   - [Relación 1 a N (Uno a Muchos)](#b-relación-1-a-n-uno-a-muchos)
   - [Relación N a M (Muchos a Muchos: Implícita y Explícita)](#c-relación-n-a-m-muchos-a-muchos-implícita-y-explícita)
   - [Consultas con Datos Relacionados (`include` y `select`)](#d-consultas-con-datos-relacionados-include-y-select)
   - [Escrituras Anidadas (*Nested Writes*: `connect` y `create`)](#e-escrituras-anidadas-nested-writes-connect-y-create)
8. [Migración de Datos: B.D. con Registros Existentes (Estrategia `--create-only`)](#8-migración-de-datos-bd-con-registros-existentes-estrategia---create-only)
   - [El Problema: Restricción NOT NULL sobre Datos Existentes](#el-problema-restricción-not-null-sobre-datos-existentes)
   - [Paso 1: Generar la migración sin aplicarla (`--create-only`)](#paso-1-generar-la-migración-sin-aplicarla-sin-modificar-la-bd)
   - [Paso 2: Adaptar el bloque SQL en `migration.sql` (6 Pasos Críticos)](#paso-2-adaptar-el-bloque-sql-en-migrationsql-6-pasos-críticos)
   - [Paso 3: Aplicar la migración adaptada y regenerar Prisma Client](#paso-3-aplicar-la-migración-adaptada-y-regenerar-prisma-client)
   - [Paso 4: Comprobación del estado y consistencia en B.D.](#paso-4-comprobación-del-estado-y-consistencia-en-bd)
   - [Alternativa Ágil: Sincronización Directa con `npx prisma db push`](#alternativa-ágil-sincronización-directa-con-npx-prisma-db-push)
   - [¿Cuándo usar `prisma db push` vs `prisma migrate dev`?](#cuándo-usar-prisma-db-push-vs-prisma-migrate-dev)
   - [Manejo de Datos Existentes y Flags Útiles de `db push`](#manejo-de-datos-existentes-y-flags-útiles-de-db-push)
9. [Consumo de Consultas SQL Puras (*Raw SQL*) en Prisma](#9-consumo-de-consultas-sql-puras-raw-sql-en-prisma)
   - [`$queryRaw`: Consultas de Lectura (`SELECT`)](#a-queryraw--consultas-de-lectura-select)
   - [Seguridad y Prevención Automática de Inyecciones SQL](#b-seguridad-y-prevención-automática-de-inyecciones-sql)
   - [`$executeRaw`: Modificaciones Masivas y DDL](#c-executeraw--modificaciones-masivas-y-ddl)
   - [Variantes Unsafe (`$queryRawUnsafe` y `$executeRawUnsafe`)](#d-variantes-unsafe-queryrawunsafe-y-executerawunsafe)
   - [Manejo de Tipos Especiales (BigInt en PostgreSQL)](#e-manejo-de-tipos-especiales-bigint-en-postgresql)
10. [Tabla Resumen Rápida de Métodos y Operaciones](#10-tabla-resumen-rápida-de-métodos-y-operaciones)


---

## 1. Concepto Central: Modelos y Delegados

Cuando defines modelos en `prisma/schema.prisma`:

```prisma
model Artesano {
  id                     Int        @id @default(autoincrement())
  usuarioId              String     @unique @db.Uuid
  usuario                Usuario    @relation(fields: [usuarioId], references: [id], onDelete: Restrict)
  localidadId            Int
  localidad              Localidad  @relation(fields: [localidadId], references: [id])
  nombre                 String
  apellido               String
  dni                    String     @unique
  email                  String     @unique
  telefono               String?
  rubro                  String
  nombreEmprendimiento   String
  descripcionTrayectoria String?    @db.Text
  activo                 Boolean    @default(false)
  productos              Producto[]
  stand                  Stand?
  createdAt              DateTime   @default(now())
  updatedAt              DateTime   @updatedAt
}

model Producto {
  id          Int      @id @default(autoincrement())
  artesanoId  Int
  artesano    Artesano @relation(fields: [artesanoId], references: [id], onDelete: Cascade)
  nombre      String
  descripcion String?  @db.Text
  precio      Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  activo      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([artesanoId])
}
```

Prisma Client genera automáticamente una propiedad (delegado) en minúscula camelCase dentro de la instancia `prisma`:

* `model Artesano` $\rightarrow$ `prisma.artesano.<metodo>()`
* `model Producto` $\rightarrow$ `prisma.producto.<metodo>()`

Todas las operaciones hacia la base de datos son **asíncronas** y devuelven una `Promise`, por lo que siempre deben utilizarse con `await` dentro de funciones `async`.

---

## 2. Métodos de Lectura (Consultas)

### A. `findMany` — Obtener múltiples registros
Equivale a una consulta `SELECT * FROM ...`. Devuelve siempre un **arreglo** (`[]`). Si no hay registros coincidentes, devuelve un arreglo vacío `[]` (nunca `null`).

#### 1. Traer todos los registros:
```javascript
const todosLosArtesanos = await prisma.artesano.findMany();
```

#### 2. Traer registros con filtro básico:
```javascript
const artesanosBelen = await prisma.artesano.findMany({
  where: {
    localidad: 'Belén'
  }
});
```

---

### B. `findUnique` — Obtener un registro por campo único o ID
Busca un único registro utilizando un campo que tenga la restricción `@id` (clave primaria) o `@unique`.

* Si lo encuentra: devuelve el **objeto**.
* Si no existe: devuelve **`null`**.

```javascript
// Por ID (clave primaria @id):
const artesano = await prisma.artesano.findUnique({
  where: {
    id: 1
  }
});

// Por campo único (@unique, como dni o email):
const artesanoPorDni = await prisma.artesano.findUnique({
  where: {
    dni: '28123456'
  }
});

// Por identificador UUID con proyección segura 'select' (excluye passwordHash):
const perfilUsuario = await prisma.usuario.findUnique({
  where: { id: usuarioId },
  select: {
    id: true,
    nombre: true,
    email: true
  }
});

// Comprobar si un identificador de token (JTI) está registrado como revocado:
const registroRevocado = await prisma.tokenRevocado.findUnique({
  where: { jti: jti }
});
```

> [!IMPORTANT]
> `findUnique` **solo permite** buscar por campos marcados como identificadores o únicos en el `schema.prisma`. Si intentas buscar por un campo ordinario (ej. `localidad`), Prisma lanzará un error de validación.

---

### C. `findFirst` — Obtener el primer registro que cumpla una condición
A diferencia de `findUnique`, `findFirst` permite buscar por **cualquier campo**, sin importar si es único o no. Retorna el primer registro que coincida con el criterio, o `null` si no encuentra ninguno.

```javascript
// Buscar el primer artesano de un rubro específico
const artesano = await prisma.artesano.findFirst({
  where: {
    rubro: 'Textil'
  }
});
```

---

### D. `count` — Contar registros
Devuelve un número entero indicando cuántas filas coinciden con el criterio (equivalente a `SELECT COUNT(*)`).

```javascript
// Contar todos los artesanos registrados
const total = await prisma.artesano.count();

// Contar con condiciones
const totalTextiles = await prisma.artesano.count({
  where: { rubro: 'Textil' }
});
```

---

## 3. Modificadores y Opciones de Consulta

Prisma permite combinar opciones dentro del argumento del método de búsqueda (`findMany`, `findFirst`, etc.):

### `where` y Operadores de Filtro
Permite aplicar condiciones lógicas complejas similares a la cláusula `WHERE` de SQL:

```javascript
const productos = await prisma.producto.findMany({
  where: {
    // 1. Comparaciones numéricas sobre el precio o stock
    precio: {
      gte: 50000,  // Mayor o igual (>=)
      lte: 500000  // Menor o igual (<=)
      // gt: 50000 (Mayor estricto >)
      // lt: 500000 (Menor estricto <)
      // not: 100000 (Diferente !=)
    },

    // 2. Búsquedas en texto
    nombre: {
      contains: 'Poncho',      // Contiene el texto (LIKE %Poncho%)
      mode: 'insensitive'      // Ignora mayúsculas y minúsculas
      // startsWith: 'Poncho'  (Comienza con)
      // endsWith: 'Vicuña'    (Termina con)
    },

    // 3. Pertenencia a una lista (IN) por artesanoId
    artesanoId: {
      in: [1, 2, 3]
    }
  }
});
```

#### Operadores lógicos (`AND`, `OR`, `NOT`):
```javascript
const artesanos = await prisma.artesano.findMany({
  where: {
    OR: [
      { localidad: 'Belén' },
      { localidad: 'Santa María' },
      { localidad: 'Antofagasta de la Sierra' }
    ]
  }
});
```

---

### `select`: Proyección de columnas
Permite especificar explícitamente cuáles campos devolver (equivalente a `SELECT id, nombre, rubro FROM ...`).

```javascript
const artesanos = await prisma.artesano.findMany({
  select: {
    id: true,
    nombre: true,
    apellido: true,
    rubro: true
    // dni, email, telefono, etc. NO se devuelven
  }
});
```

> [!NOTE]
> No se pueden usar `select` e `include` simultáneamente al mismo nivel en Prisma.

---

### `orderBy`: Ordenamiento
Equivale a la cláusula `ORDER BY` de SQL. Permite ordenar por uno o varios campos:

```javascript
// Orden ascendente (A-Z o de menor a mayor)
const artesanosPorNombre = await prisma.artesano.findMany({
  orderBy: {
    nombre: 'asc' // o 'desc' para descendente
  }
});

// Orden múltiple en productos
const productosOrdenados = await prisma.producto.findMany({
  orderBy: [
    { precio: 'desc' },
    { nombre: 'asc' }
  ]
});
```

---

### `take` y `skip`: Paginación y Límites
Permite limitar la cantidad de resultados devueltos (`LIMIT`) y saltar un número determinado de filas (`OFFSET`):

```javascript
const limite = 5;
const pagina = 2;

const productosPaginados = await prisma.producto.findMany({
  skip: (pagina - 1) * limite, // Salta los primeros 5
  take: limite                 // Toma los siguientes 5
});
```

---

## 4. Métodos de Escritura (Mutaciones CRUD)

### A. `create` — Insertar un nuevo registro
Inserta una nueva fila en la base de datos y devuelve el registro recién creado (incluyendo `id` autogenerado y marcas de tiempo).

```javascript
const nuevoArtesano = await prisma.artesano.create({
  data: {
    nombre: 'María',
    apellido: 'Gómez',
    dni: '28123456',
    email: 'maria.gomez@gmail.com',
    telefono: '3834123456',
    localidad: 'Belén',
    rubro: 'Textil',
    nombreEmprendimiento: 'Tejidos del Valle',
    descripcionTrayectoria: 'Maestra tejedora con más de 25 años de oficio'
  }
});
```

---

### B. `update` — Modificar un registro existente
Modifica un registro localizado mediante un campo único en `where`. Devuelve el objeto actualizado.

```javascript
const artesanoActualizado = await prisma.artesano.update({
  where: {
    id: 1
  },
  data: {
    telefono: '3834999888'
  }
});
```

> [!WARNING]
> Si el registro con ese `id` no existe en la base de datos, `update` **lanza un error** (código `P2025` de Prisma). Por eso es común verificar primero su existencia o dejar que el bloque `try/catch` lo procese.

---

### C. `delete` — Eliminar un registro
Elimina un registro localizado por campo único en `where`. Devuelve el objeto que acaba de ser eliminado.

```javascript
const artesanoEliminado = await prisma.artesano.delete({
  where: {
    id: 1
  }
});
```

> [!WARNING]
> Al igual que `update`, si el registro a eliminar no existe, Prisma arroja una excepción con código `P2025`.

---

### D. `upsert` — Crear o actualizar según exista
Si el registro existe lo actualiza, y si no existe lo inserta en una sola operación atómica.

```javascript
// Caso 1: Actualizar o registrar datos de artesano
const artesano = await prisma.artesano.upsert({
  where: { dni: '28123456' },
  update: {
    telefono: '3834555444'
  },
  create: {
    nombre: 'María',
    apellido: 'Gómez',
    dni: '28123456',
    email: 'maria.gomez@gmail.com',
    localidadId: 1,
    rubro: 'Textil',
    nombreEmprendimiento: 'Tejidos del Valle'
  }
});

// Caso 2: Revocación idempotente de Token JWT (Cierre de sesión):
// Si el JTI ya estaba revocado, actualiza venceEn; si no existía, lo inserta.
await prisma.tokenRevocado.upsert({
  where: { jti: jti },
  create: { jti: jti, venceEn: venceEn },
  update: { venceEn: venceEn }
});
```

---

### E. Operaciones en Lote
Para manipular múltiples registros a la vez:

* **`createMany`**: Inserta varios registros a partir de una lista.
  ```javascript
  await prisma.artesano.createMany({
    data: [
      {
        nombre: 'María',
        apellido: 'Gómez',
        dni: '28123456',
        email: 'maria@gmail.com',
        localidadId: 1,
        rubro: 'Textil',
        nombreEmprendimiento: 'Tejidos Belén'
      },
      {
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        dni: '30456789',
        email: 'carlos@gmail.com',
        localidadId: 2,
        rubro: 'Cerámica',
        nombreEmprendimiento: 'Alfarería Santa María'
      }
    ]
  });
  ```
* **`updateMany`**: Actualiza todos los registros que cumplan una condición.
* **`deleteMany`**: Elimina todos los registros que cumplan una condición (o todos si se deja vacío `where: {}`).
  ```javascript
  // Ejemplo real de tarea programada (purga de tokens expirados en src/services/revocaciones.services.js):
  const resultado = await prisma.tokenRevocado.deleteMany({
    where: {
      venceEn: { lte: new Date() } // 'lte' = Less Than or Equal (<= fecha actual)
    }
  });
  console.log("Tokens vencidos purgados:", resultado.count);
  ```

---

## 5. Mapeo Práctico: De Memoria a Prisma en los Controladores y Servicios

Así es como se transforman los métodos del proyecto con Prisma ORM:

| Acción HTTP | Ruta | Enfoque en Memoria | Con Prisma ORM |
| :--- | :--- | :--- | :--- |
| **GET** | `/artesanos` | `artesanos` | `await prisma.artesano.findMany()` |
| **GET** | `/artesanos/:id` | `artesanos.find(a => a.id === id)` | `await prisma.artesano.findUnique({ where: { id } })` |
| **POST** | `/artesanos` | `artesanos.push(nuevoArtesano)` | `await prisma.artesano.create({ data: { ... } })` |
| **PUT** | `/artesanos/:id` | `artesano.nombre = ...` | `await prisma.artesano.update({ where: { id }, data: { ... } })` |
| **DELETE** | `/artesanos/:id` | `artesanos.splice(indice, 1)` | `await prisma.artesano.delete({ where: { id } })` |
| **GET** | `/usuarios/me` | `usuarios.find(u => u.id === req.usuario.id)` | `await prisma.usuario.findUnique({ where: { id }, select: { id: true, nombre: true, email: true } })` |
| **POST** | `/usuarios/logout` | `tokensRevocados.add(req.usuario.jti)` | `await prisma.tokenRevocado.upsert({ where: { jti }, create: { jti, venceEn }, update: { venceEn } })` |
| **CRON** | *Limpieza cada 1h* | `tokens.filter(t => t.exp > now)` | `await prisma.tokenRevocado.deleteMany({ where: { venceEn: { lte: new Date() } } })` |

---

## 6. Manejo de Respuestas, Valores Nulos y Errores

Al usar Prisma en controladores Express:

1. **Campos numéricos en URL (`req.params`):**
   `req.params.id` siempre es un `string`. PostgreSQL espera un número entero para campos de tipo `Int`:
   ```javascript
   const id = Number(req.params.id);
   ```

2. **Diferencia entre `findUnique` y `update`/`delete` ante registros inexistentes:**
   * `findUnique`: Si el registro no existe, retorna **`null`**. Puedes hacer `if (!artesano) return next(crearError('...', 404));`.
   * `update` / `delete`: Si el registro no existe, lanza un **error de Prisma** (`Record to update not found`). Puedes verificar primero con `findUnique` o capturar el código `error.code === 'P2025'` en el `catch`.

3. **Estructura recomendada en controlador:**
   ```javascript
   export const getArtesanoPorId = async (req, res, next) => {
       try {
           const id = Number(req.params.id);
           const artesano = await prisma.artesano.findUnique({ where: { id } });

           if (!artesano) {
               return next(crearError(`No existe un artesano con id ${id}`, 404));
           }

           res.json(artesano);
       } catch (error) {
           next(error);
       }
   };
   ```

---

## 7. Relaciones en Prisma ORM (1:1, 1:N y N:M)

Las relaciones permiten vincular tablas mediante claves foráneas (*Foreign Keys*). En Prisma, toda relación se modela a través de dos componentes fundamentales:
1. **Campo escalar de clave foránea:** La columna real en la base de datos (ej. `categoriaId Int`).
2. **Campo de relación:** Un campo virtual en el modelo Prisma que representa el objeto o lista relacionada (ej. `categoria Categoria @relation(...)`), el cual no existe como columna física en PostgreSQL pero permite la navegación de datos en Prisma Client.

---

### Sintaxis Base y el Decorador `@relation`

El atributo `@relation` se coloca en el lado que almacena físicamente la clave foránea:

```prisma
@relation(fields: [campoClaveForaneaLocal], references: [campoClavePrimariaDestino])
```

* `fields`: Lista de campos en el modelo actual que guardan la FK.
* `references`: Lista de campos en el modelo de destino a los que apunta la FK (generalmente `id`).
* `onDelete` / `onUpdate`: Comportamiento referencial opcional (`Cascade`, `Restrict`, `SetNull`, `NoAction`).

---

### A. Relación 1 a 1 (Uno a Uno)

Un registro del modelo **A** se asocia exactamente con un registro del modelo **B**. 

* **Ejemplo central en Poncho Digital (Unidad 4 - UNCa):**  
  Una cuenta de `Usuario` se vincula de forma 1 a 1 estricta con su perfil de `Artesano` expositor.
* **Regla clave de Prisma:** La clave foránea **debe tener la restricción `@unique`** para que la base de datos PostgreSQL garantice que ningún artesano comparta usuario (o que ningún stand tenga más de un artesano titular).

```prisma
model Usuario {
  id           String    @id @default(uuid()) @db.Uuid
  nombre       String
  email        String    @unique
  passwordHash String
  activo       Boolean   @default(true)
  artesano     Artesano? // Relación virtual inversa (opcional en el tipo)
}

model Artesano {
  id          Int       @id @default(autoincrement())
  nombre      String
  apellido    String
  dni         String    @unique
  rubro       String
  activo      Boolean   @default(false)
  
  // Clave foránea real en BD con @unique (Garantiza 1 a 1 estricto):
  usuarioId   String    @unique @db.Uuid
  usuario     Usuario   @relation(fields: [usuarioId], references: [id], onDelete: Restrict)
}
```

> [!NOTE]
> En la relación 1 a 1 opcional de stands (`Stand` con `Artesano`), el campo `artesanoId Int? @unique` permite que el stand esté libre (`artesanoId = null`) o asignado a un único artesano a la vez (`onDelete: SetNull`).

---

### B. Relación 1 a N (Uno a Muchos)

Un registro del modelo **A** puede tener asociados múltiples registros del modelo **B**, pero cada registro de **B** pertenece a un único registro de **A**.

* **Ejemplo central de nuestro proyecto (Poncho Digital):**
  - Un `Artesano` registra muchos `Producto`s (`productos Producto[]`).
  - Cada `Producto` pertenece a un único `Artesano` (`artesano Artesano`).

```prisma
model Artesano {
  id        Int        @id @default(autoincrement())
  nombre    String
  apellido  String
  dni       String     @unique
  email     String     @unique
  productos Producto[] // Campo virtual: lista de productos vinculados
}

model Producto {
  id          Int      @id @default(autoincrement())
  nombre      String
  precio      Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  activo      Boolean  @default(true)
  
  // Clave foránea física en la BD:
  artesanoId  Int
  artesano    Artesano @relation(fields: [artesanoId], references: [id], onDelete: Cascade)
}
```

> [!TIP]
> En la relación 1 a N, el lado "Muchos" (`Producto`) contiene el campo escalar `artesanoId` y el `@relation`. El lado "Uno" (`Artesano`) únicamente declara la lista `Producto[]`.

---

### C. Relación N a M (Muchos a Muchos: Implícita y Explícita)

Un registro de **A** puede relacionarse con muchos de **B**, y un registro de **B** puede relacionarse con muchos de **A**. Existen dos formas de implementarlas:

#### 1. Relación N:M Implícita (Manejada automáticamente por Prisma)
Se utiliza cuando **no necesitas guardar datos extra** en la tabla intermedia (como fecha de unión, rol o estado).

* **Concepto de Prisma:** Si dos modelos tienen listas mutuas sin un `@relation(fields: ...)`, Prisma crea y gestiona automáticamente una tabla de unión oculta en PostgreSQL (por ejemplo, `_PabellonToSector` con columnas `A` y `B`).

#### 2. Relación N:M Explícita con Modelo Intermedio (Nuestro caso en Unidad 4: RBAC)
Se utiliza cuando la relación **debe registrar datos adicionales** o cuando se requiere una **clave primaria compuesta** y políticas de integridad referencial estrictas (`onDelete: Cascade` y `onDelete: Restrict`).

* **Aplicación en Poncho Digital (Unidad 4 - UNCa):**  
  Un `Usuario` puede tener múltiples roles (`ARTESANO`, `ADMINISTRADOR`), y un `Rol` agrupa a múltiples usuarios. Para normalizar esto en Tercera Forma Normal (3FN), se modela la entidad intermedia **`UsuarioRol`**:

```prisma
model Usuario {
  id           String       @id @default(uuid()) @db.Uuid
  nombre       String
  email        String       @unique
  passwordHash String
  activo       Boolean      @default(true)
  roles        UsuarioRol[] // Lista de asignaciones
  artesano     Artesano?    // Relación 1:1 con perfil
}

model Rol {
  id       Int          @id @default(autoincrement())
  nombre   String       @unique // "ADMINISTRADOR", "ARTESANO"
  usuarios UsuarioRol[]
}

// Modelo intermedio explícito con clave primaria compuesta
model UsuarioRol {
  usuarioId String  @db.Uuid
  rolId     Int
  usuario   Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  rol       Rol     @relation(fields: [rolId], references: [id], onDelete: Restrict)

  @@id([usuarioId, rolId]) // Evita duplicar un rol para el mismo usuario
}
```

> [!IMPORTANT]
> - `@@id([usuarioId, rolId])`: Clave compuesta que impide físicamente duplicar la asignación de un mismo rol a un usuario.
> - `onDelete: Cascade` en `Usuario`: Si la cuenta se elimina, sus asignaciones de roles se purgan automáticamente.
> - `onDelete: Restrict` en `Rol`: Impide borrar un rol del catálogo si hay usuarios asignados a él.

---

### D. Consultas con Datos Relacionados (`include` y `select`)

Por defecto, Prisma no trae las entidades relacionadas para mantener las consultas ultra rápidas. Para incluirlas (equivalente a un `JOIN`), se utiliza `include`:

#### 1. Obtener registro individual con su objeto relacionado:
```javascript
// GET /productos/:id con los datos de su Artesano
const producto = await prisma.producto.findUnique({
  where: { id: 1 },
  include: {
    artesano: true // Incluye el objeto { id, nombre, apellido, localidad, ... } del artesano
  }
});
```

Resultado retornado:
```json
{
  "id": 1,
  "nombre": "Poncho de Vicuña",
  "descripcion": "Tejido artesanal fino",
  "precio": 450000,
  "stock": 3,
  "artesanoId": 1,
  "artesano": {
    "id": 1,
    "nombre": "María",
    "apellido": "Gómez",
    "localidad": "Belén",
    "rubro": "Textil"
  }
}
```

#### 2. Obtener un artesano con todos sus productos elaborados:
```javascript
// GET /artesanos/:id con la lista completa de sus productos
const artesanoConProductos = await prisma.artesano.findUnique({
  where: { id: 1 },
  include: {
    productos: true // Incluye el arreglo [ { id, nombre, precio, stock, ... }, ... ]
  }
});
```

#### 3. Proyección precisa con `select`:
```javascript
const productosCompactos = await prisma.producto.findMany({
  select: {
    id: true,
    nombre: true,
    precio: true,
    artesano: {
      select: {
        nombre: true,
        apellido: true,
        localidad: true
      }
    }
  }
});
```

#### 4. Filtrar por propiedades del modelo relacionado:
```javascript
// Buscar todos los productos elaborados por artesanos de "Belén"
const productosDeBelen = await prisma.producto.findMany({
  where: {
    artesano: {
      localidad: 'Belén'
    }
  }
});

// En listas 1:N: artesanos que tengan al menos un producto con la palabra 'Poncho'
const artesanosConPonchos = await prisma.artesano.findMany({
  where: {
    productos: {
      some: {
        nombre: { contains: 'Poncho', mode: 'insensitive' }
      }
    }
  }
});
```

---

### E. Escrituras Anidadas (*Nested Writes*: `connect` y `create`)

Prisma permite vincular o crear registros relacionados dentro de la misma operación `create` o `update`:

#### 1. `connect`: Asociar a un registro padre ya existente
```javascript
// Crear un producto y asociarlo a un artesano existente con ID 1
const nuevoProducto = await prisma.producto.create({
  data: {
    nombre: 'Poncho de Vicuña',
    precio: 450000,
    stock: 2,
    artesano: {
      connect: { id: 1 }
    }
  }
});
```

#### 2. `create`: Crear padre e hijos en una sola transacción
```javascript
// Crear un artesano y a su vez su primer producto en la misma operación
const nuevoArtesanoConProducto = await prisma.artesano.create({
  data: {
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    dni: '30456789',
    email: 'carlos@gmail.com',
    localidad: 'Santa María',
    rubro: 'Cerámica',
    nombreEmprendimiento: 'Alfarería Santa María',
    productos: {
      create: [
        {
          nombre: 'Vasija Diaguita',
          precio: 25000,
          stock: 10
        }
      ]
    }
  }
});
```

---

## 8. Migración de Datos: B.D. con Registros Existentes (Estrategia `--create-only`)

> **Contexto de Cátedra (UNCa - Desarrollo Backend - Unidad 4):**
> En entornos reales y proyectos en evolución, los modelos cambian constantemente. Un desafío habitual en la **Unidad 4 (Autorización y RBAC)** es **reemplazar un enum o estructura estática previa por nuevas tablas relacionales (`Rol` y `UsuarioRol`) asegurando la carga de datos semilla y preservando las cuentas ya existentes**.

### El Problema: Cargar datos semilla en la misma migración sin romper integridad

Imaginemos la situación inicial antes de migrar:
* La base de datos PostgreSQL ya contiene cuentas de `Usuario` registradas.
* Modificamos `schema.prisma` incorporando el modelo `Rol` y la tabla intermedia `UsuarioRol`:
  ```prisma
  model Rol {
    id       Int          @id @default(autoincrement())
    nombre   String       @unique // "ADMINISTRADOR", "ARTESANO"
    usuarios UsuarioRol[]
  }

  model UsuarioRol {
    usuarioId String  @db.Uuid
    rolId     Int
    usuario   Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
    rol       Rol     @relation(fields: [rolId], references: [id], onDelete: Restrict)

    @@id([usuarioId, rolId])
  }
  ```

* Si aplicamos una migración directa, las nuevas tablas se crearán vacías. Si intentamos asociar usuarios o iniciar el servidor, el sistema fallará porque los roles requeridos por las reglas de negocio (`ARTESANO` y `ADMINISTRADOR`) aún no existen en la base de datos.

---

### Paso 1: Generar la migración sin aplicarla (sin modificar la B.D.)

Usamos la bandera `--create-only`:

```bash
npx prisma migrate dev --name roles_y_artesano --create-only
```

* **¿Qué hace `--create-only`?** Crea la carpeta y el archivo SQL en `prisma/migrations/<timestamp>_roles_y_artesano/migration.sql`, pero **no ejecuta las instrucciones en PostgreSQL**.
* Esto nos da control total para editar manualmente el script SQL antes de que toque la base de datos.

---

### Paso 2: Adaptar el bloque SQL en `migration.sql` (Carga Semilla)

Abrimos el archivo `migration.sql` generado por Prisma y, al final del script, agregamos la instrucción `INSERT` de los roles del dominio ferial:

```sql
-- Prisma genera automáticamente la tabla Rol y su índice único:
CREATE TABLE "Rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

-- Creación de la tabla intermedia UsuarioRol
CREATE TABLE "UsuarioRol" (
    "usuarioId" UUID NOT NULL,
    "rolId" INTEGER NOT NULL,
    CONSTRAINT "UsuarioRol_pkey" PRIMARY KEY ("usuarioId", "rolId")
);

-- Claves foráneas con integridad referencial:
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_usuarioId_fkey" 
    FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_rolId_fkey" 
    FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- INSTRUCCIÓN AGREGADA MANUALMENTE: Sembrar roles requeridos por la Unidad 4
INSERT INTO "Rol" ("nombre") 
VALUES 
    ('ARTESANO'), 
    ('ADMINISTRADOR');
```

> [!IMPORTANT]
> - La instrucción `INSERT INTO "Rol"` se ejecuta dentro de la misma transacción atómica de la migración.
> - Al terminar de ejecutarse, la tabla `Rol` ya cuenta con los dos roles operativos del sistema (`ARTESANO` y `ADMINISTRADOR`) listos para ser asignados en los registros públicos y de administración.

---

### Paso 3: Aplicar la migración adaptada y regenerar Prisma Client

Una vez guardado el archivo `migration.sql` modificado, ejecutamos:

```bash
# 1. Aplica la migración personalizada a la base de datos PostgreSQL
npx prisma migrate dev

# 2. Regenera el cliente con los nuevos tipos y modelos vigentes
npx prisma generate
```

---

### Paso 4: Comprobación del estado y consistencia en B.D.

1. **Verificar el historial de migraciones:**
   ```bash
   npx prisma migrate status
   ```
   Compara los archivos de migración locales con el registro histórico de la tabla interna `_prisma_migrations` de PostgreSQL. Debe indicar que todas las migraciones están aplicadas y sincronizadas.

2. **Checklist de verificación de datos resultantes:**
   * Existe la tabla `Rol` en PostgreSQL con los registros semilla `'ARTESANO'` y `'ADMINISTRADOR'`.
   * Existe la tabla intermedia `UsuarioRol` con clave primaria compuesta `(usuarioId, rolId)`.
   * La columna `Usuario.activo` (`default(true)`) está presente.
   * La entidad `Artesano` posee relación 1:1 estricta con `Usuario` (`usuarioId @unique @db.Uuid`, `onDelete: Restrict`) y `activo = false` por defecto.
   * Las entidades del predio ferial (`Stand`, `Pabellon`, `Sector`, `Localidad`, `SolicitudPostulacion`, `Producto`) mantienen su integridad referencial.
   * No se perdió ningún dato histórico de usuarios o productos.

---

### Alternativa Ágil: Sincronización Directa con `npx prisma db push`

Además del flujo formal de migraciones versionadas en archivos SQL (`npx prisma migrate dev`), Prisma ofrece el comando **`npx prisma db push`**, diseñado para sincronizar directamente el esquema declarativo (`schema.prisma`) con la base de datos de manera inmediata y sin generar archivos de historial.

#### 1. ¿Qué hace `npx prisma db push`?
* Lee el archivo `schema.prisma`.
* Se conecta a la base de datos configurada (PostgreSQL local o en la nube como Supabase).
* Compara el estado actual de las tablas en PostgreSQL con las definiciones de los modelos en Prisma.
* Ejecuta automáticamente las instrucciones DDL necesarias (`CREATE TABLE`, `ALTER TABLE`, `ADD CONSTRAINT`, etc.) para sincronizar la base de datos con tu esquema.
* **No crea archivos en `prisma/migrations/` ni interactúa con la tabla interna `_prisma_migrations`**.

```bash
# Sincroniza el esquema actual directamente con la base de datos
npx prisma db push
```

---

#### 2. ¿Cuándo usar `prisma db push` vs `prisma migrate dev`?

| Criterio | `npx prisma db push` | `npx prisma migrate dev` |
|---|---|---|
| **Archivos generados** | Ninguno (no genera SQL ni carpetas de historial). | Genera carpetas versionadas con `migration.sql`. |
| **Tabla `_prisma_migrations`** | No la consulta ni la modifica. | Registra cada migración aplicada y calcula su checksum. |
| **Velocidad de iteración** | Ultrarrápido: ideal para iterar modelos y probar relaciones. | Más formal: requiere nombrar cada migración (`--name`). |
| **Bases de datos en la nube (ej. Supabase)** | Excelente para prototipado rápido y entornos de desarrollo personal. | Recomendado para sincronizar cambios estructurados entre miembros de equipo. |
| **Scripts SQL manuales** | No permite insertar SQL personalizado en el proceso de migración. | Permite editar el `migration.sql` (ej. con `--create-only`) para poblar datos. |
| **Entornos de Producción** | No recomendado (no hay trazabilidad ni control estricto). | Se despliega con `npx prisma migrate deploy`. |

---

#### 3. Manejo de Datos Existentes y Flags Útiles de `db push`

Una duda frecuente es si `npx prisma db push` borra los datos existentes. **La respuesta es NO: `db push` preserva todos los registros existentes siempre que los cambios sean compatibles** (por ejemplo: agregar nuevas tablas, agregar campos opcionales `?`, agregar campos con valor por defecto `@default(...)` o modificar índices).

##### Detección de Cambios Destructivos
Si realizas un cambio que provocaría pérdida irreversible de datos (por ejemplo, eliminar o renombrar un modelo/columna con registros cargados, o convertir una columna existente en obligatoria sin `@default`):
1. Prisma **detiene la sincronización inmediatamente**.
2. Muestra una advertencia en color rojo en la terminal indicando exactamente qué datos se perderían.
3. Aborta la operación sin modificar la base de datos a menos que se use una bandera explícita.

##### Flags Disponibles:
```bash
# 1. Ejecución estándar (segura): se aborta ante cualquier riesgo de pérdida de datos
npx prisma db push

# 2. Aceptar explícitamente la pérdida de datos (cuando decides descartar una columna o tabla vieja)
npx prisma db push --accept-data-loss

# 3. Forzar reseteo completo (elimina todas las tablas y datos, recreando el esquema limpio desde cero)
npx prisma db push --force-reset
```

> [!TIP]
> **Paso obligatorio posterior:**  
> Cada vez que sincronices con `npx prisma db push`, debes actualizar el cliente generado para que tu código JavaScript cuente con los nuevos tipos y modelos:
> ```bash
> npx prisma generate
> ```

---

## 9. Consumo de Consultas SQL Puras (*Raw SQL*) en Prisma

Aunque Prisma Client resuelve la inmensa mayoría de las consultas mediante sus métodos CRUD, existen escenarios donde se requiere ejecutar **SQL nativo directo**:
* Reportes analíticos con agrupaciones complejas (`HAVING`, subconsultas, `UNION`).
* Uso de funciones de ventana (*Window Functions* como `ROW_NUMBER()`, `RANK()`).
* Extensiones especializadas de PostgreSQL (ej. búsqueda fonética con `pg_trgm`, operadores geométricos PostGIS o tipos `JSONB` avanzados).
* Actualizaciones o eliminaciones masivas basadas en condiciones complejas no soportadas directamente por el API del ORM.

Prisma ofrece dos métodos principales a través del cliente: `$queryRaw` y `$executeRaw`.

---

### A. `$queryRaw`: Consultas de Lectura (`SELECT`)

Se utiliza para consultas que **devuelven filas de datos**. Retorna siempre una `Promise` que resuelve a un **arreglo de objetos JavaScript** (`Array<Object>`), donde cada clave corresponde al nombre de la columna en PostgreSQL.

```javascript
import { prisma } from '../db.js';

// 1. Consulta SQL básica
const todosLosEventos = await prisma.$queryRaw`
  SELECT id, nombre, "categoriaId" 
  FROM "Evento"
  ORDER BY id ASC
`;

// 2. Consulta con filtrado por parámetro
const idBuscado = 1;
const evento = await prisma.$queryRaw`
  SELECT e.id, e.nombre, c.nombre AS "categoriaNombre"
  FROM "Evento" e
  INNER JOIN "Categoria" c ON e."categoriaId" = c.id
  WHERE e.id = ${idBuscado}
`;
```

---

### B. Seguridad y Prevención Automática de Inyecciones SQL

Una de las mayores ventajas de `$queryRaw` en Prisma es el uso de **Tagged Template Literals** (plantillas etiquetadas de JavaScript).

```javascript
const nombreUsuario = req.query.nombre; // Posible input malicioso

// 100% SEGURO: Prisma NO concatena strings
const resultado = await prisma.$queryRaw`
  SELECT * FROM "Evento" WHERE nombre = ${nombreUsuario}
`;
```

#### ¿Cómo protege Prisma contra SQL Injection?
Prisma intercepta las variables dentro de `${...}` y las transforma en **consultas preparadas parametrizadas** (`parameterized queries` de PostgreSQL):

$$\text{SQL enviado a Postgres} \rightarrow \texttt{SELECT * FROM "Evento" WHERE nombre = \$1}$$
$$\text{Parámetros seguros} \rightarrow [\texttt{"' OR '1'='1" }]$$

El motor de base de datos trata el valor estrictamente como un dato literal, neutralizando cualquier intento de inyección de código SQL.

---

### C. `$executeRaw`: Modificaciones Masivas y DDL

Se utiliza para operaciones que **NO retornan filas**, como sentencias `INSERT`, `UPDATE`, `DELETE` o comandos de definición de datos (`DDL`).

* Devuelve un **número entero** (`number`) indicando la **cantidad de filas afectadas** por la instrucción.

```javascript
// Actualizar el estado de múltiples eventos anteriores a una fecha
const fechaLimite = new Date('2026-01-01');

const filasAfectadas = await prisma.$executeRaw`
  UPDATE "Evento"
  SET "nombre" = CONCAT('[Cerrado] ', "nombre")
  WHERE "createdAt" < ${fechaLimite}
`;

console.log(`Se actualizaron ${filasAfectadas} eventos.`);
```

---

### D. Variantes Unsafe (`$queryRawUnsafe` y `$executeRawUnsafe`)

Prisma también provee `$queryRawUnsafe` y `$executeRawUnsafe`. Estas funciones reciben un `string` plano en lugar de un template literal:

```javascript
// RIESGOSO si se concatena manualmente:
const consulta = `SELECT * FROM "Evento" WHERE id = ` + req.params.id; // ¡VULNERABLE A SQL INJECTION!
const resultado = await prisma.$queryRawUnsafe(consulta);
```

#### ¿Cuándo es válido usar `Unsafe`?
Únicamente cuando necesitas construir partes dinámicas de la consulta que PostgreSQL no permite como parámetros (por ejemplo, el nombre dinámico de una tabla o una columna en una cláusula `ORDER BY`):

```javascript
// Forma segura con parámetros posicionales:
const columnaOrden = 'nombre'; // Validada previamente contra una whitelist
const idCategoria = 2;

const resultado = await prisma.$queryRawUnsafe(
  `SELECT * FROM "Evento" WHERE "categoriaId" = $1 ORDER BY "${columnaOrden}" ASC`,
  idCategoria
);
```

> [!WARNING]
> Siempre que sea posible, **prioriza `$queryRaw` y `$executeRaw`** con tagged template literals. Solo recurre a las versiones `Unsafe` si tienes una lista blanca estricta de valores y pasando los datos mediante parámetros posicionales `$1, $2, ...`.

---

### E. Manejo de Tipos Especiales (BigInt en PostgreSQL)

Cuando ejecutas consultas nativas que devuelven columnas `BIGINT` o funciones de conteo `COUNT(*)` en PostgreSQL, el driver de base de datos las mapea al tipo primitivo `BigInt` de JavaScript (ej. `10n`).

JavaScript estándar **no puede serializar `BigInt` a JSON** con `JSON.stringify()` (arrojando un error: `TypeError: Do not know how to serialize a BigInt`).

#### Solución recomendada en controladores Express:
```javascript
// Convertir BigInt a Number o String antes de enviarlo en res.json()
const conteo = await prisma.$queryRaw`SELECT COUNT(*)::int AS total FROM "Evento"`;
res.json({ total: conteo[0].total });

// O convertirlo manualmente si viene como BigInt:
const total = Number(conteo[0].total);
```

---

## 10. Tabla Resumen Rápida de Métodos y Operaciones

| Método Prisma | Propósito | ¿Qué devuelve si no hay coincidencias? | Consideraciones clave |
|---|---|:---:|---|
| `findMany()` | Lista múltiples registros | `[]` (Arreglo vacío) | Soporta `where`, `include`, `select`, `orderBy`, `take`, `skip` |
| `findUnique()` | Busca un único registro por ID o clave única | `null` | Solo acepta campos `@id` o `@unique` en `where` |
| `findFirst()` | Primer registro coincidente con una condición | `null` | Permite buscar por cualquier campo ordinario |
| `count()` | Cantidad total de registros coincidentes | `0` | Equivale a `SELECT COUNT(*)` |
| `create()` | Inserta un nuevo registro | Lanza excepción si falla | Soporta escrituras anidadas con `connect` y `create` |
| `update()` | Modifica un registro existente | Lanza error (`P2025`) si no existe | Requiere campo único en `where` |
| `delete()` | Elimina un registro existente | Lanza error (`P2025`) si no existe | Requiere campo único en `where` |
| `upsert()` | Actualiza si existe, crea si no | Siempre retorna el registro | Operación atómica indivisible |
| `createMany()` | Inserción en lote de múltiples registros | Objeto `{ count: n }` | No soporta `include` ni escrituras anidadas |
| `updateMany()` | Actualización masiva de registros | Objeto `{ count: n }` | No valida existencia previa |
| `deleteMany()` | Eliminación masiva de registros | Objeto `{ count: n }` | Borra todo si `where: {}` está vacío |
| `$queryRaw\`...\`` | Ejecuta SQL `SELECT` puro | `[]` (Arreglo vacío) | Protege automáticamente contra SQL Injection |
| `$executeRaw\`...\`` | Ejecuta SQL `UPDATE/DELETE/INSERT` | `0` (Filas afectadas) | Retorna la cantidad entera de filas modificadas |

---

### Resumen de Comandos de Sincronización y CLI

| Comando CLI | Propósito principal | ¿Preserva datos? | ¿Genera archivos `.sql`? |
|---|---|:---:|:---:|
| `npx prisma db push` | Sincroniza directamente el esquema con la base de datos | Sí (advierte si hay cambios destructivos) | No |
| `npx prisma migrate dev --name <nombre>` | Crea y aplica una nueva migración versionada con historial SQL | Sí | Sí (`prisma/migrations/`) |
| `npx prisma migrate dev --create-only` | Genera el archivo SQL para edición manual sin aplicarlo a la B.D. | Sí (no toca la B.D.) | Sí |
| `npx prisma migrate deploy` | Aplica migraciones pendientes en entornos de staging / producción | Sí | No (solo lee las existentes) |
| `npx prisma migrate reset` | Destruye la base de datos y reaplica todas las migraciones desde cero | **No (Borra todo)** | No |
| `npx prisma generate` | Regenera Prisma Client a partir del archivo `schema.prisma` | N/A (no toca la B.D.) | No |
| `npx prisma studio` | Abre panel visual interactivo en el navegador (`localhost:5555`) | N/A (interfaz gráfica) | No |



---


# Parte 5: Guía Completa: Zod — Validación de Datos en JavaScript

# Guía Completa: Zod — Validación de Datos en JavaScript

Este documento explica qué es Zod, cómo funciona internamente, y cómo lo utilizamos en nuestra API Poncho Digital para validar los datos que envía el cliente.

---

## Índice
1. [¿Qué es Zod?](#qué-es-zod)
2. [¿Por qué usar Zod?](#por-qué-usar-zod)
3. [Instalación](#instalación)
4. [Concepto Fundamental: ¿Qué es un Esquema?](#concepto-fundamental-qué-es-un-esquema)
5. [Tipos Primitivos](#tipos-primitivos)
6. [Métodos de Transformación y Restricción](#métodos-de-transformación-y-restricción)
7. [Opcionalidad y Nulabilidad](#opcionalidad-y-nulabilidad)
8. [Esquemas de Objetos (`z.object`)](#esquemas-de-objetos-zobject)
9. [Validación: `.parse()` vs `.safeParse()`](#validación-parse-vs-safeparse)
10. [Estructura de Errores de Zod](#estructura-de-errores-de-zod)
11. [Cómo lo usamos en la API de Poncho Digital](#cómo-lo-usamos-en-la-api-de-poncho-digital)
12. [Referencia Rápida de Métodos](#referencia-rápida-de-métodos)
13. [Errores Comunes y Soluciones](#errores-comunes-y-soluciones)

---

## ¿Qué es Zod?

**Zod** es una librería de validación de datos para JavaScript y TypeScript. Su propósito es definir **esquemas** (contratos) que describen qué forma deben tener los datos, y luego verificar que los datos recibidos cumplan esas reglas.

Pensá en Zod como un **guardia de seguridad** en la puerta de entrada de tu API: revisa cada dato que llega y solo deja pasar lo que cumple con las reglas definidas.

### Analogía:
```
Sin Zod:                              Con Zod:
┌─────────────┐                       ┌─────────────┐
│   Cliente    │                       │   Cliente    │
│  envía body  │                       │  envía body  │
└──────┬──────┘                       └──────┬──────┘
       │                                      │
       ▼                                      ▼
┌──────────────┐                      ┌──────────────┐
│ Controlador  │ ← recibe datos       │    ZOD       │ ← valida y limpia
│ (sin validar)│   crudos/erróneos    │  (esquema)   │   los datos
└──────────────┘                      └──────┬──────┘
                                              │ (datos limpios)
                                              ▼
                                      ┌──────────────┐
                                      │ Controlador  │
                                      │ (datos OK)   │
                                      └──────────────┘
```

---

## ¿Por qué usar Zod?

### Antes (validación manual):
```javascript
export const validarProducto = (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
        return next(crearError('El cuerpo debe ser un objeto JSON', 400));
    }
    if (typeof req.body.nombre !== 'string' || req.body.nombre.trim() === '') {
        return next(crearError('El nombre es obligatorio', 400));
    }
    if (typeof req.body.precio !== 'number' || req.body.precio <= 0) {
        return next(crearError('El precio debe ser un número positivo', 400));
    }
    // ... y así con cada campo, anidando if tras if
    req.body.nombre = req.body.nombre.trim();
    next();
};
```

### Ahora (con Zod):
```javascript
const schema = z.object({
    nombre: z.string().trim().min(1),
    precio: z.number().positive(),
    artesanoId: z.number().int().positive()
});

const resultado = schema.safeParse(req.body);
// resultado.data ya tiene los datos limpios
```

**Ventajas:**
- **Menos código:** Una sola declaración reemplaza decenas de `if`.
- **Más legible:** Las reglas se leen como una descripción en inglés.
- **Transformación automática:** `.trim()` limpia los espacios sin código extra.
- **Errores detallados:** Zod genera mensajes descriptivos automáticamente con el nombre del campo y la regla que falló.

---

## Instalación

```bash
npm install zod@4.4.3 --save-exact
```

Usamos `--save-exact` para fijar la versión exacta y evitar que una actualización automática rompa algo.

### Importación en los archivos:
```javascript
import { z } from "zod";
```

`z` es el objeto principal de Zod. Todo se accede desde él: `z.string()`, `z.number()`, `z.object()`, etc.

---

## Concepto Fundamental: ¿Qué es un Esquema?

Un **esquema** es un contrato que describe la forma exacta que deben tener los datos. Es como un molde: si los datos encajan en el molde, pasan; si no, Zod te dice exactamente dónde y por qué fallaron.

```javascript
// El esquema es la DEFINICIÓN de las reglas
const esquema = z.string().min(3);

// safeParse es la VERIFICACIÓN de un dato contra esas reglas
esquema.safeParse("Hola");    // [OK] { success: true, data: "Hola" }
esquema.safeParse("Hi");      // [Error] { success: false, error: ... }
esquema.safeParse(123);       // [Error] { success: false, error: ... }
```

> [!IMPORTANT]
> Un esquema **no modifica** los datos originales. Devuelve una copia validada (y opcionalmente transformada) en `resultado.data`.

---

## Tipos Primitivos

Zod soporta todos los tipos básicos de JavaScript:

### `z.string()` — Cadenas de texto
```javascript
z.string();   // Solo acepta strings

// Ejemplos:
z.string().safeParse("Hola");   // [OK]
z.string().safeParse(123);      // [Error] expected string, received number
z.string().safeParse(null);     // [Error] expected string, received null
```

### `z.number()` — Números
```javascript
z.number();   // Solo acepta números (enteros o decimales)

// Ejemplos:
z.number().safeParse(42);       // [OK]
z.number().safeParse(3.14);     // [OK]
z.number().safeParse("42");     // [Error] expected number, received string
```

### `z.boolean()` — Booleanos
```javascript
z.boolean();   // Solo acepta true o false

// Ejemplos:
z.boolean().safeParse(true);    // [OK]
z.boolean().safeParse("true");  // [Error] expected boolean, received string
```

### `z.date()` — Fechas
```javascript
z.date();   // Solo acepta instancias de Date

// Ejemplo:
z.date().safeParse(new Date());   // [OK]
z.date().safeParse("2024-01-01"); // [Error] expected date, received string
```

---

## Métodos de Transformación y Restricción

Los métodos se encadenan después del tipo base para agregar reglas adicionales:

### Para Strings:

| Método | Qué hace | Ejemplo |
|---|---|---|
| `.trim()` | Elimina espacios al inicio y final | `"  Hola  "` → `"Hola"` |
| `.min(n)` | Mínimo `n` caracteres (después de trim si se usó) | `.min(1)` → no puede estar vacío |
| `.max(n)` | Máximo `n` caracteres | `.max(100)` → hasta 100 caracteres |
| `.email()` | Debe ser un email válido | `"user@mail.com"` [OK] |
| `.url()` | Debe ser una URL válida | `"https://..."` [OK] |
| `.regex(pattern)` | Debe cumplir una expresión regular | `.regex(/^[A-Z]/)` |
| `.includes(str)` | Debe contener el substring | `.includes("@")` |
| `.startsWith(str)` | Debe empezar con | `.startsWith("http")` |

### Para Numbers:

| Método | Qué hace | Ejemplo |
|---|---|---|
| `.int()` | Debe ser entero (sin decimales) | `42` [OK], `3.14` [Error] |
| `.positive()` | Debe ser mayor a 0 | `1` [OK], `0` [Error], `-5` [Error] |
| `.nonnegative()` | Debe ser 0 o mayor | `0` [OK], `-1` [Error] |
| `.min(n)` | Valor mínimo | `.min(1000)` → año mínimo |
| `.max(n)` | Valor máximo | `.max(2026)` → año máximo |

### Ejemplo encadenado:
```javascript
// "El título debe ser un string, sin espacios en los bordes, con al menos 1 carácter"
z.string().trim().min(1)

// Lectura: string → trim → min(1)
// Primero verifica que sea string
// Luego le aplica trim (elimina espacios)
// Finalmente verifica que tenga al menos 1 carácter DESPUÉS del trim
```

> [!TIP]
> **El orden importa.** Si ponés `.trim()` antes de `.min(1)`, el string `"   "` (solo espacios) primero se convierte en `""` y luego falla el `.min(1)`. Esto es lo que queremos: que un campo con solo espacios sea rechazado.

---

## Opcionalidad y Nulabilidad

### `.optional()` — El campo puede no existir
```javascript
const schema = z.object({
    anio: z.number().optional()
});

schema.safeParse({});            // [OK] { data: {} }              — sin el campo
schema.safeParse({ anio: 2024 });// [OK] { data: { anio: 2024 } }  — con el campo
schema.safeParse({ anio: null });// [Error] — null NO es lo mismo que "no estar"
```

### `.nullable()` — El campo puede ser `null`
```javascript
const schema = z.object({
    anio: z.number().nullable()
});

schema.safeParse({ anio: null }); // [OK] { data: { anio: null } }
schema.safeParse({});             // [Error] — el campo es obligatorio, pero acepta null como valor
```

### `.optional().nullable()` — Puede no existir O ser `null`
```javascript
const schema = z.object({
    anio: z.number().int().positive().optional().nullable()
});

schema.safeParse({});               // [OK] no viene el campo
schema.safeParse({ anio: null });   // [OK] viene como null
schema.safeParse({ anio: 2024 });   // [OK] viene con valor válido
schema.safeParse({ anio: -5 });     // [Error] no es positive
schema.safeParse({ anio: "2024" }); // [Error] no es number
```

> [!IMPORTANT]
> **Diferencia clave entre `optional` y `nullable`:**
> - `optional()`: El campo puede **no estar presente** en el objeto (undefined).
> - `nullable()`: El campo **está presente** pero su valor es `null`.
> - En la práctica, para campos de base de datos que admiten NULL, usamos ambos: `.optional().nullable()`.

---

## Esquemas de Objetos (`z.object`)

Para validar un body JSON completo, definimos un esquema de objeto:

```javascript
const crearProductoSchema = z.object({
    nombre:      z.string().trim().min(1),
    descripcion: z.string().trim().min(1).optional().nullable(),
    precio:      z.number().positive(),
    stock:       z.number().int().nonnegative().optional(),
    artesanoId:  z.number().int().positive()
});
```

### ¿Qué valida esto?

```javascript
// [OK] Caso exitoso completo
crearProductoSchema.safeParse({
    nombre: "  Poncho de Vicuña  ",
    descripcion: "Tejido artesanal tradicional",
    precio: 450000,
    stock: 3,
    artesanoId: 1
});
// Resultado: { success: true, data: { nombre: "Poncho de Vicuña", descripcion: "Tejido artesanal tradicional", precio: 450000, stock: 3, artesanoId: 1 } }
// Nota: "nombre" salió sin espacios gracias al .trim()

// [OK] Sin descripción ni stock (son opcionales)
crearProductoSchema.safeParse({
    nombre: "Ruanas Norteñas",
    precio: 85000,
    artesanoId: 2
});
// Resultado: { success: true, data: { nombre: "Ruanas Norteñas", precio: 85000, artesanoId: 2 } }

// [Error] Nombre vacío
crearProductoSchema.safeParse({
    nombre: "   ",
    precio: 10000,
    artesanoId: 1
});
// Resultado: { success: false, error: { issues: [{ path: ["nombre"], message: "Too small..." }] } }

// [Error] Precio inválido o negativo
crearProductoSchema.safeParse({
    nombre: "Mate de Palo Santo",
    precio: -500,
    artesanoId: 1
});
// Resultado: { success: false, error: { issues: [{ path: ["precio"], message: "Number must be greater than 0" }] } }
```

---

## Validación: `.parse()` vs `.safeParse()`

Zod ofrece dos formas de validar datos:

### `.parse()` — Lanza una excepción si falla
```javascript
try {
    const datos = schema.parse(req.body); // [OK] devuelve los datos validados
    console.log(datos);
} catch (error) {
    console.error(error.issues); // [Error] hay que usar try/catch
}
```

### `.safeParse()` — Devuelve un resultado sin lanzar excepciones
```javascript
const resultado = schema.safeParse(req.body);

if (!resultado.success) {
    // [Error] resultado.error contiene los detalles
    console.log(resultado.error.issues);
} else {
    // [OK] resultado.data contiene los datos validados y limpios
    console.log(resultado.data);
}
```

> [!TIP]
> **Usamos `.safeParse()` en nuestra API** porque nos permite manejar el error de forma controlada con `next(crearError(...))` sin necesidad de un bloque `try/catch` adicional. Es más predecible y limpio.

---

## Estructura de Errores de Zod 4

Cuando `.safeParse()` falla, `resultado.error` contiene una instancia de `ZodError` con un array de `issues`. Cada issue describe con precisión técnica el problema detectado:

```javascript
const resultado = schema.safeParse({ nombre: "", precio: -10, artesanoId: 1 });

// resultado.error.issues en Zod 4:
[
    {
        origin: "string",                                    // Origen del tipo de dato (Zod 4)
        code: "too_small",                                   // Tipo de regla que falló
        minimum: 1,                                          // Valor mínimo esperado
        inclusive: true,
        path: ["nombre"],                                    // Array con la ruta al campo
        message: "El nombre no puede estar vacío"             // Mensaje de error
    },
    {
        origin: "number",
        code: "too_small",
        minimum: 0,
        inclusive: false,
        path: ["precio"],
        message: "El precio debe ser mayor a 0"
    }
]
```

### Formateador Limpio: `detallarErroresZod` (`src/utils/ErroresZod.js`)

Para no enviar toda la verbosidad de Zod al cliente ni concatenar textos difíciles de parsear, creamos una función utilitaria que transforma los `issues` en un array plano de objetos `{ path, message }`:

```javascript
// src/utils/ErroresZod.js
export const detallarErroresZod = (ZodError) =>
    ZodError.issues.map((issue) => ({
        path: issue.path.join('.') || null,
        message: issue.message,
    }));
```

Cuando un cliente envía datos inválidos, el cliente HTTP recibe:

```json
{
  "error": "Error en los parámetros del producto",
  "details": [
    {
      "path": "nombre",
      "message": "El nombre no puede estar vacío"
    },
    {
      "path": "precio",
      "message": "El precio debe ser mayor a 0"
    }
  ]
}
```

---

## Cómo lo usamos en la API de Poncho Digital

### Paso 1: Definir los esquemas en `src/validators/producto.schemas.js`

Los esquemas van en una carpeta separada (`validators/`) para mantenerlos independientes de Express, aprovechando la sintaxis moderna de **Zod 4**:

```javascript
import { z } from "zod";

export const crearProductoSchema = z.object({
  nombre: z.string("El campo 'nombre' es obligatorio")
    .trim()
    .min(1, "El nombre no puede estar vacío"),
  descripcion: z.string().trim().min(1).optional().nullable(),
  precio: z.coerce.number("El campo 'precio' es obligatorio")
    .positive("El precio debe ser mayor a 0"),
  stock: z.coerce.number().int().nonnegative().optional().default(0),
  artesanoId: z.coerce.number("El 'artesanoId' es obligatorio para asociar el producto")
    .int()
    .positive()
});

export const actualizarProductoSchema = z.object({
  nombre: z.string("El campo 'nombre' es obligatorio")
    .trim()
    .min(1, "El nombre no puede estar vacío"),
  descripcion: z.string().trim().min(1).optional().nullable(),
  precio: z.coerce.number("El campo 'precio' es obligatorio")
    .positive("El precio debe ser mayor a 0"),
  stock: z.coerce.number().int().nonnegative("El stock no puede ser negativo").optional(),
  artesanoId: z.coerce.number("El 'artesanoId' debe ser un número válido")
    .int()
    .positive()
    .optional()
});

// En src/validators/comun.schemas.js:
export const idParamSchema = z.object({
  id: z.coerce.number("El ID debe ser un número")
    .int("El ID debe ser un número entero")
    .positive("El ID debe ser un número entero positivo")
});

// En src/validators/producto.schemas.js:
export const obtenerProductosSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  nombre: z.string().trim().min(1).optional(),
  descripcion: z.string().trim().min(1).optional().nullable(),
  precio: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  artesanoId: z.coerce.number().int().positive().optional(),
  ordenarPor: z.enum(["id", "nombre", "precio", "stock", "artesanoId"]).default("nombre"),
  direccion: z.enum(["asc", "desc"]).default("asc"),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(50).default(10)
});
```

### Paso 2: Crear el middleware genérico de validación (`src/middlewares/validarSchema.js`)

En lugar de crear middlewares duplicados para cada tabla o cada propiedad (`body`, `params`, `query`), implementamos una **función fábrica** de middleware que evalúa cualquier esquema de Zod contra la fuente de datos elegida, asegurando además **100% de compatibilidad con las nomenclaturas de la cátedra UNCa**:

```javascript
import { crearError } from '../utils/crearError.js';
import { detallarErroresZod } from '../utils/ErroresZod.js';

// Middleware universal para validar datos (body, params o query) con Zod
export const validarSchema = (schema, origen) => (req, res, next) => {
    const datos = req[origen] ?? {};
    const resultado = schema.safeParse(datos);

    if (!resultado.success) { 
        const detalles = detallarErroresZod(resultado.error);
        return next(crearError(`Error en los parámetros de ${origen}`, 400, detalles));
    }

    if (origen === 'query') {
        req.consulta = resultado.data; // Almacena los filtros/paginación limpios y tipados
    } else {
        req[origen] = resultado.data; // Almacena el body o params limpio y tipado
    }

    // Compatibilidad total con la nomenclatura de la cátedra UNCa
    if (origen === 'body') {
        req.bodyValidado = resultado.data;
    }
    if (origen === 'params') {
        req.parametrosValidados = resultado.data;
    }

    next();
};

// Atajos que usa la cátedra en sus diapositivas
export const validarBody = (schema) => validarSchema(schema, 'body');
export const validarParametros = (schema) => validarSchema(schema, 'params');
```

### Paso 3: Conectar en las rutas (`producto.routes.js`)

Conectamos el middleware `validarSchema` pasándole el esquema correspondiente y el origen (`'query'`, `'params'` o `'body'`):

```javascript
import { Router } from "express";
import {
    getProductos,
    getProductoPorId,
    createProducto,
    updateProducto,
    deleteProducto,
    deleteProductoLogico
} from '../controllers/producto.controllers.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import {
    crearProductoSchema,
    actualizarProductoSchema,
    idParamSchema,
    obtenerProductosSchema
} from '../validators/producto.schemas.js';

const router = Router();

router.get('/', validarSchema(obtenerProductosSchema, 'query'), getProductos);
router.get('/:id', validarSchema(idParamSchema, 'params'), getProductoPorId);
router.post('/', validarSchema(crearProductoSchema, 'body'), createProducto);
router.put('/:id', validarSchema(idParamSchema, 'params'), validarSchema(actualizarProductoSchema, 'body'), updateProducto);
router.delete('/:id', validarSchema(idParamSchema, 'params'), deleteProducto);
router.patch('/:id', validarSchema(idParamSchema, 'params'), deleteProductoLogico);
```

### Paso 4: Transferir los datos como DTO al Servicio (`producto.controllers.js` y `producto.services.js`)

Como el middleware ya sanitizó y validó los datos en `req.body`, el controlador los toma como un **DTO** y delega la operación al servicio:

```javascript
// src/controllers/producto.controllers.js
export const createProducto = async (req, res, next) => {
    try {
        const crearProductoDto = req.body; // DTO validado por Zod
        const nuevoProducto = await crearProducto(crearProductoDto);
        return res.status(201).json(nuevoProducto);
    } catch (error) {
        return next(error);
    }
};
```

```javascript
// src/services/producto.services.js
export const crearProducto = async (crearProductoDto) => {
    // Aplica reglas de negocio y persiste mediante Prisma Client
    return prisma.producto.create({ data: { ... } });
};
```

### Flujo completo:
```
Cliente envía POST /productos con body: { nombre: "  Poncho  ", precio: 150000, artesanoId: 1 }
        │
        ▼
┌──────────────────┐
│  validarProducto │  ← middleware (Zod)
│                  │
│  1. safeParse()  │  ← Comprueba tipos y normaliza con .trim()
│  2. ¿success?    │
│     [OK] → next()  │  ← Guarda en req.body los datos limpios: { nombre: "Poncho", ... }
│     [Error] → 400     │  ← Corta con next(crearError(...))
└────────┬─────────┘
         │ [OK]
         ▼
┌───────────────────────────┐
│  createProducto           │  ← controlador (gestiona HTTP)
│  crearProductoDto=req.body│  ← transfiere datos como DTO
│  crearProductoService(dto)│
└────────┬──────────────────┘
         │
         ▼
┌───────────────────────────┐
│  crearProducto (servicio) │  ← servicio (reglas de negocio + persistencia)
│  prisma.producto.create() │  ← único componente que habla con Prisma
└───────────────────────────┘
```

### Caso Especial: Validación de Claims JWT en Capa de Servicios (`token.services.js`)

Zod no solo se utiliza como middleware en los endpoints HTTP, sino también como mecanismo de **defensa en profundidad** dentro de la capa de servicios para verificar la integridad de las cargas útiles (*claims*) de tokens criptográficos:

```javascript
// src/services/token.services.js
import { z } from "zod";
import jwt from "jsonwebtoken";

export const verificarToken = (token) => {
    const payload = jwt.verify(token, secretoJWT, { algorithms: ["HS256"] });

    // Zod valida en tiempo de ejecución que el subject sea estrictamente un UUID v4
    if (typeof payload !== "object" || payload === null ||
        !z.uuid().safeParse(payload.sub).success ||
        !Number.isFinite(payload.exp)) {
        throw new jwt.JsonWebTokenError("Contenido del token inválido.");
    }

    if (typeof payload.jti !== "string" || !payload.jti.trim()) {
        throw new jwt.JsonWebTokenError("Falta el identificador del token.");
    }

    return { id: payload.sub, jti: payload.jti, exp: payload.exp };
};
```

Esto garantiza que ningún token alterado o malformado pueda inyectar identificadores incompatibles en las consultas de Prisma o en `req.usuario`.

---

## Referencia Rápida de Métodos

### Tipos base
| Método | Tipo que acepta |
|---|---|
| `z.string()` | Cadenas de texto |
| `z.number()` | Números |
| `z.boolean()` | true / false |
| `z.date()` | Instancias de Date |
| `z.object({...})` | Objetos con estructura definida |
| `z.array(schema)` | Arrays de un tipo específico |
| `z.enum([...])` | Solo valores específicos (ej: `z.enum(["activo", "inactivo"])`) |

### Modificadores de tipo
| Método | Efecto |
|---|---|
| `.optional()` | El campo puede no estar presente |
| `.nullable()` | El campo puede ser `null` |
| `.optional().nullable()` | Puede no estar o ser `null` |

### Restricciones de string
| Método | Efecto |
|---|---|
| `.trim()` | Elimina espacios al inicio y final |
| `.min(n)` | Mínimo `n` caracteres |
| `.max(n)` | Máximo `n` caracteres |
| `.email()` | Formato de email válido |
| `.url()` | Formato de URL válido |
| `.regex(patron)` | Debe cumplir la regex |

### Restricciones de number
| Método | Efecto |
|---|---|
| `.int()` | Debe ser entero |
| `.positive()` | Mayor que 0 |
| `.nonnegative()` | Mayor o igual que 0 |
| `.min(n)` | Valor mínimo |
| `.max(n)` | Valor máximo |

### Validación
| Método | Comportamiento ante error |
|---|---|
| `.parse(data)` | Lanza excepción (necesita try/catch) |
| `.safeParse(data)` | Devuelve `{ success, data/error }` |

---

## Errores Comunes y Soluciones

### 1. "Invalid input: expected string, received undefined"
**Causa:** El campo es obligatorio pero no fue enviado en el body.  
**Solución:** Si el campo debería ser opcional, agregá `.optional()` al esquema.

### 2. "Too small: expected string to have >=1 characters"
**Causa:** El string está vacío o solo tiene espacios (después de `.trim()`).  
**Solución:** Asegurate de enviar un valor no vacío para ese campo.

### 3. "Invalid input: expected number, received string"
**Causa:** Se envió `"1605"` (string) en vez de `1605` (número).  
**Solución:** Asegurate de que el JSON del body tenga el tipo correcto. Si necesitás aceptar strings numéricos, usá `z.coerce.number()` en vez de `z.number()`:
```javascript
// z.coerce.number() convierte "450000" → 450000 automáticamente
precio: z.coerce.number().positive()
```

### 4. "Expected object, received null"
**Causa:** El body de la petición llegó como `null` (por ejemplo, si no se envió `Content-Type: application/json`).  
**Solución:** Verificar que el cliente envíe el header `Content-Type: application/json`.

### 5. Campos extra que no están en el esquema
**Comportamiento por defecto:** Zod los ignora (los excluye de `resultado.data`). Esto es seguro porque el controlador solo recibe los campos definidos.  
**Si querés rechazarlos:** Usá `.strict()`:
```javascript
const schema = z.object({
    nombre: z.string(),
    precio: z.number()
}).strict(); // [Error] rechaza campos que no estén en el esquema
```


---


# Parte 6: Guía Detallada: Middlewares y Utilidades

# Guía Detallada: Middlewares y Utilidades
### API Poncho Digital — Cátedra Desarrollo Backend (UNCa)

Este documento explica en profundidad el funcionamiento, la lógica interna y las mejores prácticas de cada uno de los middlewares y utilidades (`utils`) creados para la API **Poncho Digital**.

---

## Índice
1. [¿Qué es un Middleware en Express?](#qué-es-un-middleware-en-express)
2. [1. Logger de Peticiones (`logger.js`)](#1-logger-de-peticiones-loggerjs)
3. [2. Validador Universal con Zod (`validarSchema.js`)](#2-validador-universal-con-zod-validarschemajs)
4. [3. Autenticación JWT y Revocaciones (`autenticarUsuario.js`)](#3-autenticación-jwt-y-revocaciones-autenticarusuariojs)
5. [4. Autorización y Contexto de Usuario (`autorizacion.js`)](#4-autorización-y-contexto-de-usuario-autorizacionjs)
6. [5. Creador de Errores HTTP (`crearError.js`)](#5-creador-de-errores-http-crearerrorjs)
7. [6. Formateador de Errores Zod (`ErroresZod.js`)](#6-formateador-de-errores-zod-erroreszodjs)
8. [7. Capturador 404 (`rutaNoEncontrada.js`)](#7-capturador-404-rutanoencontradajs)
9. [8. Manejador Global Centralizado de Errores (`manejoErrores.js`)](#8-manejador-global-centralizado-de-errores-manejoerroresjs)
10. [Mapa de Relación entre Componentes y Pipeline](#mapa-de-relación-entre-componentes)

---

## ¿Qué es un Middleware en Express?

Un **middleware** es una función que se ejecuta en medio del ciclo de vida de una petición HTTP (entre que el cliente hace la solicitud y el servidor envía la respuesta final).

Tiene acceso a tres objetos fundamentales:
* **`req` (Request):** La información que envía el cliente (método, URL, headers, body, params, query).
* **`res` (Response):** Las herramientas para responderle al cliente (`res.json()`, `res.status()`, etc.).
* **`next` (Next function):** La función para pasar el control al siguiente middleware o ruta.

---

## 1. Logger de Peticiones (`logger.js`)

**Ubicación:** `src/middlewares/logger.js`  
**Tipo:** Middleware Informativo / Monitoreo  
**Posición en `app.js`:** Al principio de todo (antes de cualquier ruta).

### Código:
```javascript
export const logger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });

    next();
};
```

### ¿Cómo funciona línea por línea?
1. **`const start = Date.now();`**  
   Captura la marca de tiempo en milisegundos en el momento exacto en que la petición ingresa al servidor.
2. **`res.on('finish', () => { ... })`**  
   Node.js maneja eventos. El evento `'finish'` se emite automáticamente cuando la respuesta se ha terminado de enviar al cliente (por ejemplo, después de que un controlador ejecuta `res.json(...)`).  
   El callback **no se ejecuta de inmediato**: se queda "dormido" esperando que la petición termine.
3. **`const duration = Date.now() - start;`**  
   Calcula la diferencia de tiempo para saber cuántos milisegundos demoró la API en procesar la consulta.
4. **`req.originalUrl` vs `req.url`**  
   Se utiliza `req.originalUrl` porque los enrutadores modulares de Express (`artesano.routes.js`, `producto.routes.js`, etc.) recortan el prefijo en `req.url`. Con `originalUrl` garantizamos ver la ruta completa original (ej: `/productos/1` en lugar de solo `/1`).
5. **`next();`**  
   Indispensable. Permite que la petición continúe su camino hacia los controladores y rutas.

### Salida de ejemplo en consola:
```text
GET /productos - 200 (3ms)
POST /productos - 201 (7ms)
GET /ruta-falsa - 404 (1ms)
```

---

## 2. Validador Universal con Zod (`validarSchema.js`)

**Ubicación:** `src/middlewares/validarSchema.js`  
**Tipo:** Middleware Fábrica Universal (Factory Pattern) con Zod  
**Posición:** En las rutas de cualquier entidad (`artesano.routes.js`, `producto.routes.js`, etc.) para validar `body`, `params` o `query`.

### Código:
```javascript
import { crearError } from '../utils/crearError.js';
import { detallarErroresZod } from '../utils/ErroresZod.js';

// Middleware para validar datos (body, params o query) con Zod
export const validarSchema = (schema, origen) => (req, res, next) => {
    const datos = req[origen] ?? {};
    const resultado = schema.safeParse(datos);

    if (!resultado.success) {
        const detalles = detallarErroresZod(resultado.error);
        return next(crearError(`Error en los parámetros de ${origen}`, 400, detalles));
    }

    if (origen === 'query') {
        req.consulta = resultado.data;
    } else {
        req[origen] = resultado.data;
    }

    // Compatibilidad total con la nomenclatura de la cátedra UNCa
    if (origen === 'body') {
        req.bodyValidado = resultado.data;
    }
    if (origen === 'params') {
        req.parametrosValidados = resultado.data;
    }

    next();
};

// Atajos que usa la cátedra
export const validarBody = (schema) => validarSchema(schema, 'body');
export const validarParametros = (schema) => validarSchema(schema, 'params');
```

### ¿Cómo funciona?
1. **Patrón Fábrica (Factory Function):** Recibe el esquema declarativo de Zod (`schema`) y el segmento de la petición a evaluar (`origen`: `'body'`, `'params'` o `'query'`). Retorna la función middleware estándar `(req, res, next)` que Express puede ejecutar.
2. **Atajos de la cátedra (`validarBody` y `validarParametros`):** Permite escribir rutas exactamente como se enseñan en las clases (`validarBody(crearArtesanoSchema)` o `validarParametros(idParamSchema)`).
3. **Acceso dinámico mediante corchetes (`req[origen]`):**
   - Si `origen = 'query'`, evalúa `req.query`.
   - Si `origen = 'params'`, evalúa `req.params`.
   - Si `origen = 'body'`, evalúa `req.body`.
4. **Blindaje ante `undefined` (`req[origen] ?? {}`):** Evita fallos de ejecución si el cliente omite el body o no envía cabeceras `Content-Type`.
5. **Validación y sanitización (`schema.safeParse`):** Zod comprueba tipos, coerciones automáticas (`z.coerce.number()`), límites (`min`, `max`) y valores por defecto (`.default()`).
6. **Formateo y delegación de errores:** Si la validación falla, transforma los errores con `detallarErroresZod(resultado.error)` y pasa un error HTTP 400 a `next(...)`.
7. **Inyección de datos limpios (DTO y compatibilidad):**
   - Inyecta tanto en `req[origen]` como en las propiedades estándar de la cátedra: **`req.bodyValidado`** y **`req.parametrosValidados`**.
   - Para consultas URL (`query`), inyecta los filtros y paginación sanitizados en **`req.consulta`**. Esto previene conflictos con el *getter* nativo de sólo lectura de Express 5 sobre `req.query` y brinda a los controladores un acceso unificado y seguro.

---

## 3. Autenticación JWT y Revocaciones (`autenticarUsuario.js`)

**Ubicación:** `src/middlewares/autenticarUsuario.js`  
**Tipo:** Middleware de Seguridad, Autenticación y Autorización (Bearer JWT con RFC 6750)  
**Posición en rutas:** En rutas privadas (`src/routes/usuario.routes.js`, ej. `/me`, `/logout`) antes de los controladores que requieren identidad verificada.

### Código:
```javascript
import jwt from "jsonwebtoken";
import { verificarToken } from "../services/token.services.js";
import { tokenEstaRevocado } from "../services/revocaciones.services.js";

export const autenticarUsuario = async (req, res, next) => {
    const encabezado = req.get("Authorization")?.trim();
    if (!encabezado) {
        res.set("WWW-Authenticate", "Bearer");
        return res.status(401).json({
            mensaje: "Se requiere un token de acceso."
        });
    }

    const coincidencia = /^Bearer\s+(\S+)$/i.exec(encabezado);
    if (!coincidencia) {
        res.set("WWW-Authenticate", 'Bearer error="invalid_request"');
        return res.status(400).json({
            mensaje: "Usar Authorization: Bearer <token>."
        });
    }

    try {
        req.usuario = verificarToken(coincidencia[1]);
        if (await tokenEstaRevocado(req.usuario.jti)) {
            throw new jwt.JsonWebTokenError("Token revocado.");
        }
    } catch (error) {
        if (!(error instanceof jwt.JsonWebTokenError)) {
            return next(error);
        }
        res.set("WWW-Authenticate", 'Bearer error="invalid_token"');
        return res.status(401).json({
            mensaje: "Token inválido, vencido o revocado."
        });
    }

    return next();
};
```

### ¿Cómo funciona paso a paso?
1. **Extracción del encabezado (`req.get("Authorization")`):**
   Obtiene el valor de la cabecera HTTP de forma insensible a mayúsculas/minúsculas y remueve espacios en los bordes.
2. **Validación de presencia (RFC 6750):**
   Si la petición carece de cabecera `Authorization`, responde HTTP `401 Unauthorized` e incluye la cabecera estándar `WWW-Authenticate: Bearer` exigida por la especificación OAuth 2.0 / Bearer Token.
3. **Validación de formato sintáctico (`/^Bearer\s+(\S+)$/i`):**
   Aplica una expresión regular insensible a mayúsculas para comprobar que el esquema sea `Bearer` seguido de una cadena no vacía (`<token>`). Si el cliente envía un formato incorrecto (ej: `Basic ...` o solo el token sin la palabra `Bearer`), responde HTTP `400 Bad Request` con cabecera `WWW-Authenticate: Bearer error="invalid_request"`.
4. **Verificación criptográfica y estructural (`verificarToken`):**
   Extrae el token del grupo de captura (`coincidencia[1]`) y lo delega al servicio `src/services/token.services.js`. Allí se valida la firma con `JWT_SECRET`, algoritmo `HS256`, y se comprueban con **Zod** los claims requeridos (`sub` tipo UUID, `exp` número y `jti` cadena válida).
5. **Comprobación de Lista Negra en Base de Datos (`tokenEstaRevocado`):**
   Consulta de forma asíncrona en PostgreSQL si el identificador único del token (`req.usuario.jti`) figura en la tabla `TokenRevocado`. Si fue revocado (por ejemplo, porque el usuario cerró sesión con `/logout`), fuerza el lanzamiento de una excepción `jwt.JsonWebTokenError("Token revocado.")`.
6. **Captura y diagnóstico de errores:**
   Si la excepción capturada es una instancia de `jwt.JsonWebTokenError` (token alterado, firma inválida, expirado por tiempo o revocado), emite `401 Unauthorized` con cabecera `WWW-Authenticate: Bearer error="invalid_token"` y mensaje unificado `"Token inválido, vencido o revocado."`. Si se produce cualquier otro fallo imprevisto (ej. caída de conexión con la base de datos), lo remite a `next(error)` para su gestión en el middleware global de 500.
7. **Inyección de identidad (`req.usuario`) y prosecución (`next()`):**
   Al superar exitosamente todas las etapas, asocia el objeto `{ id: payload.sub, jti, exp }` a `req.usuario` y llama a `next()`, permitiendo que los controladores dependientes consuman la identidad del usuario autenticado sin volver a consultar o decodificar el token.

---

## 4. Creador de Errores HTTP (`crearError.js`)

**Ubicación:** `src/utils/crearError.js`  
**Tipo:** Función Utilitaria (Factory Pattern)  
**Propósito:** Estandarizar la creación de instancias nativas de `Error`, adjuntando `status` HTTP y detalles opcionales.

### Código:
```javascript
/**
 * Estructura interna del objeto devuelto:
 * {
 *   name: 'Error',
 *   message: 'Producto no encontrado',   
 *   status: 404,                        
 *   details: [...],                     
 *   stack: 'Error: Producto no encontrado\n    at crearError (...)\n    at ...' 
 * }
 */
export const crearError = (mensaje, status = 500, details = null) => {
    const error = new Error(mensaje);
    error.status = status;

    if (details) {
        error.details = details;
    }

    return error;
};
```

### ¿Cómo funciona?
1. **Instancia nativa `Error`:** Preserva el `stack trace` completo para depuración en desarrollo.
2. **Propiedad `status`:** Asigna el código de respuesta HTTP correspondiente (ej: `400`, `404`, `500`).
3. **Propiedad opcional `details`:** Permite adjuntar arrays con el detalle de los errores de validación sin acoplar la función a ninguna librería específica.

---

## 5. Formateador de Errores Zod (`ErroresZod.js`)

**Ubicación:** `src/utils/ErroresZod.js`  
**Tipo:** Utilidad especializada de formateo para Zod  
**Propósito:** Transformar la estructura interna de `ZodError` en un formato estándar consumible por clientes frontend.

### Código:
```javascript
export const detallarErroresZod = (ZodError) =>
    ZodError.issues.map((issue) => ({
        path: issue.path.join('.') || null,
        message: issue.message,
    }));
```

### ¿Cómo funciona?
1. **`ZodError.issues`:** Recorre la lista de todas las reglas del esquema que no se cumplieron.
2. **`issue.path.join('.')`:** Convierte la ruta de la propiedad a texto legible (ej: `["precio"]` $\rightarrow$ `"precio"`, o `["direccion", "calle"]` $\rightarrow$ `"direccion.calle"`). Si es una validación global, retorna `null`.
3. **`issue.message`:** Extrae el mensaje explicativo definido en el esquema.
4. **Retorno:** Un array de objetos `{ path, message }` listo para inyectar en `crearError(..., 400, detalles)`.

---

## 6. Capturador 404 (`rutaNoEncontrada.js`)

**Ubicación:** `src/middlewares/rutaNoEncontrada.js`  
**Tipo:** Middleware de Enrutamiento / Ruta Comodín  
**Posición en `app.js`:** Después de todas las rutas válidas, pero antes de `manejoErrores`.

### Código:
```javascript
import { crearError } from "../utils/crearError.js";

export const rutaNoEncontrada = (req, res, next) => {
    next(crearError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
};
```

### ¿Cómo funciona?
1. Si una petición no coincide con ningún endpoint registrado (`/`, `/info`, `/artesanos`, `/productos`), cae automáticamente en este middleware.
2. Invoca `crearError` con código `404`.
3. Al llamar a **`next(error)` con argumento**, Express salta directamente al middleware global de manejo de errores.

---

## 4. Control de Autorización y Contexto (`autorizacion.js`)

**Ubicación:** `src/middlewares/autorizacion.js`  
**Tipo:** Middlewares de Autorización y RBAC (Unidad 4)  
**Posición:** Entre `autenticarUsuario` y los controladores en rutas privadas.

### Código:
```javascript
import { obtenerUsuarioPorId } from "../services/usuario.services.js";

export const cargarContextoUsuario = async (req, res, next) => {
    try {
        const usuario = await obtenerUsuarioPorId(req.usuario.id);
        if (!usuario) {
            res.set("WWW-Authenticate", "Bearer");
            return res.status(401).json({ mensaje: "Cuenta inexistente." });
        }
        if (!usuario.activo) {
            return res.status(403).json({ mensaje: "Cuenta inactiva." });
        }
        req.contextoUsuario = usuario;
        return next();
    } catch (error) {
        return next(error);
    }
};

export const autorizarRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        const usuario = req.contextoUsuario;
        const permitido = (usuario?.roles ?? []).some(rol => rolesPermitidos.includes(rol));
        if (!permitido) {
            return res.status(403).json({
                mensaje: "No tiene permiso para esta operación."
            });
        }
        return next();
    };
};
```

### ¿Cómo funciona?
1. **`cargarContextoUsuario`**:
   - Toma el `req.usuario.id` que dejó verificado `autenticarUsuario`.
   - Consulta a la base de datos para obtener el estado actual de la cuenta, sus roles relacionales (`['ARTESANO']`, `['ADMINISTRADOR']`) y si posee perfil de artesano vinculado.
   - Comprueba `usuario.activo === true`. Si la cuenta fue desactivada por un administrador, rechaza inmediatamente con `403 Cuenta inactiva`.
   - Inyecta `req.contextoUsuario` con los datos listos para el resto del pipeline.
2. **`autorizarRoles(...rolesPermitidos)`**:
   - Función de orden superior (retorna un middleware) que verifica si al menos uno de los roles del usuario coincide con los autorizados (ej: `autorizarRoles("ADMINISTRADOR")` o `autorizarRoles("ARTESANO", "ADMINISTRADOR")`).
   - Si no cumple, rechaza de forma homogénea con `403 No tiene permiso para esta operación`.

---

## 5. Creador de Errores HTTP (`crearError.js`)
*(Permite instanciar errores con código HTTP y detalles).*

---

## 6. Formateador de Errores Zod (`ErroresZod.js`)
*(Transforma las violaciones de esquema de Zod en arreglos legibles `{ path, message }`).*

---

## 7. Capturador 404 (`rutaNoEncontrada.js`)

**Ubicación:** `src/middlewares/rutaNoEncontrada.js`  
**Tipo:** Middleware 404  

```javascript
import { crearError } from "../utils/crearError.js";

export const rutaNoEncontrada = (req, res, next) => {
    next(crearError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
};
```

---

## 8. Manejador Global Centralizado de Errores (`manejoErrores.js`)

**Ubicación:** `src/middlewares/manejoErrores.js`  
**Tipo:** Error Handling Middleware (última posición en `app.js`)

### Código:
```javascript
export const manejoErrores = (err, req, res, next) => {
    if (res.headersSent) return next(err);

    // Mapeo canónico de errores de Prisma según la cátedra
    const mensajes = {
        P2002: "Ya existe un registro con esos datos únicos.",
        P2003: "La operación afecta registros relacionados.",
        P2025: "Registro no encontrado.",
        P2034: "Hubo otro cambio simultáneo. Reintentar."
    };

    const mensajeErrorPrisma = mensajes[err.code];
    const estado = mensajeErrorPrisma
        ? (err.code === "P2025" ? 404 : 409)
        : (err.status || 500);

    const mensaje = estado >= 500
        ? "Error interno del servidor."
        : (mensajeErrorPrisma || err.message);

    if (estado >= 500) {
        console.error(err);
    }

    const respuesta = { mensaje, error: mensaje };
    if (err.details) {
        respuesta.details = err.details;
    }

    return res.status(estado).json(respuesta);
};
```

### Reglas aplicadas:
* **`P2002` (Unicidad violada):** Responde `409 Conflict`.
* **`P2003` (Clave foránea / Restricción):** Responde `409 Conflict`.
* **`P2025` (Registro no encontrado en `findUniqueOrThrow` / `update`):** Responde `404 Not Found`.
* **Protección contra fugas en errores 500:** Solo emite log en consola interna sin exponer detalles sensibles al cliente.

---

## Mapa de Relación entre Componentes

| Archivo | Rol | ¿Quién lo invoca o llama? | ¿Qué entrega al siguiente eslabón? |
|---|---|---|---|
| **`logger.js`** | Monitoreo HTTP | Express al recibir cualquier petición | Deja pasar la petición limpia con `next()` |
| **`validarSchema.js`** | Validación universal (body, params, query) | Rutas HTTP antes de los controladores | `req.bodyValidado` / `req.parametrosValidados` |
| **`autenticarUsuario.js`** | Autenticación Bearer JWT y Lista Negra | Rutas privadas | Inyecta `req.usuario = { id, jti, exp }` o rechaza 401 |
| **`autorizacion.js`** | Contexto y RBAC de roles | Rutas privadas protegidas | Inyecta `req.contextoUsuario` y valida permisos (403 si falla) |
| **`comun.schemas.js`** | Esquemas Zod compartidos | Rutas con parámetros comunes (`:id` int o uuid) | Validación de IDs enteros o UUIDs |
| **`ErroresZod.js`** | Formateador de fallos Zod | `validarSchema` | Array estructurado `[{ path, message }]` |
| **`crearError.js`** | Fabricador de Errores | Controladores, servicios y validadores | Objeto `Error` con `.status`, `.message` y `.details` |
| **`rutaNoEncontrada.js`** | Detección de rutas 404 | Express cuando no hay coincidencias | Error 404 transferido a `next(error)` |
| **`manejoErrores.js`** | Respuesta final de fallos | Express cuando se invoca `next(error)` | Mapeo Prisma (404/409) y respuesta JSON homogénea |


---


# Parte 7: Flujo de Ejecución y Manejo de Errores en Express

# Flujo de Ejecución y Manejo de Errores en Express

> **Caso de ejemplo:** El cliente realiza una petición a una ruta que no existe:  
> `GET http://localhost:3000/pokemon`

---

## Diagrama de Flujo

```mermaid
flowchart TD
    A["1. Cliente envía GET /pokemon"] --> B["2. app.use(logger)"]
    B -->|"next() (vacío)"| C["3. Rutas (/artesanos, /productos, /docs)"]
    C -->|"No hay coincidencias"| D["4. app.use(rutaNoEncontrada)"]
    D -->|"next(error) (con argumento)"| E["5. app.use(manejoErrores)"]
    E -->|"res.status(404).json(...)"| F["6. Cliente recibe respuesta"]
    E -.->|"Dispara evento finish"| G["7. logger imprime en consola"]

    style A fill:#38bdf8,stroke:#0284c7,color:#000
    style B fill:#fde047,stroke:#eab308,color:#000
    style D fill:#f97316,stroke:#ea580c,color:#fff
    style E fill:#ef4444,stroke:#dc2626,color:#fff
    style G fill:#4ade80,stroke:#16a34a,color:#000
```

---

## Paso a Paso del Ciclo de Vida

### 1. Entrada y Registro: `app.use(logger)`
* Inicia el cronómetro: `const start = Date.now();`
* Se queda escuchando el evento de cierre de la respuesta: `res.on('finish', ...)`.
* Llama a **`next()`** *(sin argumentos)* para dar paso a la siguiente etapa.

### 2. Evaluación de Rutas
* Express compara la URL solicitada (`/pokemon`) con las rutas registradas:
  * `/` (No coincide)
  * `/info` (No coincide)
  * `/artesanos` (No coincide)
  * `/productos` (No coincide)
  * `/stands` (No coincide)
  * `/pabellones` (No coincide)
  * `/sectores` (No coincide)
  * `/localidades` (No coincide)
  * `/solicitudes` (No coincide)
  * `/usuarios` (No coincide)
* Al no coincidir con ninguna, la petición continúa descendiendo por la cadena de middlewares.

### 3. Captura de Ruta Inexistente: `app.use(rutaNoEncontrada)`
* Al estar ubicada después de todas las rutas válidas, esta función captura cualquier petición no atendida.
* Ejecuta:
  ```javascript
  next(crearError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
  ```

> [!IMPORTANT]
> **La regla de oro de `next` en Express:**
> * `next()` *(vacío)* $\rightarrow$ Continúa al siguiente middleware normal.
> * `next(error)` *(con argumento)* $\rightarrow$ Express activa el **modo de error**, omite todos los middlewares normales restantes y salta directamente al siguiente **middleware de 4 parámetros** `(err, req, res, next)`.

### 4. Manejador Centralizado: `app.use(manejoErrores)`
* Express detecta la firma especial de 4 parámetros: `(err, req, res, next)`.
* Recibe el objeto generado por `crearError(...)` en el parámetro `err`.
* Extrae el código de estado (`err.status = 404`) y el mensaje (`err.message`).
* Envía la respuesta al cliente cerrando la conexión HTTP:
  ```javascript
  res.status(404).json({ error: "Ruta no encontrada: GET /pokemon" });
  ```

### 5. Finalización y Registro del Log: `res.on('finish')`
* La llamada a `res.json()` completa el envío y emite el evento `'finish'`.
* El listener configurado por el **`logger`** en el paso 1 se activa.
* Calcula la duración total y muestra en la terminal:
  ```text
  GET /pokemon - 404 (2ms)
  ```

---

## Resumen de Responsabilidades

| Middleware / Utilidad | Tipo | Responsabilidad Principal |
|---|---|---|
| **`logger`** | Informativo | Cronometra y registra en consola el resultado final de cada petición. |
| **`autenticarUsuario`** | Seguridad / Auth JWT | Valida cabeceras Bearer (RFC 6750), verifica firma y consulta lista negra de revocaciones. Inyecta `req.usuario = { id }`. |
| **`cargarContextoUsuario`** | Autorización / Contexto | Consulta la BD, verifica cuenta activa (`activo === true`) e inyecta `req.contextoUsuario` con sus roles. |
| **`autorizarRoles`** | Autorización / RBAC | Fábrica de middleware que verifica si el usuario autenticado posee al menos uno de los roles autorizados. |
| **`validarSchema`** | Middleware Fábrica Zod | Valida y sanitiza entradas (`body`, `params`, `query`) según esquemas declarativos. Expone `req.bodyValidado` y `req.parametrosValidados`. |
| **`ErroresZod`** | Utilidad (`utils`) | Transforma `issues` de Zod 4 en un array estructurado `[{ path, message }]`. |
| **`crearError`** | Utilidad (`utils`) | Estandariza objetos `Error` adjuntando `status` HTTP y `details` opcionales. |
| **`rutaNoEncontrada`** | Middleware 404 | Intercepta peticiones huérfanas y delega un error 404 mediante `next(...)`. |
| **`manejoErrores`** | Middleware de Errores | Centraliza la respuesta JSON `{ error, details? }` y oculta fallos técnicos (500). |

---

## Flujo Completo de un Endpoint Protegido: `POST /productos` (Unidad 4)

Este flujo muestra la cadena completa de seguridad desacoplada de la **Unidad 4**: autenticación Bearer JWT, carga de contexto con verificación de cuenta activa, autorización por roles (RBAC), validación de datos con Zod, control de propiedad en el servicio y persistencia atómica en PostgreSQL.

```mermaid
flowchart TD
    CLI["1. Cliente envía POST /productos<br>Headers: Authorization: Bearer token<br>Body: { nombre, precio, stock, artesanoId }"] --> LOG["2. logger"]
    LOG --> AUTH["3. autenticarUsuario<br>(Valida firma JWT, vigencia y consulta TokenRevocado)"]
    
    AUTH -->|"[Error] Token inválido o revocado"| ERR_AUTH["next(crearError(..., 401))"]
    ERR_AUTH --> HANDLER["manejoErrores.js<br>res.status(401).json(...)"]
    
    AUTH -->|req.usuario con id| CTX["4. cargarContextoUsuario<br>(Consulta BD, verifica activo = true e inyecta roles)"]
    CTX -->|"[Error] Cuenta inactiva o inexistente"| ERR_CTX["next(crearError(..., 403))"]
    ERR_CTX --> HANDLER
    
    CTX -->|req.contextoUsuario| RBAC["5. autorizarRoles('ARTESANO', 'ADMINISTRADOR')<br>(Verifica si posee el rol requerido)"]
    RBAC -->|"[Error] Rol no autorizado"| ERR_RBAC["next(crearError(..., 403))"]
    ERR_RBAC --> HANDLER
    
    RBAC --> ZOD["6. validarSchema (Zod)<br>crearProductoSchema.safeParse(req.body)"]
    ZOD -->|"[Error] Falló validación"| ERR_ZOD["next(crearError(..., 400))"]
    ERR_ZOD --> HANDLER
    
    ZOD -->|req.bodyValidado| CTRL["7. producto.controllers.js<br>crearProductoDto = req.body"]
    CTRL --> SERV["8. producto.services.js<br>crearProducto(crearProductoDto)"]
    
    SERV -->|"¿Artesano existe y es propio?"| PRISMA["9. prisma.producto.create(...)"]
    SERV -.->|"[Error] No autorizado para ese artesano"| THROW["throw crearError(..., 403)"]
    THROW -.->|"catch en controller"| HANDLER
    
    PRISMA --> DB[("PostgreSQL")]
    DB --> PRISMA
    PRISMA --> SERV
    SERV --> CTRL
    CTRL --> RES_OK["10. Cliente recibe 201 Created<br>{ id, nombre, precio, artesano, ... }"]

    style CLI fill:#38bdf8,stroke:#0284c7,color:#000
    style LOG fill:#facc15,stroke:#ca8a04,color:#000
    style AUTH fill:#818cf8,stroke:#4f46e5,color:#fff
    style CTX fill:#c084fc,stroke:#9333ea,color:#fff
    style RBAC fill:#ec4899,stroke:#db2777,color:#fff
    style ZOD fill:#34d399,stroke:#059669,color:#000
    style CTRL fill:#fb923c,stroke:#ea580c,color:#000
    style SERV fill:#f472b6,stroke:#db2777,color:#000
    style PRISMA fill:#f87171,stroke:#dc2626,color:#fff
    style DB fill:#e2e8f0,stroke:#94a3b8,color:#000
    style HANDLER fill:#ef4444,stroke:#dc2626,color:#fff
    style RES_OK fill:#4ade80,stroke:#16a34a,color:#000
```

---

## Flujo Completo de un Endpoint con Actualización: `PUT /productos/:id`

```mermaid
flowchart TD
    A["1. app.js\napp.use('/productos', productoRoutes)"] --> B["2. producto.routes.js\nrouter.put('/:id', validarSchema(idParamSchema, 'params'),\nvalidarSchema(actualizarProductoSchema, 'body'), updateProducto)"]
    B --> C["3. validarSchema.js ('params')\nidParamSchema.safeParse(req.params)"]
    C --> D["4. validarSchema.js ('body')\nactualizarProductoSchema.safeParse(req.body)"]
    
    D -->|"[Error] !resultado.success"| E["next(crearError(..., 400))"]
    E --> F["manejoErrores.js\nres.status(400).json(...)"]
    
    D -->|"[OK] resultado.success"| G["req.body = resultado.data (DTO)\nnext()"]
    G --> H["5. producto.controllers.js (updateProducto)\nconst id = Number(req.params.id)\nconst actualizarProductoDto = req.body"]
    
    H --> I["6. producto.services.js (actualizarProducto)\nactualizarProducto(id, actualizarProductoDto)"]
    
    I -->|"Paso 6.1"| J{"findUnique producto por id"}
    J -->|"No existe"| K["throw crearError(..., 404)"]
    K -.->|"catch en controller"| F
    
    J -->|"Existe"| L{"¿Se envió artesanoId?"}
    L -->|"Sí y no existe artesano"| M["throw crearError('Artesano inexistente.', 400)"]
    M -.->|"catch en controller"| F
    
    L -->|"Válido"| N["7. prisma.producto.update({\n  where: { id },\n  data: { nombre, descripcion, precio, stock, artesanoId },\n  include: { artesano: true }\n})"]
    
    N --> O[("PostgreSQL")]
    O -->|"Actualiza y retorna el registro actualizado"| N
    N -->|"Retorna productoActualizado"| I
    I -->|"Retorna al controller"| H
    H --> P["8. res.json(productoActualizado)\nCliente recibe 200 OK con el objeto"]

    style A fill:#38bdf8,stroke:#0284c7,color:#000
    style B fill:#a78bfa,stroke:#7c3aed,color:#000
    style C fill:#34d399,stroke:#059669,color:#000
    style D fill:#34d399,stroke:#059669,color:#000
    style H fill:#fb923c,stroke:#ea580c,color:#000
    style I fill:#f472b6,stroke:#db2777,color:#000
    style N fill:#f87171,stroke:#dc2626,color:#fff
    style O fill:#e2e8f0,stroke:#94a3b8,color:#000
    style F fill:#ef4444,stroke:#dc2626,color:#fff
    style P fill:#4ade80,stroke:#16a34a,color:#000
```

### Detalle de las 8 etapas del flujo:
1. **Entrada al servidor (`app.js`):** La petición HTTP `PUT /productos/:id` ingresa y es derivada al enrutador `productoRoutes`.
2. **Definición de ruta y tubería (`producto.routes.js`):** Se encadenan los middlewares `validarSchema(idParamSchema, 'params')`, `validarSchema(actualizarProductoSchema, 'body')` y el controlador `updateProducto`.
3. **Validación de identificador con Zod:** Comprueba que `:id` sea convertible a entero positivo y lo castea a `Number`.
4. **Validación de datos con Zod:** Aplica `actualizarProductoSchema.safeParse(req.body)`. Si falla, corta la ejecución con error 400. Si aprueba, almacena los datos limpios en `req.body` y continúa con `next()`.
5. **Controlador (`updateProducto`):** Extrae los datos preparados (`id` numérico y `actualizarProductoDto`) y convoca a la capa de servicios mediante `await actualizarProducto(...)`.
6. **Lógica de negocio (`producto.services.js`):**
   - Comprueba la existencia previa del producto mediante `findUnique` (si no existe, lanza un error 404 con `throw crearError(...)`).
   - Comprueba la validez de `artesanoId` si fue provisto (si no existe el artesano, lanza un error 400).
7. **Persistencia con Prisma ORM (`prisma.producto.update`):** Envía el objeto de actualización con los campos correspondientes e incluye la relación `artesano: true`. PostgreSQL ejecuta la actualización y devuelve en una sola operación el registro modificado junto con los datos del artesano.
8. **Respuesta al cliente:** El controlador recibe el objeto del producto actualizado y responde con `res.json(productoActualizado)` (código HTTP 200).

---

## Flujo Completo de Eliminación Física y Lógica: `DELETE` y `PATCH`

### 1. Eliminación Física Definitiva (`DELETE /productos/:id`)

```mermaid
flowchart TD
    A["1. Cliente: DELETE /productos/:id"] --> B["2. producto.routes.js\nrouter.delete('/:id', validarSchema(idParamSchema, 'params'), deleteProducto)"]
    B --> C["3. validarSchema.js (Zod)\nidParamSchema.safeParse(req.params)"]
    C -->|"[Error] ID inválido"| ERR["next(crearError(..., 400)) -> manejoErrores.js"]
    C -->|"[OK] req.params.id = resultado.data.id"| D["4. producto.controllers.js (deleteProducto)\nconst id = Number(req.params.id)\nawait eliminarProducto(id)"]
    D --> E["5. producto.services.js (eliminarProducto)"]
    E --> F{"findUnique(id)"}
    F -->|"No existe"| G["throw crearError('No existe...', 404)"]
    G -.->|"catch en controller"| ERR
    F -->|"Existe"| H["prisma.producto.delete({ where: { id } })"]
    H --> I[("PostgreSQL")]
    I --> H
    H --> D
    D --> J["6. res.status(200).send('Producto eliminado exitosamente')"]

    style A fill:#38bdf8,stroke:#0284c7,color:#000
    style B fill:#a78bfa,stroke:#7c3aed,color:#000
    style C fill:#34d399,stroke:#059669,color:#000
    style D fill:#fb923c,stroke:#ea580c,color:#000
    style E fill:#f472b6,stroke:#db2777,color:#000
    style H fill:#f87171,stroke:#dc2626,color:#fff
    style I fill:#e2e8f0,stroke:#94a3b8,color:#000
    style J fill:#4ade80,stroke:#16a34a,color:#000
    style ERR fill:#ef4444,stroke:#dc2626,color:#fff
```

### 2. Eliminación Lógica / Soft Delete (`PATCH /productos/:id`)

```mermaid
flowchart TD
    A["1. Cliente: PATCH /productos/:id"] --> B["2. producto.routes.js\nrouter.patch('/:id', validarSchema(idParamSchema, 'params'), deleteProductoLogico)"]
    B --> C["3. validarSchema.js (Zod)\nidParamSchema.safeParse(req.params)"]
    C --> D["4. producto.controllers.js (deleteProductoLogico)\nawait deleteLogico(id)"]
    D --> E["5. producto.services.js (deleteLogico)\nfindUnique(id)"]
    E -->|"[Error] No existe"| F["throw crearError(..., 404) -> manejoErrores.js"]
    E -->|"[OK] Existe"| G["prisma.producto.update({\n  where: { id },\n  data: { activo: false }\n})"]
    G --> H[("PostgreSQL")]
    H --> G
    G --> D
    D --> I["6. res.status(200).json({ message: 'Producto dado de baja (activo: false)' })"]

    style A fill:#38bdf8,stroke:#0284c7,color:#000
    style B fill:#a78bfa,stroke:#7c3aed,color:#000
    style C fill:#34d399,stroke:#059669,color:#000
    style D fill:#fb923c,stroke:#ea580c,color:#000
    style E fill:#f472b6,stroke:#db2777,color:#000
    style G fill:#f87171,stroke:#dc2626,color:#fff
    style H fill:#e2e8f0,stroke:#94a3b8,color:#000
    style I fill:#4ade80,stroke:#16a34a,color:#000
    style F fill:#ef4444,stroke:#dc2626,color:#fff
```

---

## Flujo Completo de Autenticación con Token: `GET /usuarios/me`

Este flujo ilustra el control de acceso implementado con **JWT**, validación de esquemas de token mediante **Zod**, consulta de revocaciones en **PostgreSQL** y entrega segura del perfil de usuario:

```mermaid
flowchart TD
    CLI["1. Cliente envía GET /usuarios/me\nHeaders: Authorization: Bearer <token>"] --> LOG["2. logger"]
    LOG --> ROUTE["3. usuario.routes.js\nrouter.get('/me', autenticarUsuario, obtenerMiPerfil)"]
    
    ROUTE --> AUTH["4. autenticarUsuario.js"]
    AUTH -->|"¿Falta header?"| ERR_NO_HEADER["res.status(401)\nWWW-Authenticate: Bearer\n'Se requiere un token de acceso.'"]
    AUTH -->|"¿Formato no es Bearer?"| ERR_BAD_FMT["res.status(400)\nWWW-Authenticate: Bearer error='invalid_request'\n'Usar Authorization: Bearer <token>.'"]
    
    AUTH -->|"Formato OK"| VERIF["5. verificarToken(token)\nValida firma HS256 y claims con Zod"]
    VERIF -->|"[Error] Firma/exp inválida"| ERR_JWT["res.status(401)\nWWW-Authenticate: Bearer error='invalid_token'\n'Token inválido, vencido o revocado.'"]
    
    VERIF -->|"[OK] Token estructuralmente válido"| REVOC["6. tokenEstaRevocado(jti)\nprisma.tokenRevocado.findUnique({ where: { jti } })"]
    REVOC -->|"[Revocado] jti en BD"| ERR_JWT
    
    REVOC -->|"[Activo] jti no revocado"| INJECT["7. req.usuario = { id, jti, exp }\nnext()"]
    
    INJECT --> CTRL["8. usuario.controllers.js (obtenerMiPerfil)\nobtenerUsuarioPorId(req.usuario.id)"]
    CTRL --> SERV["9. usuario.services.js\nprisma.usuario.findUnique({ where: { id }, select: { id, nombre, email } })"]
    
    SERV -->|"Usuario no existe"| ERR_NOT_FOUND["res.status(401)\n'La cuenta asociada al token no existe.'"]
    SERV -->|"Usuario existe"| RES_OK["10. res.status(200).json({ usuario })"]

    style CLI fill:#38bdf8,stroke:#0284c7,color:#000
    style LOG fill:#facc15,stroke:#ca8a04,color:#000
    style ROUTE fill:#a78bfa,stroke:#7c3aed,color:#000
    style AUTH fill:#fb923c,stroke:#ea580c,color:#000
    style VERIF fill:#34d399,stroke:#059669,color:#000
    style REVOC fill:#f87171,stroke:#dc2626,color:#fff
    style INJECT fill:#38bdf8,stroke:#0284c7,color:#000
    style CTRL fill:#fb923c,stroke:#ea580c,color:#000
    style SERV fill:#f472b6,stroke:#db2777,color:#000
    style RES_OK fill:#4ade80,stroke:#16a34a,color:#000
    style ERR_NO_HEADER fill:#ef4444,stroke:#dc2626,color:#fff
    style ERR_BAD_FMT fill:#ef4444,stroke:#dc2626,color:#fff
    style ERR_JWT fill:#ef4444,stroke:#dc2626,color:#fff
    style ERR_NOT_FOUND fill:#ef4444,stroke:#dc2626,color:#fff
```

---

## Flujo Completo de Cierre de Sesión (Logout) y Revocación: `POST /usuarios/logout`

Este flujo describe cómo la arquitectura stateless invalida de forma inmediata un token JWT persistiendo su identificador en la lista negra:

```mermaid
flowchart TD
    CLI["1. Cliente envía POST /usuarios/logout\nHeaders: Authorization: Bearer <token>"] --> AUTH["2. autenticarUsuario.js\nValida token activo, inyecta req.usuario"]
    AUTH --> CTRL["3. sesiones.controllers.js (cerrarSesion)"]
    CTRL --> SERV["4. revocaciones.services.js (revocarToken)\nconst venceEn = new Date(exp * 1000)"]
    SERV --> PRISMA["5. prisma.tokenRevocado.upsert({\n  where: { jti },\n  create: { jti, venceEn },\n  update: { venceEn }\n})"]
    PRISMA --> BD[("PostgreSQL (Tabla TokenRevocado)")]
    BD --> PRISMA
    PRISMA --> SERV
    SERV --> CTRL
    CTRL --> RES["6. res.status(204).end()\n(Sesión cerrada, token invalidado)"]

    style CLI fill:#38bdf8,stroke:#0284c7,color:#000
    style AUTH fill:#fb923c,stroke:#ea580c,color:#000
    style CTRL fill:#a78bfa,stroke:#7c3aed,color:#000
    style SERV fill:#f472b6,stroke:#db2777,color:#000
    style PRISMA fill:#f87171,stroke:#dc2626,color:#fff
    style BD fill:#e2e8f0,stroke:#94a3b8,color:#000
    style RES fill:#4ade80,stroke:#16a34a,color:#000
```

---

## Flujo de la Tarea en Segundo Plano: Limpieza Automática de Tokens (`limpiezaRevocaciones.js`)

Ciclo de vida de la tarea recurrente no bloqueante que purga periódicamente los tokens revocados cuya expiración natural ya ha transcurrido:

```mermaid
flowchart TD
    INIT["1. app.listen() al arrancar el servidor\niniciarLimpiezaRevocaciones()"] --> LOOP["2. Bucle Asíncrono Desacoplado\nsetTimeout(ejecutar, INTERVALO_MS).unref()\nIntervalo = 1 hora (3.600.000 ms)"]
    LOOP --> PURGE["3. eliminarRevocacionesVencidas()\nprisma.tokenRevocado.deleteMany({\n  where: { venceEn: { lte: new Date() } }\n})"]
    PURGE --> BD[("PostgreSQL (TokenRevocado)")]
    BD -->|"Elimina registros con venceEn <= NOW()"| PURGE
    PURGE --> LOG_OUT["4. Consola: 'Revocaciones vencidas eliminadas: N'"]
    LOG_OUT --> LOOP

    style INIT fill:#38bdf8,stroke:#0284c7,color:#000
    style LOOP fill:#facc15,stroke:#ca8a04,color:#000
    style PURGE fill:#f87171,stroke:#dc2626,color:#fff
    style BD fill:#e2e8f0,stroke:#94a3b8,color:#000
    style LOG_OUT fill:#4ade80,stroke:#16a34a,color:#000
```




---
