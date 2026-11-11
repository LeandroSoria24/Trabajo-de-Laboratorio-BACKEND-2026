# Poncho Digital — API REST
### Fiesta Nacional e Internacional del Poncho (Catamarca)
**Cátedra:** Desarrollo Backend — **Carrera:** Tecnicatura Universitaria en Diseño de Software  
**Facultad de Tecnología y Cs. Aplicadas — Universidad Nacional de Catamarca (UNCa)**

---

## Integrantes
* **Leandro Soria Rosales** — M.U. N° 00292
* **Santiago Ortiz** — M.U. N° 00451

---

## Caso de Estudio: Poncho Digital

Plataforma digital para la gestión y difusión de los artesanos, productores y productos de la tradicional **Fiesta Nacional e Internacional del Poncho** en la provincia de Catamarca.

La API REST proporciona servicios desacoplados para:
* **Control de Acceso Basado en Roles (RBAC):** Tablas relacionales (`Usuario`, `Rol`, `UsuarioRol`) con roles principales: `ARTESANO` y `ADMINISTRADOR`.
* **Cuentas Activas y Estado Operativo:** Control de usuarios activos (`activo: Boolean`) y moderación administrativa.
* **Autenticación con JWT:** Tokens firmados con algoritmo HS256, expiración (15m), cabeceras estándar RFC 6750 (`WWW-Authenticate`) y lista negra persistente en base de datos (`TokenRevocado`) para logout seguro y purga automática programada cada hora (`unref()`).
* **Ciclo de Vida del Artesano y Postulaciones:** Registro público, completado de perfil artesanal, postulación a la feria (`SolicitudPostulacion`), evaluación/aprobación por parte de la administración y asignación de stands feriales 1:1.
* **Catálogo de Productos y Filtro de Propiedad:** Creación y edición de artículos garantizando que cada artesano opere exclusivamente sobre sus propios recursos.
* **Optimización y Caché en Memoria RAM:** Respuestas inmediatas (< 1ms) con `node-cache` (TTL 30s) en lectura de catálogo e invalidación selectiva ante mutaciones.
* **Infraestructura Física del Predio Ferial:** Gestión de pabellones, sectores y stands disponibles/ocupados/en mantenimiento.
* **Documentación Interactiva OpenAPI 3.0:** Especificación OpenAPI generada automáticamente con `swagger-autogen` a partir de esquemas Zod 4 (`z.toJSONSchema`) y servida mediante Swagger UI en `/docs`.
* **Suite de Verificación de Contratos (39 Tests Automatizados):** Pruebas unitarias de esquemas Zod, contratos HTTP de acceso y pruebas de integración reales contra PostgreSQL en Supabase usando `node:test` y `supertest`.

---

## Tecnologías Utilizadas

| Tecnología | Versión | Rol |
|---|---|---|
| **Node.js** | v24 LTS | Runtime nativo (ESM `"type": "module"`), test runner `node:test` y soporte `--watch` / `--env-file` |
| **Express.js** | v5.2.1 | Framework HTTP moderno con soporte nativo de promesas y middlewares desacoplados |
| **PostgreSQL** | Supabase | Motor de base de datos relacional en la nube con tipos nativos (`UUID`, `DECIMAL`, `BOOLEAN`) |
| **Prisma ORM** | v7.10.0 | Acceso a datos y migraciones (cliente desacoplado con `@prisma/adapter-pg`) |
| **Bcrypt** | v6.0.0 | Hashing seguro de contraseñas (salt factor 10) |
| **JSON Web Tokens** | v9.0.3 | Autenticación basada en tokens JWT (`jsonwebtoken`), firmas HS256 y blacklist |
| **Zod** | v4.4.3 | Validación declarativa de esquemas, parámetros de ruta y conversión nativa `z.toJSONSchema` |
| **Node-Cache** | v5.1.2 | Almacén en memoria RAM con TTL (30s) e invalidación para endpoints de lectura |
| **Swagger UI Express** | v5.0.1 | Servidor de la interfaz visual interactiva de documentación en `/docs` |
| **Swagger Autogen** | v2.23.7 | Generador automático de la especificación OpenAPI 3.0 a partir de código y esquemas |
| **Supertest** | v7.3.1 | Pruebas automatizadas de contratos HTTP e integración sobre la instancia Express |
| **Dotenv** | v17.4.2 | Gestión segura de credenciales por variables de entorno |
| **CORS** | v2.8.6 | Habilitación de consumo cross-origin para aplicaciones frontend |

