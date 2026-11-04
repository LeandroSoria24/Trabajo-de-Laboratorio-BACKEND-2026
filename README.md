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
* **Autenticación con JWT:** Tokens firmados con algoritmo HS256, expiración (15m) y lista negra persistente en base de datos (`TokenRevocado`) para logout seguro y purga automática programada cada hora.
* **Ciclo de Vida del Artesano y Postulaciones:** Registro público, completado de perfil artesanal, postulación a la feria (`SolicitudPostulacion`), evaluación/aprobación por parte de la administración y asignación de stands feriales 1:1.
* **Catálogo de Productos y Filtro de Propiedad:** Creación y edición de artículos garantizando que cada artesano opere sobre sus propios recursos.
* **Optimización y Caché en Memoria RAM:** Respuestas inmediatas (< 1ms) con `node-cache` (TTL 30s) en lectura de catálogo e invalidación selectiva ante mutaciones.
* **Infraestructura Física del Predio Ferial:** Gestión de pabellones, sectores y stands disponibles/ocupados.
* **Documentación Interactiva OpenAPI 3:** Especificación OpenAPI generada automáticamente con `swagger-autogen` a partir de esquemas Zod 4 y servida mediante Swagger UI en `/docs`.

---

## Tecnologías Utilizadas

| Tecnología | Versión | Rol |
|---|---|---|
| **Node.js** | v24 LTS | Runtime nativo (ESM `"type": "module"`) con soporte de recarga `--watch` |
| **Express.js** | v5.2.1 | Framework HTTP moderno con soporte nativo de promesas y middlewares desacoplados |
| **PostgreSQL** | Supabase | Motor de base de datos relacional con tipos nativos (`UUID`, `DECIMAL`, `BOOLEAN`) |
| **Prisma ORM** | v7.10.x | Acceso a datos y migraciones (cliente desacoplado con `@prisma/adapter-pg`) |
| **Bcrypt** | v6.0.0 | Hashing seguro de contraseñas (salt factor 10) |
| **JSON Web Tokens** | v9.0.3 | Autenticación basada en tokens JWT (`jsonwebtoken`), firmas HS256 y blacklist |
| **Zod** | v4.4.3 | Validación declarativa de esquemas, parámetros de ruta y contratos de entrada |
| **Node-Cache** | v5.1.2 | Almacén en memoria RAM con TTL e invalidación para endpoints de lectura |
| **Swagger UI Express** | v5.0.1 | Servidor de la interfaz visual interactiva de documentación en `/docs` |
| **Swagger Autogen** | v2.23.7 | Generador automático de la especificación OpenAPI 3 a partir de código y esquemas |
| **Dotenv** | v17.x | Gestión segura de credenciales por variables de entorno |
| **CORS** | v2.8.5 | Habilitación de consumo cross-origin para aplicaciones frontend |

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
> El script `postinstall` ejecuta `prisma generate` automáticamente.

### 3. Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto (basado en `.env.example`):
```env
DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST:5432/postgres?schema=public"
JWT_SECRET="tu-clave-secreta-para-firmar-jwt-minimo-32-caracteres"
PORT=3000
```

### 4. Ejecutar migraciones y generar cliente de Prisma
```bash
# Aplicar migraciones pendientes en PostgreSQL
npx prisma migrate deploy

# Generar el cliente Prisma en src/generated/prisma
npx prisma generate
```

*(Opcional) Abrir Prisma Studio para inspeccionar visualmente la base de datos:*
```bash
npx prisma studio
```

### 5. Generar la documentación OpenAPI
```bash
npm run docs
```
> Lee las rutas, comentarios `#swagger` y esquemas Zod en `src/documentacion/esquemas.js`, generando `swagger-output.json`.

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

## 📖 Documentación Interactiva (Swagger UI & OpenAPI 3)

La API cuenta con documentación interactiva completa navegable desde el explorador:

👉 **URL de acceso:** `http://localhost:3000/docs/`

### Características de la Documentación:
* **Exploración de Endpoints:** Los 32 endpoints del sistema organizados en 8 módulos temáticos (`Usuarios`, `Artesanos`, `Productos`, `Stands`, `Pabellones y Sectores`, `Localidades`, `Solicitudes de Postulación` e `Información General`).
* **Sincronización con Zod 4:** Los modelos de entrada (`requestBody`) provienen directamente de los validadores de la aplicación convertidos mediante `z.toJSONSchema(schema, { target: "openapi-3.0", io: "input" })`, garantizando que la documentación nunca quede desfasada respecto a las reglas de validación del código.
* **Pruebas en vivo (Try it out):** Permite ejecutar solicitudes directamente contra la base de datos conectada.
* **Autenticación con Botón "Authorize" 🔓:** Permite pegar el token JWT obtenido en `POST /usuarios/login` (sin prefijo `Bearer`, Swagger UI lo agrega automáticamente) para autorizar todas las peticiones protegidas.

