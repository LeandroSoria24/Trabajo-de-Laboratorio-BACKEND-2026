# 📋 Plan de Reestructuración y Adaptación: Unidad 4 (Autorización y Protección de Recursos)
> **Proyecto:** API Poncho Digital - Fiesta Nacional e Internacional del Poncho  
> **Cátedra:** Desarrollo Backend - Facultad de Tecnología y Ciencias Aplicadas (UNCa)  
> **Fecha de Validación:** Octubre 2026  
> **Estado:** Validado y alineado 100% con la documentación del proyecto y la clase de Unidad 4.

---

## 🧘‍♂️ 1. Diagnóstico Inicial: ¡Que no cunda el pánico!

**No cagamos en absoluto.** Tras revisar exhaustivamente:
1. Las diapositivas de la **Unidad 4 (`1.md`)** de la UNCa.
2. La documentación propia del proyecto (`DOCUMENTACION_COMPLETA.md`, `estructura-base-de-datos.md`, `flujoprograma.md`, `middlewares-y-utils.md`).
3. El código actual en `src/` (controladores, rutas, servicios, esquemas y middlewares).

El diagnóstico es claro: **el 75% del trabajo estructural ya está hecho**. Ya contás con:
* Arquitectura en capas limpia (`routes` $\rightarrow$ `controllers` $\rightarrow$ `services` $\rightarrow$ `prisma`).
* Validación declarativa con **Zod**.
* Autenticación JWT con lista negra persistente en base de datos (`TokenRevocado`).
* Modelos de dominio (`Artesano`, `Producto`, `Stand`, `SolicitudPostulacion`, `Localidad`, `Pabellon`, `Sector`).

Lo que enseñó la cátedra en la **Unidad 4** es el paso natural que sigue a la autenticación: **Autorización, Control de Acceso Basado en Roles (RBAC), Cuentas Activas y Propiedad de Recursos (Ownership)**.

---

## 🔄 2. Mapeo Canónico: Cátedra UNCa vs. Poncho Digital

En las diapositivas de la cátedra se toma como ejemplo una *API de Gestión de Eventos*. En **Poncho Digital**, la equivalencia es exacta y directa:

| Concepto Cátedra (`1.md`) | Proyecto Poncho Digital | Justificación / Lógica de Negocio |
| :--- | :--- | :--- |
| **Rol `VISITANTE`** | **Desaparece de la BD** | **Un visitante no es un rol en la base de datos**. Es cualquier usuario anónimo que navega sin loguearse y consume endpoints públicos (`GET /stands`, `GET /productos`, `GET /artesanos`, `GET /info`). |
| **Rol `PARTICIPANTE`** | **Rol `ARTESANO`** | Usuario que se registra públicamente para gestionar su catálogo y postularse a la feria. |
| **Rol `ADMINISTRADOR`** | **Rol `ADMINISTRADOR`** | Personal organizador de la feria que audita cuentas, evalúa postulaciones y asigna stands. |
| **Modelo `Participante`** | **Modelo `Artesano`** | Datos personales y comerciales (DNI, teléfono, emprendimiento, localidad, trayectoria) vinculados `1:1` con `Usuario`. |
| **Modelo `Inscripcion`** | **Modelo `SolicitudPostulacion`** | Trámite mediante el cual el artesano solicita participar en la fiesta ferial. |
| **Modelo `Evento`** | **Modelo `Stand` / Edición** | El recurso físico ferial que el administrador asigna a la postulación. |
| **Actividad Integradora** (`PATCH /inscripciones/:id/cancelar`) | **`PATCH /solicitudes/:id/cancelar`** | El artesano puede cancelar su postulación propia si está activa (propiedad estricta). |

---

## 🗄️ 3. Ajustes Validados en Base de Datos (`prisma/schema.prisma`)

### A. Nuevos Modelos Relacionales de Seguridad (RBAC y Cuentas Activas)
Reemplazamos el enum `RolUsuario` por tablas relacionales para soportar usuarios con roles múltiples (ej: un Administrador que además es Artesano) y el campo `activo`:

```prisma
model Usuario {
  id           String       @id @default(uuid()) @db.Uuid
  nombre       String
  email        String       @unique
  passwordHash String
  activo       Boolean      @default(true)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  roles        UsuarioRol[]
  artesano     Artesano?

  // Evaluaciones de solicitudes auditadas por administradores
  solicitudesEvaluadas SolicitudPostulacion[] @relation("EvaluadorSolicitud")
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
```