---

## Estructura del Proyecto

```text
Trabajo-de-Laboratorio-BACKEND-2026/
├── prisma/
│   ├── schema.prisma                  # Esquema relacional (11 modelos, 2 enums)
│   ├── migrations/                    # Historial versionado de migraciones SQL
│   ├── empty.js                       # Vaciado relacional seguro (protege 44 Localidades)
│   └── seed.js                        # Sembrador inicial (roles, predio, admins y artesanos)
├── src/
│   ├── server.js                      # Punto de entrada HTTP (app.listen + tarea de limpieza)
│   ├── app.js                         # Aplicación Express importable (middlewares, /docs y rutas)
│   ├── config/                        # Singletons de Prisma (@prisma/adapter-pg) y JWT
│   ├── controllers/                   # Controladores HTTP por dominio
│   ├── services/                      # Lógica de negocio, validaciones de propiedad y transacciones
│   ├── routes/                        # 8 routers con cadenas de seguridad y anotaciones #swagger
│   ├── middlewares/                   # logger, autenticarUsuario, autorizacion, validarSchema, cache, manejoErrores
│   ├── validators/                    # Esquemas Zod 4 (.strict(), coerce, paginación)
│   ├── documentacion/
│   │   └── esquemas.js                # 35 esquemas OpenAPI 3.0 sincronizados con Zod 4
│   ├── tareas/                        # Limpieza periódica de tokens revocados (unref)
│   ├── scripts/                       # Utilidad CLI interactiva crear-admin.js
│   └── utils/                         # Constructores de errores HTTP y formateador Zod
├── tests/
│   ├── solicitud-schema.test.js       # 28 pruebas unitarias de validación con safeParse()
│   ├── solicitudes-acceso.test.js     # 5 pruebas de contrato y rechazos 400/401 con Supertest
│   ├── solicitudes-integracion.test.js# 6 pruebas de integración relacional contra Supabase
│   └── helpers/
│       └── escenario-solicitudes.js   # Aislamiento seguro (@clase10.test) protegiendo Localidad
├── api-test/                          # 5 archivos .http (182 peticiones para VS Code REST Client) y colección Postman
├── documentacionPropia/               # Documentación maestra sintetizada, guía de flujos, auditoría Unidad 5 y diapositivas
├── Poncho_Digital_Postman_Collection.json # Colección Postman v2.1 completa (182 peticiones y scripts automáticos)
├── generar-docs.js                    # Script compilador de swagger-output.json
└── swagger-output.json                # Especificación OpenAPI 3.0 generada
```

---

## Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/LeandroSoria24/Trabajo-de-Laboratorio-BACKEND-2026.git
cd Trabajo-de-Laboratorio-BACKEND-2026
```

### 2. Instalar dependencias
```bash
npm install
```
> El script `postinstall` ejecuta `prisma generate` automáticamente (incluso antes de que exista `.env`). Además, `predev` y `prestart` vuelven a asegurar que el cliente de Prisma esté generado en `src/generated/prisma`, o podés ejecutarlo manualmente con `npm run db:generate`.

### 3. Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto (basado en `.env.example`) y `.env.test` para pruebas (basado en `.env.test.example`):
```env
DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST:5432/postgres"
JWT_SECRET="tu-clave-secreta-para-firmar-jwt-minimo-32-caracteres"
PORT=3000
```

### 4. Poblar la base de datos (Seeding)
```bash
npm run seed
```
> Vacía de forma segura las tablas dinámicas **preservando intactos los 44 municipios de la tabla `Localidad`** y carga la infraestructura ferial, administradores y artesanos de prueba.

### 5. Generar la documentación OpenAPI
```bash
npm run docs
```
> Analiza `src/app.js`, los routers y `src/documentacion/esquemas.js` para producir `swagger-output.json`.

### 6. Iniciar la aplicación
* **Modo desarrollo** (con recarga en caliente nativa vía `node --watch`):
  ```bash
  npm run dev
  ```
* **Modo producción:**
  ```bash
  npm start
  ```

El servidor iniciará en: `http://localhost:3000`