### Comandos de Documentación:
```bash
# Regenerar swagger-output.json tras cambios en rutas o esquemas
npm run docs
```

---

## Scripts Disponibles en `package.json`

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia la API en desarrollo con recarga automática (`node --watch`). |
| `npm start` | Inicia la API en producción. |
| `npm run docs` | Ejecuta `generar-docs.js` y actualiza `swagger-output.json`. |
| `npm run seed` | Puebla la base de datos con roles, predio, stands, administradores y artesanos (preservando `Localidad`). |
| `npm run db:empty` | Vacía de forma segura las tablas respetando claves foráneas (preservando `Localidad`). |
| `npm run create-admin` | Asistente por consola (interactivo o por parámetros) para dar de alta usuarios con rol `ADMINISTRADOR`. |

---

## Matriz de Autorización y Control de Acceso (RBAC)

A continuación se detalla la matriz canónica de endpoints, permisos requeridos y acciones que realiza cada operación:

| Módulo / Router | Método y Ruta | Quién tiene acceso | Acción que realiza |
| :--- | :--- | :--- | :--- |
| **Usuarios** | `POST /usuarios/registro` | 🌐 **Público** | Registro público de usuario. Crea la cuenta (`activo: true`) y le asigna el rol `ARTESANO` por defecto. |
| | `POST /usuarios/login` | 🌐 **Público** | Autenticación con email y contraseña. Emite token JWT firmado (15m). Valida que la cuenta esté activa. |
| | `GET /usuarios/me` | 🟢 **Autenticado (Cualquier Rol)** | Consulta los datos de la propia cuenta, estado activo, roles asignados y perfil artesano asociado. |
| | `POST /usuarios/logout` | 🟢 **Autenticado (Cualquier Rol)** | Cierra la sesión ingresando el identificador del token (`jti`) a la lista negra persistente. |
| | `POST /usuarios/registro-administrador` | 🔴 **Solo ADMINISTRADOR** | Alta de una nueva cuenta con rol `ADMINISTRADOR`. |
| | `POST /usuarios/:id/roles` | 🔴 **Solo ADMINISTRADOR** | Asigna el rol `ADMINISTRADOR` a un usuario existente. |
| | `DELETE /usuarios/:id/roles/:rol` | 🔴 **Solo ADMINISTRADOR** | Retira un rol aplicando reglas de seguridad (conservar al menos 1 rol, garantizar al menos 1 admin activo, validar postulaciones). |
| | `PATCH /usuarios/:id/activo` | 🔴 **Solo ADMINISTRADOR** | Activa o desactiva una cuenta de usuario (protege al último admin activo). |
| **Artesanos** | `GET /artesanos`<br>`GET /artesanos/:id` | 🌐 **Público** | Catálogo público ferial de artesanos activos para visitantes con filtros y paginación. |
| | `GET /artesanos/me` | 🟡 **Rol ARTESANO** | Consulta sus propios datos comerciales, trayectoria, productos y stand asignado. |
| | `POST /artesanos/me` | 🟡 **Rol ARTESANO** | Completa su perfil de artesano vinculado a su usuario (`activo: false` por defecto). |
| | `PUT /artesanos/me` | 🟡 **Rol ARTESANO** | Modifica sus propios datos personales y comerciales. |
| | `POST /artesanos`<br>`PUT /artesanos/:id` | 🔴 **Solo ADMINISTRADOR** | Alta o modificación administrativa de perfiles de artesano. |
| | `PATCH /artesanos/:id/activo` | 🔴 **Solo ADMINISTRADOR** | Habilita o inhabilita directamente a un artesano expositor. |
| | `DELETE /artesanos/:id` | 🔴 **Solo ADMINISTRADOR** | **Soft delete:** Da de baja lógica al artesano (`activo = false`). |
| **Productos** | `GET /productos`<br>`GET /productos/:id` | 🌐 **Público (Caché 30s)** | Catálogo general de productos con paginación, filtros y caché en memoria RAM. |
| | `POST /productos` | 🟡 **ARTESANO / ADMINISTRADOR** | Publica un producto. El artesano lo vincula a su propio catálogo. Invalida caché. |
| | `PUT /productos/:id` | 🟡 **ARTESANO / ADMINISTRADOR** | Modifica datos de un producto (precio, stock, descripción) respetando propiedad. Invalida caché. |
| | `DELETE /productos/:id` | 🟡 **ARTESANO / ADMINISTRADOR** | Baja lógica (`activo: false`) de un producto. Invalida caché. |
| **Stands** | `GET /stands`<br>`GET /stands/:id` | 🌐 **Público** | Mapa y directorio público de stands del predio ferial con filtros por pabellón/sector. |
| | `POST /stands` | 🔴 **Solo ADMINISTRADOR** | Da de alta un nuevo stand físico asignado a un pabellón y sector. |
| | `PUT /stands/:id` | 🔴 **Solo ADMINISTRADOR** | Modifica código, número o estado del stand. |
| | `PATCH /stands/:id/asignar-artesano` | 🔴 **Solo ADMINISTRADOR** | Asigna directamente un stand a un artesano (pasa a `OCUPADO`). |
| | `PATCH /stands/:id/liberar` | 🔴 **Solo ADMINISTRADOR** | Desvincula al artesano y vuelve el stand a estado `DISPONIBLE`. |
| | `DELETE /stands/:id` | 🔴 **Solo ADMINISTRADOR** | Elimina físicamente un stand (valida que no tenga artesano ni solicitudes asociadas). |
| **Pabellones y Sectores** | `GET /pabellones`<br>`GET /sectores` | 🌐 **Público** | Consulta de la distribución física de la feria. |
| | `POST`, `PUT`, `DELETE` | 🔴 **Solo ADMINISTRADOR** | Administración y mantenimiento de la infraestructura del predio. |
| **Localidades** | `GET /localidades`<br>`GET /localidades/:id` | 🌐 **Público** | Listado de las 44 localidades/municipios de Catamarca para formularios y filtros. |
| **Solicitudes de Postulación** | `POST /solicitudes` | 🟡 **Rol ARTESANO** | Presenta postulación para participar en la fiesta (estado `PENDIENTE`). |
| | `GET /solicitudes/me` | 🟡 **Rol ARTESANO** | Consulta el estado y dictamen de sus propias postulaciones. |
| | `PATCH /solicitudes/:id/cancelar` | 🟡 **Rol ARTESANO** | Cancela su postulación si se encuentra en estado `PENDIENTE`. |
| | `GET /solicitudes` | 🔴 **Solo ADMINISTRADOR** | Auditoría global: lista todas las postulaciones de todos los artesanos. |
| | `PATCH /solicitudes/:id/evaluar` | 🔴 **Solo ADMINISTRADOR** | Dictamina la solicitud (`APROBADA` o `RECHAZADA`). Al aprobar, activa automáticamente al artesano (`activo: true`). |
| | `PATCH /solicitudes/:id/asignar-stand` | 🔴 **Solo ADMINISTRADOR** | Asigna un stand disponible a una postulación aprobada y lo pasa a `OCUPADO`. |
| **Información General** | `GET /`<br>`GET /info` | 🌐 **Público** | Información de bienvenida, versión y estado del servicio. |

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
| `SolicitudPostulacion` | Postulación a la fiesta evaluada por administración y con stand asignado. | `id: Int` | 1:N con `Artesano`, 1:1 opcional con `Stand`. |
| `TokenRevocado` | Lista negra persistente de tokens JWT invalidados (`jti`, `venceEn`). | `jti: String` | Purga automática programada cada hora. |

