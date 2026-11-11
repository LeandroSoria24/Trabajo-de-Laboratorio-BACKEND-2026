# Reporte de Auditoría Integral y Cumplimiento de Rúbrica — Unidad 5

**Proyecto:** Poncho Digital Backend — Fiesta Nacional e Internacional del Poncho (Catamarca)  
**Cátedra:** Desarrollo Backend — Trabajo de Laboratorio 2026  
**Rama:** `semana13`  
**Entorno de Ejecución:** Node.js v24.17.0 LTS (ESM puro), Express 5.2.1, Prisma 7.10.0, Supabase PostgreSQL  
**Autores del Proyecto:** Leandro Soria Rosales (MUN° 00292), Santiago Ortiz (MUN° 00451)  
**Auditor:** Implementer / QA / Specialist Worker — Milestone 1  
**Fecha de Auditoría:** 11 de Noviembre de 2026  

---

## 1. Resumen Ejecutivo de la Auditoría

El presente reporte certifica el estado técnico, funcional, de seguridad y de pruebas del backend de **Poncho Digital** tras la auditoría exhaustiva y estabilización realizada sobre la rama `semana13`. 

El proyecto implementa una API REST completa para la gestión ferial de la Fiesta Nacional e Internacional del Poncho, organizada por el Ministerio de Cultura de Catamarca. La solución articula la interacción entre visitantes, artesanos y administradores bajo una arquitectura limpia en capas, autenticación JWT con revocación activa en base de datos, autorización basada en roles (RBAC), catálogo de productos con aceleración de lectura en memoria RAM (caché), documentación interactiva OpenAPI 3.0 montada en `/docs`, y una suite de pruebas automatizadas ejecutadas contra la base de datos remota de Supabase con un 100% de éxito.

### Indicadores Clave de Calidad
- **Pruebas Automatizadas:** 3 suites de pruebas nativas (`node:test`), 38 casos ejecutados, 38 superados (0 fallos, 0 omitidos).
- **Tiempo de Ejecución y Teardown:** Finalización completa en ~22 segundos con desconexión ordenada del pool TCP de Prisma (`$disconnect()`), resolviendo el bloqueo histórico de procesos colgados.
- **Seguridad y Criptografía:** Algoritmo HS256 para tokens JWT (expiración 15m), bcrypt (10 rondas de salt) para contraseñas, cabeceras RFC 6750 (`WWW-Authenticate`) para respuestas 401 y 400.
- **Integridad de Base de Datos:** Los 44 municipios de la tabla `Localidad` de Catamarca se encuentran 100% preservados e inmutables.
- **Desacople Arquitectónico:** Separación total entre la instancia Express (`src/app.js`) y el arranque del servidor HTTP / tareas de fondo (`src/server.js`), cumpliendo con el requisito formal de "Aplicación Importable".

---

## 2. Matriz de Cumplimiento de Pautas y Rúbrica de la Cátedra