---

## Credenciales de Prueba Precargadas (`npm run seed`)

Al ejecutar `npm run seed`, quedan disponibles las siguientes cuentas para probar en **Swagger UI (`/docs`)** o Postman:

### Cuentas Administrador (Contraseña: `Admin1234#`)
| Nombre | Email | Rol |
|---|---|---|
| **Administrador Poncho** | `admin@ponchodigital.gob.ar` | `ADMINISTRADOR` |
| **Santiago Admin** | `santiago.admin@ponchodigital.gob.ar` | `ADMINISTRADOR` |

### Cuentas Artesano (Contraseña: `Artesano1234#`)
| Artesano/a | Email | Rubro y Localidad | Estado Perfil / Postulación | Stand |
|---|---|---|---|---|
| **Lorenza Gutiérrez** | `lorenza@artesanoscatamarca.com` | Textil (Belén) | `activo: true` / `APROBADA` | `A01` |
| **Juan Carlos Morales** | `juan.ceramica@artesanoscatamarca.com` | Cerámica (Santa María) | `activo: true` / `APROBADA` | `B01` |
| **Carmen Albarracín** | `carmen.madera@artesanoscatamarca.com` | Madera (Tinogasta) | `activo: true` / `APROBADA` | `C01` |
| **Marcos Carrizo** | `marcos.plata@artesanoscatamarca.com` | Metales (Andalgalá) | `activo: false` / `PENDIENTE` | `D01` (Solicitado) |
| **Elena Nieva** | `elena.cuero@artesanoscatamarca.com` | Cuero (Londres) | `activo: true` / `EN_REVISION` | `D02` (En evaluación) |

---

## Documentación Interactiva (Swagger UI & OpenAPI 3.0)

La API cuenta con documentación interactiva completa navegable desde el explorador:

**URL de acceso:** `http://localhost:3000/docs/`

### Características de la Documentación:
* **Exploración de Endpoints:** Las **50 operaciones HTTP (32 rutas REST)** del sistema organizadas en módulos temáticos (`Usuarios`, `Artesanos`, `Productos`, `Stands`, `Pabellones y Sectores`, `Localidades`, `Solicitudes de Postulación` e `Información General`), sin operaciones huérfanas en `default`.
* **Sincronización con Zod 4 (`$ref`):** Los modelos de entrada (`requestBody`) provienen directamente de los validadores de la aplicación convertidos mediante `z.toJSONSchema(schema, { target: "openapi-3.0", io: "input" })` en `src/documentacion/esquemas.js` (35 esquemas reutilizables y 69 referencias `$ref` resueltas).
* **Coherencia Contrato–Implementación:** Los cuerpos documentados no exponen campos internos que el servidor deduce o rechaza (como `artesanoId`, `rol`, `activo` o `estado` en operaciones de autogestión).
* **Autenticación con Botón "Authorize":** Permite pegar el token JWT obtenido en `POST /usuarios/login` para probar en vivo (`Try it out`) todas las peticiones protegidas.

---