### B. Ajuste en `Artesano` (Relación Estricta `Restrict`)
* `usuarioId` se mantiene `@unique @db.Uuid`.
* La relación con `Usuario` pasa a:
  ```prisma
  usuario Usuario @relation(fields: [usuarioId], references: [id], onDelete: Restrict)
  ```
  *(La cátedra exige `onDelete: Restrict` para impedir borrar por accidente la cuenta de usuario si tiene perfil vinculado).*

### C. Ajuste en `SolicitudPostulacion` y Enum `EstadoSolicitud`
Para soportar la **Actividad Integradora de la cátedra (Diapositiva 49)**, el enum de estados **debe incluir `CANCELADA`**:

```prisma
enum EstadoSolicitud {
  PENDIENTE
  EN_REVISION
  APROBADA
  RECHAZADA
  CANCELADA // <-- Requerido para la actividad integradora de cancelación propia
}
```

---

## 🛡️ 4. Pipeline de Middlewares: El Trío de Seguridad de la Cátedra

Toda ruta protegida ejecutará la secuencia de control:

```mermaid
flowchart TD
    Req["Petición HTTP"] --> M1["1. autenticarUsuario\n(Verifica JWT, expiración y TokenRevocado)"]
    M1 -->|req.usuario = { id }| M2["2. cargarContextoUsuario\n(Consulta BD, roles y verifica activo === true)"]
    M2 -->|req.contextoUsuario| M3["3. autorizarRoles('ARTESANO' / 'ADMINISTRADOR')\n(Verifica si posee el rol requerido)"]
    M3 --> M4["4. validarSchema (Zod .strict())\n(Valida body, params o query)"]
    M4 --> C["5. Controlador & Servicio\n(Aplica reglas y filtro de propiedad)"]
```

### Compatibilidad con `validarSchema.js`:
En la cátedra se usan los nombres `req.bodyValidado` y `req.parametrosValidados`. En nuestro middleware actual `src/middlewares/validarSchema.js` se asigna a `req.body` y `req.params`.  
**Ajuste:** En `validarSchema.js`, asignaremos tanto a `req.body` como a `req.bodyValidado` (y `req.params` con `req.parametrosValidados`). Así logramos **100% de compatibilidad hacia atrás** con el código ya existente y con las diapositivas de la cátedra.

---

## 🚦 5. Matriz Completa de Endpoints y Autorizaciones

### 🟢 1. Endpoints Públicos (Visitantes Anónimos - Sin JWT)
* `GET /info`: Información de la API y de la Fiesta del Poncho.
* `GET /stands`: Catálogo público de stands del predio ferial.
* `GET /stands/:id`: Detalle de un stand específico.
* `GET /artesanos`: Directorio público de artesanos expositores.
* `GET /artesanos/:id`: Detalle y trayectoria del artesano.
* `GET /productos`: Catálogo general de productos.
* `GET /productos/:id`: Ficha de producto.
* `POST /usuarios/login`: Autenticación con email y contraseña (entrega JWT).
* `POST /usuarios/registro-artesano`: **Registro público de artesano**. En una sola transacción anidada crea: `Usuario` (activo: true) + `UsuarioRol` (ARTESANO) + perfil `Artesano`.

### 🟡 2. Endpoints para Rol `ARTESANO` (Recursos Propios con Filtro de Propiedad)
* `GET /usuarios/me`: Perfil de usuario autenticado (`id`, `nombre`, `email`, `activo`, `roles`, `artesano: { id }`).
* `GET /artesanos/me`: Consulta sus propios datos personales y comerciales.
* `PUT /artesanos/me`: Modifica sus propios datos de artesano.
* `POST /artesanos/me/productos`: Publica un producto nuevo asociándolo directamente a su propio `artesanoId`.
* `PUT /productos/:id`: Edita un producto verificando previamente que pertenezca a su `artesanoId` (propiedad).
* `DELETE /productos/:id`: Da de baja lógica o física un producto propio.
* `POST /solicitudes`: **Crear Postulación a la Feria**. El `artesanoId` se deduce de `req.contextoUsuario.artesano.id`. El cliente **no** envía `artesanoId`.
* `GET /solicitudes/me`: Lista **únicamente** las postulaciones propias del artesano autenticado.
* `GET /solicitudes/:id`: Detalle de postulación. Si pertenece a otro artesano o no existe, responde `404` con el mismo mensaje.
* `PATCH /solicitudes/:id/cancelar`: **Actividad Integradora (Diapositiva 49)**.
  - Verifica propiedad (`artesano.usuarioId === req.contextoUsuario.id`).
  - Si no existe o es de otro usuario $\rightarrow$ `404`.
  - Si ya está `CANCELADA` $\rightarrow$ `409 Conflicto`.
  - Si está `PENDIENTE` $\rightarrow$ cambia a `CANCELADA` y responde `200`.