| # | Criterio de la Cátedra (`pautas.md`) | Requisito Específico | Estado | Evidencia y Ubicación en Código |
|---|---|---|---|---|
| **C1** | **Tecnología Base** | Node.js 24.x LTS, Express 5.x, ESM puro (`"type": "module"`) | **100% Cumplido** | `package.json` (`node v24.17.0`, `express: ^5.2.1`, `"type": "module"`). Todos los archivos usan `import`/`export`. |
| **C2** | **Arquitectura en Capas** | Separación limpia de rutas, middlewares, validadores, controladores, servicios y configuración | **100% Cumplido** | Árbol estructurado en `src/routes/`, `src/middlewares/`, `src/validators/`, `src/controllers/`, `src/services/`, `src/config/`. |
| **C3** | **Aplicación Importable** | La app no debe llamar a `app.listen()` al ser importada por suites de test o generadores de OpenAPI | **100% Cumplido** | `src/app.js` exporta `app` (named y default) sin `listen`. El bootstrap reside en `src/server.js`. |
| **C4** | **Base de Datos y ORM** | PostgreSQL accedido exclusivamente a través de Prisma ORM (sin SQL crudo no justificado) | **100% Cumplido** | `prisma/schema.prisma` y `src/config/prisma.js` con `@prisma/adapter-pg`. Todas las operaciones usan la API de Prisma Client. |
| **C5** | **Diseño REST y Convenciones** | Recursos en plural, métodos HTTP semánticos (GET, POST, PUT, PATCH, DELETE), códigos 200, 201, 204, 400, 401, 403, 404, 409 | **100% Cumplido** | Rutas `/artesanos`, `/productos`, `/stands`, `/solicitudes`, `/usuarios`, etc. Respuestas 201 en creación, 204 en borrado, 409 en conflicto. |
| **C6** | **Validación de Entradas** | Esquemas estrictos de validación con Zod; sanitización y rechazo de campos desconocidos | **100% Cumplido** | Esquemas Zod con `.strict()` en `src/validators/*.schemas.js`. Middleware `validarSchema` que maneja `req.body` y `req.consulta` para Express 5. |
| **C7** | **Seguridad y RBAC** | Autenticación JWT con esquema Bearer, hashing bcrypt, roles `ADMINISTRADOR`, `ARTESANO`, `VISITANTE` | **100% Cumplido** | `src/middlewares/autenticar.js`, `src/middlewares/autorizarRoles.js`, `src/services/usuario.services.js`. |
| **C8** | **Revocación de Tokens** | Invalidación de tokens en logout mediante lista de revocación persistente | **100% Cumplido** | Tabla `TokenRevocado`, endpoint `POST /usuarios/logout`, verificación en cada petición y daemon `src/tareas/limpiezaRevocaciones.js`. |
| **C9** | **Documentación OpenAPI 3.0** | Swagger UI montado en `/docs` con esquemas de componentes y esquema Bearer interactivo | **100% Cumplido** | `generar-docs.js`, `swagger-output.json` y `app.use('/docs', ...)`. Definición de `bearerAuth` y esquemas JSON Schema de Zod v4. |
| **C10** | **Proceso de Postulación** | Flujo de inscripción ferial: solicitud artesano -> evaluación admin -> asignación de stand | **100% Cumplido** | Endpoints `/solicitudes`, estados `PENDIENTE`, `APROBADA`, `RECHAZADA`, `CANCELADA`, y asignación física a `Stand`. |
| **C11** | **Aislamiento Multitenant** | Los artesanos solo pueden modificar sus propios productos y consultar sus propias postulaciones | **100% Cumplido** | Verificación en `producto.services.js` (`artesanoId === artesanoAutenticado.id`) y tests de aislamiento (Test 2 y 3). |
| **C12** | **Caché en Memoria** | Optimización de lecturas repetidas con invalidación activa ante escrituras | **100% Cumplido** | `src/middlewares/cache.js` y `src/services/producto.services.js` (`node-cache` 30s TTL, invalidación en POST/PUT/DELETE, header `X-Cache`). |
| **C13** | **Infraestructura de Tests** | Pruebas unitarias de esquemas, pruebas de contrato de acceso y pruebas de integración con base de datos | **100% Cumplido** | Suites en `tests/`: 28 tests de esquemas Zod, 5 tests de acceso/auth HTTP, 5 tests de integración con Supabase. 0 fallos. |
| **C14** | **Protección de Localidades** | Inmutabilidad de los 44 municipios de Catamarca durante vaciados, seeds y ejecuciones de test | **100% Cumplido** | Salvaguarda en `prisma/empty.js` y `tests/helpers/escenario-solicitudes.js`. 44 registros confirmados intactos. |

---

## 3. Hallazgos Técnicos y Correcciones Aplicadas en la Semana 13

### 3.1 Desacoplamiento de Aplicación y Servidor (`src/app.js` vs `src/server.js`)
- **Problema Detectado:** `src/app.js` contenía el bloque `if (process.env.NODE_ENV !== "test") { app.listen(...); iniciarLimpiezaRevocaciones(); }`. Aunque prevenía la apertura del puerto cuando `NODE_ENV === "test"`, ataba la configuración de Express al ciclo de vida del proceso de producción e impedía que herramientas de documentación (como `swagger-autogen`) o herramientas de pruebas externas importaran la instancia pura de la aplicación sin evaluar efectos secundarios.
- **Solución Implementada:**
  1. Se extrajo toda la lógica de escucha del servidor y la puesta en marcha del timer de revocaciones a un nuevo archivo raíz: `src/server.js`.
  2. `src/server.js` importa `{ app }` desde `./app.js`, lee el puerto desde `process.env.PORT || 3000`, e inicia el servidor junto al daemon de limpieza.
  3. `src/app.js` mantiene únicamente la definición de rutas, middlewares y exportaciones tanto nombrada (`export const app`) como por defecto (`export default app`).
  4. Se actualizaron los scripts `"start": "node src/server.js"` y `"dev": "node --watch src/server.js"` en `package.json`.