## Scripts Disponibles en `package.json`

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia `src/server.js` en desarrollo con recarga automática (`node --watch`). Ejecuta `predev` (`prisma generate`) previamente. |
| `npm start` | Inicia `src/server.js` en modo producción. Ejecuta `prestart` (`prisma generate`) previamente. |
| `npm run db:generate` | Genera manualmente el cliente de Prisma 7 en `src/generated/prisma`. |
| `npm run docs` | Ejecuta `generar-docs.js` y actualiza `swagger-output.json`. |
| `npm test` | Ejecuta la **suite completa de 39 pruebas** (esquemas Zod, acceso HTTP e integración en Supabase). |
| `npm run test:clase10` | Ejecuta las 33 pruebas rápidas de esquemas Zod y rechazos de acceso HTTP (sin tocar base de datos). |
| `npm run test:integracion` | Ejecuta las 6 pruebas de integración relacionales contra PostgreSQL en Supabase (`.env.test`). |
| `npm run test:todos` | Ejecuta todos los archivos `tests/*.test.js` con `--env-file=.env.test`. |
| `npm run seed` | Puebla la base de datos con roles, predio, stands, administradores y artesanos (preservando `Localidad`). |
| `npm run db:empty` | Vacía de forma segura las tablas respetando claves foráneas (preservando `Localidad`). |
| `npm run create-admin` | Asistente por consola (interactivo o por parámetros) para dar de alta usuarios con rol `ADMINISTRADOR`. |

---

## Verificación de Contratos y Testing Automatizado (Unidad 5)

El proyecto cuenta con **39 pruebas automatizadas** construidas con **`node:test`**, **`node:assert/strict`** y **`supertest`**, donde `src/app.js` se importa de manera limpia sin iniciar `app.listen` ni dejar sockets abiertos:

### 1. Pruebas Unitarias de Esquemas Zod (`tests/solicitud-schema.test.js` — 28 tests)
* Comprueba de manera aislada mediante `schema.safeParse(entrada)` las matrices de casos válidos e inválidos para:
  - `crearSolicitudSchema` (incluyendo rechazo de `artesanoId` inyectado gracias a `.strict()`).
  - `evaluarSolicitudSchema` (validación estricta de estados `APROBADA` / `RECHAZADA`).
  - `asignarStandSolicitudSchema` (coerción numérica, enteros positivos y rechazo de decimales/negativos).
  - `crearProductoSchema` (precios positivos, stock entero no negativo y campos obligatorios).

### 2. Pruebas de Contrato y Autenticación HTTP (`tests/solicitudes-acceso.test.js` — 5 tests)
* Verifica el comportamiento del middleware `autenticarUsuario` directamente con `supertest`:
  - Solicitud sin cabecera `Authorization` $\rightarrow$ **401 Unauthorized** (`"Se requiere un token de acceso."`).
  - Cabecera mal formada (`Authorization: Basic abc`) $\rightarrow$ **400 Bad Request** (`"Usar Authorization: Bearer <token>."`).
  - Token inválido, corrupto o revocado $\rightarrow$ **401 Unauthorized** (`"Token inválido, vencido o revocado."`).
  - Protección de `/solicitudes/me` y `/artesanos/me` sin token $\rightarrow$ **401 Unauthorized**.

### 3. Pruebas de Integración con PostgreSQL en Supabase (`tests/solicitudes-integracion.test.js` — 6 tests)
* Ejecución controlada mediante [`.env.test`](.env.test) y aislamiento seguro en [`tests/helpers/escenario-solicitudes.js`](tests/helpers/escenario-solicitudes.js) sobre usuarios `@clase10.test` (**preservando siempre los 44 registros de `Localidad`**):
  1. **Creación y Persistencia (201):** Presenta una postulación con token de artesana y verifica con `prisma.solicitudPostulacion.findUniqueOrThrow` que se guardó en Supabase con estado `PENDIENTE` y pertenece a la cuenta autenticada.
  2. **Listado de Recursos Propios (200):** Verifica que `GET /solicitudes/me` devuelva únicamente las postulaciones de la artesana autenticada y ninguna ajena.
  3. **Aislamiento de Recursos Ajenos (404):** Comprueba que un artesano no pueda cancelar la postulación de otro expositor, respondiendo `404` (`"Solicitud no encontrada."`) y conservando intacto el registro original.
  4. **Actividad Integradora - Conflicto y Duplicación (409):** Comprueba que intentar presentar una segunda postulación activa devuelve `409 Conflict` (`"Ya posee una solicitud de postulación en estado PENDIENTE."`) y conserva un único registro en la base.
  5. **Verificación de Roles (403):** Comprueba que un usuario con rol `ARTESANO` reciba `403 Forbidden` (`"No tiene permiso para esta operación."`) al intentar consultar el listado administrativo `GET /solicitudes`.
  6. **Regla 1:1 de Stands, Concurrencia y Propiedad de Productos (409 / 400 / 403):** Comprueba que tras aprobar la solicitud y asignarle un stand, intentar asignarle un segundo stand al mismo artesano se rechaza tanto por solicitud (`409 Conflict`) como por stand directo (`400 Bad Request`), impide sobrescribir un stand ocupado vía `PUT /stands/:id` (`400 Bad Request`), garantiza atomicidad ante peticiones simultáneas concurrentes sobre el mismo stand (`200` y `409`), y asegura que un artesano no pueda editar ni eliminar productos pertenecientes a otro artesano (`403 Forbidden`) ni que visitantes accedan por ID a productos dados de baja lógica (`404 Not Found`).