### 🔴 3. Endpoints para Rol `ADMINISTRADOR` (Gestión de la Feria y Cuentas)
* `POST /usuarios/registro-administrador`: Alta de un usuario administrador (sin artesano).
* `POST /usuarios/asignar-artesano`: Crea el perfil de artesano a un administrador existente y le suma el rol `ARTESANO`.
* `POST /usuarios/:id/roles`: Asigna rol `ADMINISTRADOR` a un usuario existente.
* `DELETE /usuarios/:id/roles/:rol`: Retira un rol aplicando las 3 reglas de oro de la cátedra:
  1. El usuario debe conservar al menos un rol (si no $\rightarrow$ `409`).
  2. Si se retira `ADMINISTRADOR`, debe quedar al menos otro administrador activo en el sistema (si no $\rightarrow$ `409`).
  3. Si se retira `ARTESANO`, no debe tener postulaciones registradas (si tiene $\rightarrow$ `409`). Si no tiene, se borra su perfil de `Artesano` y el rol.
* `PATCH /usuarios/:id/activo`: Activa o desactiva una cuenta. Si se desactiva un administrador, debe quedar al menos otro activo (si no $\rightarrow$ `409`).
* `GET /solicitudes`: Listado global de todas las postulaciones de todos los artesanos (con filtros por estado `PENDIENTE`, `APROBADA`, etc.).
* `PATCH /solicitudes/:id/evaluar`: Dictamen de postulación (`APROBADA` o `RECHAZADA` con observaciones).
* `PATCH /solicitudes/:id/asignar-stand`: Asigna un `Stand` disponible a la postulación aprobada y pasa el stand a `OCUPADO` de forma atómica.
* `POST`, `PUT`, `DELETE /stands`, `/pabellones`, `/sectores`: Administración de la infraestructura física del predio.

---

## ⚠️ 6. Puntos Críticos y Trampas Técnicas a Tener en Cuenta

1. **Orden de Rutas en Express (Regla de Diapositiva 46):**
   * En `artesano.routes.js`, `router.get('/me', ...)` **DEBE** declararse antes de `router.get('/:id', ...)`.
   * En `solicitud.routes.js`, `router.get('/me', ...)` **DEBE** declararse antes de `router.get('/:id', ...)`.
   * *Si no se hace, Express interpreta `"me"` como parámetro `:id` numérico y responde `400 ID inválido`.*

2. **Mapeo de Errores Prisma en `src/middlewares/manejoErrores.js` (Diapositiva 15):**
   * `P2002` (violación de restricción única: email, DNI duplicado) **debe responder `409`**, NO `400`.
   * `P2003` (violación de clave foránea / registros relacionados) **debe responder `409`**.
   * `P2025` (registro no encontrado en `findUniqueOrThrow` o `update`) **debe responder `404`**.
   * Agregar comprobación de `res.headersSent`:
     ```javascript
     if (res.headersSent) return next(err);
     ```

3. **Cuerpo del Registro de Artesano (`POST /usuarios/registro-artesano`):**
   * En `schema.prisma`, `Artesano` requiere `localidadId Int`.
   * El validador Zod `registroArtesanoSchema` debe requerir `localidadId` además de nombre, apellido, DNI, teléfono, emprendimiento y rubro.

---

## 🛠️ 7. Plan de Ejecución Paso a Paso

```
[ FASE 1: Prisma & Migración ]
      │
      ▼
[ FASE 2: Middlewares de Autorización ]
      │
      ▼
[ FASE 3: Módulo de Usuarios & RBAC ]
      │
      ▼
[ FASE 4: Módulo Artesano & Propiedad ]
      │
      ▼
[ FASE 5: Módulo Solicitudes & Stands ]
      │
      ▼
[ FASE 6: Corrección de Errores Prisma ]
      │
      ▼
[ FASE 7: Pruebas con Postman ]
```