---

## Documentación Técnica Detallada

En la carpeta [`documentacionPropia/`](documentacionPropia/) se encuentran disponibles las guías técnicas del proyecto:

| # | Documento | Contenido |
|---|---|---|
| Ref | **[Documentación Completa Unificada](documentacionPropia/DOCUMENTACION_COMPLETA.md)** | **Compendio integral de toda la teoría, arquitectura, base de datos, diagramas y endpoints.** |
| 1 | [Arquitectura por Capas](documentacionPropia/arquitectura-capas.md) | Organización desacoplada Routes $\rightarrow$ Middlewares $\rightarrow$ Controllers $\rightarrow$ Services $\rightarrow$ Prisma |
| 2 | [Estructura de Base de Datos](documentacionPropia/estructura-base-de-datos.md) | Modelo relacional, RBAC con UsuarioRol, diagrama ER, normalización y decisiones de diseño |
| 3 | [Guía de Prisma ORM](documentacionPropia/guia-prisma.md) | Configuración con PostgreSQL, Prisma 7, schema declarativo, migraciones y cliente singleton |
| 4 | [Guía de Validación con Zod](documentacionPropia/guia-zod.md) | Esquemas Zod 4, validación de UUIDs, esquemas `.strict()`, DTOs y validación de parámetros |
| 5 | [Middlewares y Utilidades](documentacionPropia/middlewares-y-utils.md) | `logger`, `validarSchema`, `autenticarUsuario`, `cargarContextoUsuario`, `autorizarRoles`, `manejoErrores` |
| 6 | [Consultas y CRUD con Prisma](documentacionPropia/consultas-y-crud-prisma.md) | `findMany`, `findUnique`, transacciones interactivas `$transaction`, upserts y filtros |
| 7 | [Flujograma de Ejecución](documentacionPropia/flujoprograma.md) | Diagramas Mermaid del ciclo de vida de peticiones, autenticación, autorización y manejo global de errores |
| 8 | [Plan de Reestructuración Unidad 4](documentacionPropia/plan-reestructuracion-unidad4.md) | Diagnóstico, justificación teórica y alineación con la cátedra de Desarrollo Backend UNCa |