---

## Matriz de Autorización y Control de Acceso (RBAC)

| Módulo / Router | Método y Ruta | Quién tiene acceso | Acción que realiza |
| :--- | :--- | :--- | :--- |
| **Usuarios** | `POST /usuarios/registro` | **Público** | Registro público de usuario. Crea la cuenta (`activo: true`) y le asigna el rol `ARTESANO` por defecto. |
| | `POST /usuarios/login` | **Público** | Autenticación con email y contraseña. Emite token JWT firmado (15m). Valida que la cuenta esté activa. |
| | `GET /usuarios/me` | **Autenticado (Cualquier Rol)** | Consulta los datos de la propia cuenta, estado activo, roles asignados y perfil artesano asociado. |
| | `POST /usuarios/logout` | **Autenticado (Cualquier Rol)** | Cierra la sesión ingresando el identificador del token (`jti`) a la lista negra persistente. |
| | `POST /usuarios/registro-administrador` | **Solo ADMINISTRADOR** | Alta de una nueva cuenta con rol `ADMINISTRADOR`. |
| | `POST /usuarios/:id/roles` | **Solo ADMINISTRADOR** | Asigna el rol `ADMINISTRADOR` a un usuario existente. |
| | `DELETE /usuarios/:id/roles/:rol` | **Solo ADMINISTRADOR** | Retira un rol aplicando reglas de seguridad (conservar al menos 1 rol, garantizar al menos 1 admin activo, validar postulaciones). |
| | `PATCH /usuarios/:id/activo` | **Solo ADMINISTRADOR** | Activa o desactiva una cuenta de usuario (protege al último admin activo). |
| **Artesanos** | `GET /artesanos`<br>`GET /artesanos/:id` | **Público** | Catálogo público ferial de artesanos activos para visitantes con filtros y paginación. |
| | `GET /artesanos/me` | **Rol ARTESANO** | Consulta sus propios datos comerciales, trayectoria, productos y stand asignado. |
| | `POST /artesanos/me` | **Rol ARTESANO** | Completa su perfil de artesano vinculado a su usuario (`activo: false` por defecto). |
| | `PUT /artesanos/me` | **Rol ARTESANO** | Modifica sus propios datos personales y comerciales. |
| | `POST /artesanos`<br>`PUT /artesanos/:id` | **Solo ADMINISTRADOR** | Alta o modificación administrativa de perfiles de artesano. |
| | `PATCH /artesanos/:id/activo` | **Solo ADMINISTRADOR** | Habilita o inhabilita directamente a un artesano expositor. |
| | `DELETE /artesanos/:id` | **Solo ADMINISTRADOR** | **Soft delete:** Da de baja lógica al artesano (`activo = false`). |
| **Productos** | `GET /productos`<br>`GET /productos/:id` | **Público (Caché 30s)** | Catálogo general de productos con paginación, filtros y caché en memoria RAM. |
| | `POST /productos` | **ARTESANO / ADMINISTRADOR** | Publica un producto en el catálogo. Invalida caché. |
| | `PUT /productos/:id` | **ARTESANO / ADMINISTRADOR** | Modifica datos de un producto (precio, stock, descripción). Invalida caché. |
| | `DELETE /productos/:id` | **ARTESANO / ADMINISTRADOR** | Baja lógica (`activo: false`) de un producto. Invalida caché. |
| **Stands** | `GET /stands`<br>`GET /stands/:id` | **Público** | Mapa y directorio público de stands del predio ferial con filtros por pabellón/sector. |
| | `POST /stands` | **Solo ADMINISTRADOR** | Da de alta un nuevo stand físico asignado a un pabellón y sector. |
| | `PUT /stands/:id` | **Solo ADMINISTRADOR** | Modifica código, número o estado del stand. |
| | `PATCH /stands/:id/asignar-artesano` | **Solo ADMINISTRADOR** | Asigna directamente un stand a un artesano activo que no tenga otro stand (pasa a `OCUPADO`). |
| | `PATCH /stands/:id/liberar` | **Solo ADMINISTRADOR** | Desvincula al artesano y vuelve el stand a estado `DISPONIBLE`. |
| | `DELETE /stands/:id` | **Solo ADMINISTRADOR** | Elimina físicamente un stand (valida que no esté ocupado). |
| **Pabellones y Sectores** | `GET /pabellones`<br>`GET /sectores` | **Público** | Consulta de la distribución física de la feria. |
| | `POST`, `PUT`, `DELETE` | **Solo ADMINISTRADOR** | Administración y mantenimiento de la infraestructura del predio. |
| **Localidades** | `GET /localidades`<br>`GET /localidades/:id` | **Público** | Listado de las 44 localidades/municipios de Catamarca para formularios y filtros. |
| **Solicitudes de Postulación** | `POST /solicitudes` | **Rol ARTESANO** | Presenta postulación para participar en la fiesta (estado `PENDIENTE`). |
| | `GET /solicitudes/me` | **Rol ARTESANO** | Consulta el estado y dictamen de sus propias postulaciones. |
| | `PATCH /solicitudes/:id/cancelar` | **Rol ARTESANO** | Cancela su postulación si se encuentra en estado `PENDIENTE`. |
| | `GET /solicitudes` | **Solo ADMINISTRADOR** | Auditoría global: lista todas las postulaciones con filtros y paginación. |
| | `PATCH /solicitudes/:id/evaluar` | **Solo ADMINISTRADOR** | Dictamina la solicitud (`APROBADA` o `RECHAZADA`). Al aprobar, activa automáticamente al artesano (`activo: true`). |
| | `PATCH /solicitudes/:id/asignar-stand` | **Solo ADMINISTRADOR** | Asigna un stand disponible a una postulación aprobada cuyo artesano no posea ya stand y lo pasa a `OCUPADO`. |
| **Información General** | `GET /`<br>`GET /info` | **Público** | Información de bienvenida, versión y estado del servicio. |