### 📍 FASE 1: Base de Datos y Roles Iniciales
1. Modificar `prisma/schema.prisma` agregando `Rol`, `UsuarioRol`, agregando `CANCELADA` a `EstadoSolicitud` y actualizando relaciones de `Usuario` y `Artesano`.
2. Ejecutar migración `--create-only`:
   ```bash
   npx prisma migrate dev --name roles_y_artesano --create-only
   ```
3. Editar el archivo `migration.sql` recién generado para agregar al final:
   ```sql
   INSERT INTO "Rol" ("nombre") VALUES ('ARTESANO'), ('ADMINISTRADOR');
   ```
4. Aplicar la migración y generar el cliente:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
5. Crear el script `scripts/inicializar-admin.js` para dar de alta al primer administrador con credenciales de `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).

### 📍 FASE 2: Middlewares de Seguridad
1. Crear `src/middlewares/cargarContextoUsuario.js`.
2. Crear `src/middlewares/autorizarRoles.js`.
3. Ajustar `src/middlewares/validarSchema.js` para asignar tanto a `req.body` como a `req.bodyValidado`.

### 📍 FASE 3: Módulo de Usuarios, RBAC y Cuentas Activas
1. Actualizar `src/validators/usuario.schemas.js` con:
   - `registroArtesanoSchema` (incluye datos de cuenta + artesano + `localidadId`).
   - `registroAdminSchema`.
   - `asignarRolSchema` y `cambiarActivoSchema`.
2. Actualizar `src/services/usuario.services.js`:
   - `registrarUsuarioArtesano` (creación anidada con `Rol: ARTESANO`).
   - `registrarUsuarioAdmin` (creación con `Rol: ADMINISTRADOR`).
   - `obtenerUsuarioPorId` (incluye roles mapeados y `activo`).
   - `cambiarActivo` (con protección del último admin activo).
   - `iniciarSesion` (valida contraseña y `usuario.activo`).
3. Crear `src/services/roles.services.js`:
   - `asignarRolAdmin` (upsert en `UsuarioRol`).
   - `retirarRol` (con las 3 validaciones de seguridad).
4. Actualizar `src/routes/usuario.routes.js`.

### 📍 FASE 4: Módulo de Artesano y Propiedad
1. Agregar `GET /artesanos/me` en `src/routes/artesano.routes.js` (ubicado **antes** de `/:id`).
2. Ajustar `POST /productos` para asignar automáticamente el `artesanoId` del usuario autenticado.

### 📍 FASE 5: Módulo de Solicitudes y Asignación de Stands
1. Crear `src/validators/solicitud.schemas.js`.
2. Crear `src/services/solicitud.services.js`:
   - `crearMiSolicitud`: Crea postulación para el artesano del usuario logueado.
   - `listarMisSolicitudes`: Filtra por `artesano.usuarioId`.
   - `obtenerMiSolicitud`: Busca con `where: { id, artesano: { usuarioId } }` (responde 404 si es ajena o no existe).
   - `cancelarMiSolicitud`: Pasa de `PENDIENTE` a `CANCELADA` (409 si ya está cancelada).
   - `listarTodasSolicitudes`: Vista de administrador con filtros.
   - `evaluarSolicitud`: Dictamen admin (`APROBADA` / `RECHAZADA`).
   - `asignarStandASolicitud`: Transacción que asocia el stand disponible y lo pasa a `OCUPADO`.
3. Crear `src/controllers/solicitud.controllers.js` y `src/routes/solicitud.routes.js`.
4. Montar `/solicitudes` en `src/app.js`.

### 📍 FASE 6: Ajuste de Manejo Global de Errores
1. Modificar `src/middlewares/manejoErrores.js` para responder `409` en `P2002` y `P2003`, y `404` en `P2025`.

### 📍 FASE 7: Pruebas con Postman
Ejecutar la suite de pruebas del laboratorio:
* Registro público de artesano $\rightarrow$ `201`.
* Reintento con mismo email o DNI $\rightarrow$ `409`.
* Login de artesano y consulta `GET /usuarios/me` $\rightarrow$ `200`.
* Intento de acceder a ruta admin con token de artesano $\rightarrow$ `403`.
* Creación de postulación propia $\rightarrow$ `201`.
* Consulta `GET /solicitudes/me` $\rightarrow$ `200` (solo las propias).
* Consulta de postulación ajena $\rightarrow$ `404`.
* Cancelación de postulación propia $\rightarrow$ `200`. Reintento $\rightarrow$ `409`.
* Cuenta desactivada $\rightarrow$ `401` en login y `403` con token previo.