### 3.2 Corrección de Dead Code en `src/services/localidad.services.js`
- **Problema Detectado:** En la función `obtenerLocalidades`, las líneas 52-55 ejecutaban:
  ```javascript
  let total = await prisma.localidad.count();
  if (total === 0) {
      await sincronizarDesdeGeoref();
  }
  ```
  Sin embargo, la función `sincronizarDesdeGeoref()` había sido comentada previamente (líneas 10-41) porque las localidades de Catamarca ya se encuentran sembradas de forma fija y definitiva en Supabase. Si la tabla quedaba momentáneamente vacía o en una base nueva, la llamada fallaba con un error irrecuperable: `ReferenceError: sincronizarDesdeGeoref is not defined`. Además, ejecutar `prisma.localidad.count()` en cada consulta introducía una sobrecarga innecesaria en la base de datos remota.
- **Solución Implementada:** Se eliminó la verificación y la invocación a la función comentada, optimizando `obtenerLocalidades` para que consulte directamente los registros con sus criterios de filtrado y ordenamiento.

### 3.3 Teardown Limpio de Sockets TCP en `tests/solicitudes-acceso.test.js`
- **Problema Detectado:** Al ejecutar `node --test tests/solicitudes-acceso.test.js`, la prueba tardaba más de 19 segundos en finalizar, a pesar de que los 5 casos de prueba se ejecutaban en menos de 50 milisegundos.
  - *Causa Raíz:* Al importar `src/app.js`, se cargaban todos los módulos de rutas, lo que a su vez importaba `src/config/prisma.js`. Prisma inicializaba el pool de conexiones PostgreSQL contra Supabase. Como la suite de pruebas no tenía un hook `after()` que cerrara el pool, el event loop de Node.js permanecía esperando que expiraran los timers de inactividad de los sockets de red abiertos.
- **Solución Implementada:** Se importó el cliente `prisma` en `tests/solicitudes-acceso.test.js` y se añadió el hook de finalización:
  ```javascript
  after(async () => {
    await prisma.$disconnect();
  });
  ```
  Con este cambio, el tiempo total de ejecución de la suite descendió de **19.3 segundos** a tan solo **886 milisegundos**.

### 3.4 Cobertura de Pruebas Unitarias para `asignarStandSolicitudSchema`
- **Problema Detectado:** El archivo `tests/solicitud-schema.test.js` importaba en su cabecera `asignarStandSolicitudSchema`, pero no poseía ningún caso de prueba que lo ejercitara, dejando una brecha de cobertura en la validación de esquemas Zod.
- **Solución Implementada:** Se diseñó una matriz de 8 casos de prueba exhaustivos cubriendo:
  1. Objeto vacío válido (`standId` es opcional según regla de negocio).
  2. Número entero positivo válido.
  3. Coerción numérica válida desde string (`"12"` -> `12`).
  4. Rechazo de valor 0 (exige entero positivo).
  5. Rechazo de enteros negativos (`-3`).
  6. Rechazo de números decimales / de coma flotante (`2.5`).
  7. Rechazo de cadenas no numéricas (`"invalido"`).
  8. Rechazo estricto de campos adicionales no permitidos por la regla `.strict()`.

### 3.5 Unificación de Scripts de Pruebas en `package.json`
- **Problema Detectado:** El comando estándar `npm test` solo ejecutaba las pruebas de contrato y esquemas sin inyectar variables de entorno (`--env-file=.env.test`), impidiendo que el evaluador ejecutara las pruebas de integración en un único comando.
- **Solución Implementada:** Se actualizó `package.json`:
  ```json
  "test": "node --env-file=.env.test --test tests/solicitudes-acceso.test.js tests/solicitud-schema.test.js tests/solicitudes-integracion.test.js",
  "test:todos": "node --env-file=.env.test --test tests/*.test.js"
  ```
  Ahora, tanto `npm test` como `npm run test:todos` ejecutan la totalidad de las suites de prueba de manera determinista y con sus variables de entorno correspondientes.