---

## Arquitectura del Proyecto (Pipeline de Seguridad)

Toda petición a rutas protegidas atraviesa la siguiente cadena desacoplada:

```mermaid
flowchart TD
    Req["Petición HTTP"] --> M1["1. autenticarUsuario<br>(Verifica firma JWT, expiración y TokenRevocado)"]
    M1 -->|req.usuario con id| M2["2. cargarContextoUsuario<br>(Consulta BD, extrae roles y verifica activo = true)"]
    M2 -->|req.contextoUsuario| M3["3. autorizarRoles(ARTESANO / ADMINISTRADOR)<br>(Verifica si posee el rol requerido)"]
    M3 --> M4["4. validarSchema (Zod)<br>(Valida body, params o query)"]
    M4 --> C["5. Controlador y Servicio<br>(Aplica reglas de negocio y transacciones)"]
```

---

## Modelo de Datos

### Enums

| Enum | Valores | Descripción |
|---|---|---|
| `EstadoStand` | `DISPONIBLE`, `OCUPADO`, `MANTENIMIENTO` | Estado operativo de los stands del predio ferial |
| `EstadoSolicitud` | `PENDIENTE`, `EN_REVISION`, `APROBADA`, `RECHAZADA`, `CANCELADA` | Circuito de postulación ferial |