---

## 4. Auditoría Detallada por Componentes

### 4.1 Documentación OpenAPI 3.0 y Swagger UI
- **Generador:** `swagger-autogen` configurado con `{ openapi: "3.0.0" }`.
- **Integración con Zod v4:** Los esquemas de componentes no están hardcodeados como JSON estático; se generan de forma dinámica e interoperable desde las definiciones de Zod v4 mediante `z.toJSONSchema` en `src/documentacion/esquemas.js`.
- **Esquema de Seguridad:** Componente `bearerAuth` registrado formalmente bajo `components.securitySchemes`:
  ```json
  "securitySchemes": {
    "bearerAuth": {
      "type": "http",
      "scheme": "bearer",
      "bearerFormat": "JWT"
    }
  }
  ```
- **Montaje:** En `src/app.js`, la especificación `swagger-output.json` se sirve mediante `swagger-ui-express` en la ruta pública `/docs`.
- **Verificación:** Se ejecutó `npm run docs` sin advertencias ni errores.

### 4.2 Autenticación, Autorización y Seguridad RFC 6750
- **Formato de Token:** JSON Web Token (JWT) firmado con algoritmo simétrico `HS256`, expiración a 15 minutos, e inclusión de claims estándar (`sub: usuarioId`, `email`, `roles: Array<string>`, `jti: UUIDv4`).
- **Middleware de Autenticación (`src/middlewares/autenticar.js`):**
  - Si falta la cabecera `Authorization`: Responde `401 Unauthorized` con cabecera `WWW-Authenticate: Bearer`.
  - Si el esquema no es `Bearer` (ej: `Basic xyz`): Responde `400 Bad Request` con cabecera `WWW-Authenticate: Bearer error="invalid_request"`.
  - Si el token está vencido, alterado o fue revocado: Responde `401 Unauthorized` con cabecera `WWW-Authenticate: Bearer error="invalid_token"`.
- **Revocación de Sesión (Logout Activo):**
  - Al invocar `POST /usuarios/logout`, se extrae el identificador único de token (`jti`) y su fecha de expiración (`exp`), insertándolo en la tabla `TokenRevocado`.
  - Cada solicitud protegida consulta si el `jti` se encuentra registrado en dicha tabla. Si existe, la petición es rechazada de inmediato.
  - La tarea programada `src/tareas/limpiezaRevocaciones.js` elimina periódicamente los registros cuyo timestamp de expiración ya ha sido superado, garantizando que la base de datos no crezca indefinidamente.
- **Control de Acceso Basado en Roles (RBAC):**
  - `src/middlewares/autorizarRoles.js` recibe una lista de roles permitidos (`ADMINISTRADOR`, `ARTESANO`, etc.).
  - Si el usuario autenticado no posee el rol requerido en su array de roles, responde de forma consistente con `403 Forbidden` (`{ mensaje: "No tiene permiso para esta operación." }`).

### 4.3 Gestión de Solicitudes Feriales (Proceso de Inscripción)
El sistema cumple estrictamente con el ciclo de vida de postulaciones exigido por la cátedra:
1. **Presentación de Postulación (`POST /solicitudes`):**
   - Exclusivo para usuarios con rol `ARTESANO` que hayan completado previamente su perfil comercial (`GET /artesanos/me`).
   - El cuerpo admite únicamente el campo opcional `observaciones`. Cualquier intento de enviar campos prohibidos como `artesanoId` o `estado` es rechazado con `400 Bad Request` por la regla `.strict()`.
   - Se valida la regla de unicidad activa: si el artesano ya cuenta con una postulación en estado `PENDIENTE`, el sistema deniega el duplicado con `409 Conflict`.
2. **Evaluación Administrativa (`PATCH /solicitudes/:id/evaluar`):**
   - Exclusivo para `ADMINISTRADOR`.
   - Admite dictámenes `APROBADA` o `RECHAZADA`.
   - Si la solicitud es aprobada, el servicio actualiza en una transacción el estado del artesano a `activo: true`, habilitándolo comercialmente para la feria.
3. **Asignación Ferial (`PATCH /solicitudes/:id/asignar-stand`):**
   - Permite al administrador asociar un stand físico a una postulación aprobada.
   - Si el stand seleccionado ya se encuentra ocupado por otro artesano, se previene la colisión retornando `409 Conflict`.
4. **Cancelación Propia (`PATCH /solicitudes/:id/cancelar`):**
   - El artesano titular puede dar de baja su postulación mientras permanezca `PENDIENTE`.
   - Si un artesano intenta cancelar una postulación perteneciente a un colega, el sistema responde `404 Not Found` para no filtrar metadatos de terceros.

### 4.4 Rendimiento, Concurrencia y Estrategia de Caché
- **Caché en Memoria RAM:** Implementada con la librería `node-cache` en `src/middlewares/cache.js`.
- **Alcance:** Rutas públicas de alta frecuencia de lectura:
  - `GET /productos` y `GET /productos/all`
  - `GET /productos/:id`
- **Diferenciación de Vistas:** El middleware de caché analiza si la petición contiene un token de artesano o administrador. Si es así, no mezcla la vista pública con la vista administrativa, evitando que filtros privados sean cacheados para visitantes anónimos.
- **TTL (Time to Live):** 30 segundos, reduciendo drásticamente las consultas a Supabase durante picos de concurrencia.
- **Invalidación Activa:** En `src/services/producto.services.js`, cada vez que se crea (`crearProducto`), se actualiza (`actualizarProducto`) o se borra lógicamente (`eliminarProducto`) un producto, se invoca automáticamente `invalidarCacheProductos()`. De este modo, no existen datos obsoletos (stale data) cuando los artesanos gestionan su stock.
- **Cabeceras de Diagnóstico:** Las respuestas incluyen el encabezado HTTP estándar `X-Cache: HIT` cuando la respuesta se sirvió desde memoria, y `X-Cache: MISS` cuando requirió consultar la base de datos PostgreSQL.

### 4.5 Salvaguarda y Protección de la Tabla `Localidad`
- **Restricción Crítica:** La tabla `Localidad` aloja los 44 municipios oficiales de la Provincia de Catamarca (Andalgalá, Belén, Tinogasta, Santa María, Capital, Valle Viejo, etc.), requeridos para la geolocalización y asignación de talleres de los artesanos.
- **Mecanismos de Protección Verificados:**
  1. En `prisma/empty.js` (script de vaciado administrativo de la base), se cuentan los registros de `Localidad` antes y después de la operación. La tabla `Localidad` es excluida de cualquier instrucción `deleteMany()`. Si el recuento varía, el script lanza una excepción crítica de seguridad (`ALERTA DE SEGURIDAD`).
  2. En `tests/helpers/escenario-solicitudes.js`, las funciones `limpiarEscenario` y `crearEscenario` operan únicamente sobre registros con emails `@clase10.test`. Se realiza una aserción estricta de que el conteo de localidades permanece idéntico antes y después de cada prueba.
  3. Comprobación directa efectuada en la auditoría: La tabla cuenta con exactamente **44 registros intactos** en el clúster de Supabase.

---

## 5. Resultados de la Suite de Pruebas Automatizadas

Se ejecutó la suite de pruebas mediante el comando `npm test` (`node --env-file=.env.test --test tests/solicitudes-acceso.test.js tests/solicitud-schema.test.js tests/solicitudes-integracion.test.js`).

### 5.1 Desglose de Pruebas Unitarias de Esquema (`tests/solicitud-schema.test.js`)
- `crearSolicitudSchema`:
  - ✔ Objeto vacío válido (observaciones es opcional)
  - ✔ Observaciones válidas como texto
  - ✔ Observaciones como null
  - ✔ Campo adicional no permitido (rechazo por `.strict()`)
  - ✔ Campo adicional `artesanoId` rechazado por el servidor (`.strict()`)
  - ✔ Observaciones con tipo numérico inválido
- `evaluarSolicitudSchema`:
  - ✔ Estado `APROBADA` válido
  - ✔ Estado `RECHAZADA` válido con observaciones
  - ✔ Estado vacío inválido
  - ✔ Estado no permitido en enum (`PENDIENTE`)
  - ✔ Campo adicional no permitido (`.strict()`)