### Entidades y Modelos

| Modelo | Descripción | Identificador | Relación Clave |
|---|---|---|---|
| `Usuario` | Cuenta de acceso (email, hash bcrypt y estado activo). | `id: String @db.Uuid` | M:N con `Rol` vía `UsuarioRol`. 1:1 con `Artesano`. |
| `Rol` | Catálogo de roles del sistema (`ADMINISTRADOR`, `ARTESANO`). | `id: Int` | M:N con `Usuario`. |
| `UsuarioRol` | Tabla intermedia relacional para RBAC múltiple. | `(usuarioId, rolId)` | Clave compuesta. |
| `Localidad` | 44 municipios de Catamarca protegidos. | `id: Int` | 1:N con `Artesano`. |
| `Artesano` | Perfil comercial y trayectoria ferial. Empieza con `activo: false`. | `id: Int` | 1:1 estricto con `Usuario` (`onDelete: Restrict`). |
| `Producto` | Artículo artesanal para catálogo. | `id: Int` | 1:N con `Artesano` (`onDelete: Cascade`). |
| `Pabellon` | Pabellón del predio ferial. | `id: Int` | 1:N con `Stand`. |
| `Sector` | Sector interno del pabellón. | `id: Int` | 1:N con `Stand`. |
| `Stand` | Espacio físico ferial. Asignación 1:1 con Artesano (`@unique`). | `id: Int` | 1:1 opcional con `Artesano` (`onDelete: SetNull`). |
| `SolicitudPostulacion` | Postulación a la fiesta evaluada por administración y con stand asignado. | `id: Int` | 1:N con `Artesano`, N:1 opcional con `Stand`. |
| `TokenRevocado` | Lista negra persistente de tokens JWT invalidados (`jti`, `venceEn`). | `jti: String` | Purga automática programada cada hora. |

---

## Documentación Técnica y Recursos de Defensa (`documentacionPropia/`)

Toda la documentación del proyecto fue sintetizada y consolidada en **4 documentos maestros** dentro de [`documentacionPropia/`](documentacionPropia/):

| # | Documento | Contenido |
|---|---|---|
| 1 | **[Documentación Completa Unificada (`DOCUMENTACION_COMPLETA.md`)](documentacionPropia/DOCUMENTACION_COMPLETA.md)** | **Manual técnico maestro: arquitectura por capas, flujograma de ejecución y manejo de errores, modelo ER y patrones de Prisma 7, validación con Zod 4, seguridad JWT/RBAC, caché en memoria RAM, catálogo de endpoints y evolución en las 13 semanas.** |
| 2 | **[Guía de Defensa, Flujos y Pruebas (`GUIA_DEFENSA_FLUJOS_Y_PRUEBAS.md`)](documentacionPropia/GUIA_DEFENSA_FLUJOS_Y_PRUEBAS.md)** | **Flujo crítico paso a paso con casos de estudio y error (incluyendo reasignación 1:1 de stands a artesanos que ya tienen stand, propiedad de productos y reglas de roles), flujos de respaldo, uso de `.http` en VS Code (REST Client), Postman (182 peticiones) y banco de preguntas de defensas semanales.** |
| 3 | **[Presentación Defensa de Laboratorio (`PRESENTACION_DEFENSA_LABORATORIO.md`)](documentacionPropia/PRESENTACION_DEFENSA_LABORATORIO.md)** | **Mazo de 16 diapositivas con notas de orador, circuito de demostración en vivo en 5 pasos y preguntas frecuentes.** |
| 4 | **[Reporte de Auditoría Unidad 5 (`REPORTE_AUDITORIA_UNIDAD5.md`)](documentacionPropia/REPORTE_AUDITORIA_UNIDAD5.md)** | **Matriz de cumplimiento punto por punto contra las pautas de la cátedra (Nivel 1 OpenAPI y Nivel 2 Testing).** |