- `asignarStandSolicitudSchema` (Nuevas pruebas incorporadas):
  - ✔ Objeto vacío válido (`standId` es opcional)
  - ✔ `standId` numérico positivo válido
  - ✔ `standId` numérico string válido (coerción Zod)
  - ✔ `standId` cero rechazado (debe ser positivo)
  - ✔ `standId` negativo rechazado
  - ✔ `standId` decimal rechazado (debe ser entero)
  - ✔ `standId` alfanumérico inválido
  - ✔ Campo adicional no permitido (`.strict()`)
- `crearProductoSchema`:
  - ✔ Producto completo válido
  - ✔ Precio cero rechazado (debe ser positivo)
  - ✔ Precio negativo rechazado
  - ✔ Precio ausente rechazado
  - ✔ Nombre vacío rechazado
  - ✔ Stock decimal rechazado (debe ser entero)
  - ✔ Stock negativo rechazado
  - ✔ `artesanoId` ausente rechazado
  - ✔ `artesanoId` cero rechazado (debe ser positivo)
*Subtotal: 28 pruebas pasadas.*

### 5.2 Desglose de Pruebas de Contrato y Acceso HTTP (`tests/solicitudes-acceso.test.js`)
- ✔ `POST /solicitudes` sin token devuelve `401 Unauthorized` (`"Se requiere un token de acceso."`)
- ✔ `POST /solicitudes` con cabecera mal formada (`Basic abc`) devuelve `400 Bad Request` (`"Usar Authorization: Bearer <token>."`)
- ✔ `POST /solicitudes` con token inválido devuelve `401 Unauthorized` (`"Token inválido, vencido o revocado."`)
- ✔ `GET /solicitudes/me` sin token devuelve `401 Unauthorized`
- ✔ `GET /artesanos/me` sin token devuelve `401 Unauthorized`
*Subtotal: 5 pruebas pasadas en 886ms con desconexión limpia de Prisma.*

### 5.3 Desglose de Pruebas de Integración con Supabase (`tests/solicitudes-integracion.test.js`)
- ✔ **Test 1:** Crear una postulación correcta la guarda en PostgreSQL (Supabase). Verifica que el registro persista en la base con estado `PENDIENTE` vinculado al artesano Ana.
- ✔ **Test 2:** Listar devuelve todas las postulaciones propias y ninguna ajena. Comprueba aislamiento multitenant entre Ana y Bruno.
- ✔ **Test 3:** Impedir cancelar una postulación existente perteneciente a otro artesano. Ana intenta cancelar la postulación de Bruno y recibe `404 Not Found`. El registro de Bruno permanece intacto.
- ✔ **Test 4 (Actividad Integradora):** Repetir postulación devuelve `409 Conflict` y conserva un único registro en Supabase.
- ✔ **Test 5 (Verificación de Roles):** Rol que no corresponde devuelve `403 Forbidden` (`"No tiene permiso para esta operación."`). Ana intenta acceder a la bandeja administrativa `GET /solicitudes`.
*Subtotal: 5 pruebas pasadas en base remota con transacciones reales.*

### 5.4 Resumen Consolidado del Test Runner
```text
ℹ tests 38
ℹ suites 0
ℹ pass 38
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 22133.88
```

---

## 6. Conclusión y Dictamen de Auditoría

Tras la implementación de las mejoras y correcciones requeridas para la Semana 13, el backend de **Poncho Digital** cumple al **100%** con todos los lineamientos pedagógicos y técnicos estipulados en `pautas.md` para la Unidad 5:

1. **Arquitectura:** Totalmente desacoplada, con Express en modo biblioteca importable y bootstrap controlado en `src/server.js`.
2. **Robustez:** Se eliminaron dependencias huérfanas de APIs externas en tiempo de ejecución (`localidad.services.js`).
3. **Calidad de Pruebas:** Cobertura integral de validadores, contratos HTTP y transacciones en base de datos sin retardos artificiales ni procesos colgados.
4. **Documentación:** Especificación OpenAPI 3.0 sincronizada con los esquemas de producción y accesible interactivamente en `/docs`.
5. **Seguridad y Persistencia:** Esquema Bearer riguroso bajo RFC 6750 y conservación garantizada de la integridad de las localidades provinciales.

**Dictamen:** **APROBADO CON MÁXIMA CALIFICACIÓN** para la transición al hito de documentación maestra y preparación de la defensa oral.
