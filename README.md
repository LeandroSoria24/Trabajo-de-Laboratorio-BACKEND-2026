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

Plataforma digital para la gestión y difusión de los artesanos, productores y productos de la tradicional **Fiesta Nacional e Internacional del Poncho** en la provincia de Catamarca. La API REST proporciona servicios desacoplados para la postulación y registro de artesanos, administración de su catálogo de productos artesanales, asignación de stands dentro del predio ferial, gestión de usuarios con roles y recopilación de estadísticas de búsqueda de visitantes.

---

## Tecnologías Utilizadas

| Tecnología | Versión | Rol |
|---|---|---|
| **Node.js** | v24 LTS | Runtime (ESM `"type": "module"`) |
| **Express.js** | v5.x | Framework HTTP |
| **PostgreSQL** | — | Motor de base de datos relacional |
| **Prisma ORM** | v7.10.x | Acceso a datos (cliente con adaptador `@prisma/adapter-pg`) |
| **Zod** | v4.4.3 | Validación declarativa de esquemas y contratos de entrada |
| **Dotenv** | v17.x | Gestión segura de credenciales por variables de entorno |

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
Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`:
```env
DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST:5432/postgres?schema=public"
```

### 4. Ejecutar migraciones y generar el cliente de Prisma
```bash
# Aplicar migraciones en PostgreSQL (desarrollo)
npx prisma migrate dev

# O en entornos de despliegue / producción:
npx prisma migrate deploy

# Verificar estado de las migraciones
npx prisma migrate status

# Generar el cliente Prisma en src/generated/prisma
npx prisma generate
```

*(Opcional) Abrir Prisma Studio para inspeccionar visualmente la base de datos:*
```bash
npx prisma studio
```

### 5. Iniciar la aplicación
* **Modo desarrollo** (con recarga en caliente vía `node --watch`):
  ```bash
  npm run dev
  ```
* **Modo producción:**
  ```bash
  npm start
  ```

El servidor iniciará en: `http://localhost:3000`

---

## Arquitectura del Proyecto (4 Capas)

El proyecto adopta la arquitectura modular por capas recomendada por la cátedra:

```
Petición HTTP
     │
     ▼
┌──────────────────┐
│   Routes         │  Declara los endpoints y encadena middlewares
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Middlewares    │  validarSchema (Zod), logger, manejoErrores
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Controllers    │  Extrae DTO de req, delega al servicio, responde
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Services       │  Lógica de negocio, reglas de integridad
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Prisma ORM     │  Acceso a PostgreSQL (queries, transactions)
└──────────────────┘
```

### Estructura de directorios

```text
src/
├── app.js                          # Configuración de Express, middlewares globales y montaje de routers
├── config/
│   └── prisma.js                   # Instancia singleton del cliente Prisma
├── controllers/
│   ├── artesano.controllers.js
│   ├── producto.controllers.js
│   ├── localidad.controllers.js
│   ├── stand.controllers.js
│   ├── solicitud.controllers.js
│   ├── usuario.controllers.js
│   └── registroConsulta.controllers.js
├── middlewares/
│   ├── logger.js                   # Registro de tiempo y estado de cada petición
│   ├── manejoErrores.js            # Manejador global centralizado de errores
│   ├── rutaNoEncontrada.js         # Captura de rutas no registradas (404)
│   └── validarSchema.js            # Middleware fábrica genérico de validación Zod (body | params | query)
├── routes/
│   ├── artesano.routes.js
│   ├── producto.routes.js
│   ├── localidad.routes.js
│   ├── stand.routes.js
│   ├── solicitud.routes.js
│   ├── usuario.routes.js
│   └── registroConsulta.routes.js
├── services/
│   ├── artesano.services.js
│   ├── producto.services.js
│   ├── localidad.services.js
│   ├── stand.services.js
│   ├── solicitud.services.js
│   ├── usuario.services.js
│   └── registroConsulta.services.js
├── utils/
│   ├── crearError.js               # Fábrica estándar de errores HTTP con status, mensaje y details
│   └── ErroresZod.js               # Formateador de errores de Zod a { path, message }
└── validators/
    ├── comun.schemas.js            # Esquemas compartidos (p. ej. validación de :id)
    ├── artesano.schemas.js
    ├── producto.schemas.js
    ├── localidad.schemas.js
    ├── stand.schemas.js
    ├── solicitud.schemas.js
    ├── usuario.schemas.js
    └── registroConsulta.schemas.js
```

---

## Modelo de Datos

El schema Prisma (`prisma/schema.prisma`) define los siguientes **enums** y **modelos**:

### Enums

| Enum | Valores |
|---|---|
| `RolUsuario` | `ADMINISTRADOR`, `ARTESANO`, `VISITANTE` |
| `EstadoSolicitud` | `PENDIENTE`, `APROBADA`, `RECHAZADA`, `MODIFICACION_SOLICITADA` |
| `EstadoStand` | `DISPONIBLE`, `OCUPADO` |

### Modelos y relaciones

```
Usuario (1) ──── (0..1) Artesano (1) ──── (N) Producto
   │                       │
   │                       └──── (0..1) Stand
   │
   ├──── (N) SolicitudPostulacion
   └──── (N) RegistroConsulta

Localidad (1) ──── (N) Artesano
```

| Modelo | Descripción | Soft Delete |
|---|---|---|
| `Usuario` | Cuenta del sistema con rol (`RolUsuario`). Campo `activo` para baja lógica. | `activo: Boolean` |
| `Localidad` | Tabla de localidades de Catamarca, referenciada por `Artesano`. | — |
| `Artesano` | Entidad núcleo. Vinculada a `Usuario` (opcional), `Localidad`, sus `Producto[]` y un `Stand?`. | `activo: Boolean` |
| `Stand` | Espacio físico en el predio. Estado controlado por `EstadoStand`. Asignación 1:1 con `Artesano`. | — |
| `Producto` | Artículo del catálogo de un artesano. | `eliminado: Boolean` |
| `SolicitudPostulacion` | Postulación de un usuario para convertirse en artesano. Estado controlado por `EstadoSolicitud`. | — |
| `RegistroConsulta` | Traza de búsquedas realizadas en la plataforma. `visitanteId` nullable (soporta anónimos). | — |

### Reglas de integridad clave

- `Artesano.dni` y `Artesano.email` son `@unique`.
- `Stand.codigo` es `@unique` (ej: `STD-101`).
- `Stand.artesanoId` es `@unique`, garantizando la relación **1:1 estricta**.
- `Producto → Artesano`: `onDelete: Cascade` (si se da de baja un artesano, sus productos se eliminan).
- `Stand → Artesano`: `onDelete: SetNull` (si el artesano se desvincula, el stand queda disponible).
- `Artesano → Usuario`: `onDelete: SetNull` (si se elimina el usuario, el artesano permanece sin cuenta).

---

## Endpoints de la API

### Generales
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Bienvenida de la API Poncho Digital |
| `GET` | `/info` | Metadatos de la API (versión y estado) |

---

### Artesanos — `/artesanos`
| Método | Ruta | Descripción | Código Éxito |
|---|---|---|---|
| `GET` | `/artesanos` | Listado paginado con filtros (`?nombre=&rubro=&localidadId=&activo=&pagina=&limite=`) | `200 OK` |
| `GET` | `/artesanos/:id` | Detalle de un artesano (incluye `localidad`, `productos` y `stand`) | `200 OK` |
| `POST` | `/artesanos` | Registro de un nuevo artesano | `201 Created` |
| `PUT` | `/artesanos/:id` | Actualización de datos del artesano | `200 OK` |
| `DELETE` | `/artesanos/:id` | **Soft delete** — marca `activo: false` | `200 OK` |

> `GET /artesanos` filtra `activo: true` por defecto. Para ver inactivos: `?activo=false`.

---

### Productos — `/productos`
| Método | Ruta | Descripción | Código Éxito |
|---|---|---|---|
| `GET` | `/productos` | Listado con filtros, orden y paginación | `200 OK` |
| `GET` | `/productos/:id` | Detalle de un producto | `200 OK` |
| `POST` | `/productos` | Creación de un producto (valida existencia del artesano) | `201 Created` |
| `PUT` | `/productos/:id` | Actualización de datos del producto | `200 OK` |
| `DELETE` | `/productos/:id` | Eliminación **física** del producto | `204 No Content` |
| `PATCH` | `/productos/:id` | **Soft delete** — marca `eliminado: true` | `200 OK` |

---

### Localidades — `/localidades`
| Método | Ruta | Descripción | Código Éxito |
|---|---|---|---|
| `GET` | `/localidades` | Listado de localidades con filtros | `200 OK` |
| `GET` | `/localidades/:id` | Detalle de una localidad | `200 OK` |
| `POST` | `/localidades` | Creación de una nueva localidad | `201 Created` |
| `PUT` | `/localidades/:id` | Actualización de nombre o provincia | `200 OK` |
| `DELETE` | `/localidades/:id` | Eliminación de una localidad | `204 No Content` |

---

### Stands — `/stands`
| Método | Ruta | Descripción | Código Éxito |
|---|---|---|---|
| `GET` | `/stands` | Listado con filtros por `pabellon`, `sector`, `estado` | `200 OK` |
| `GET` | `/stands/:id` | Detalle de un stand | `200 OK` |
| `POST` | `/stands` | Creación de un nuevo stand | `201 Created` |
| `PUT` | `/stands/:id` | Actualización de datos del stand | `200 OK` |
| `DELETE` | `/stands/:id` | Eliminación de un stand | `204 No Content` |
| `POST` | `/stands/:id/asignar` | Asigna un artesano al stand (transacción atómica) | `200 OK` |
| `PATCH` | `/stands/:id/desasignar` | Libera el stand (`estado: DISPONIBLE`, `artesanoId: null`) | `200 OK` |

> La asignación usa `prisma.$transaction` para garantizar atomicidad y evitar race conditions.

---

### Solicitudes de Postulación — `/solicitudes`
| Método | Ruta | Descripción | Código Éxito |
|---|---|---|---|
| `POST` | `/solicitudes` | Nueva solicitud de postulación (público) | `201 Created` |
| `GET` | `/solicitudes` | Listado de solicitudes con filtro por `estado` | `200 OK` |
| `GET` | `/solicitudes/:id` | Detalle de una solicitud | `200 OK` |
| `PATCH` | `/solicitudes/:id/evaluar` | Cambia el `estado` y agrega `observaciones` (admin) | `200 OK` |
| `DELETE` | `/solicitudes/:id` | Eliminación de una solicitud | `204 No Content` |

---

### Usuarios — `/usuarios`
| Método | Ruta | Descripción | Código Éxito |
|---|---|---|---|
| `GET` | `/usuarios` | Listado de usuarios con filtros | `200 OK` |
| `GET` | `/usuarios/:id` | Detalle de un usuario | `200 OK` |
| `POST` | `/usuarios` | Creación de un nuevo usuario | `201 Created` |
| `PUT` | `/usuarios/:id` | Actualización de datos del usuario | `200 OK` |
| `DELETE` | `/usuarios/:id` | **Soft delete** — marca `activo: false` | `200 OK` |

---

### Registro de Consultas — `/consultas`
| Método | Ruta | Descripción | Código Éxito |
|---|---|---|---|
| `GET` | `/consultas` | Listado de registros de búsqueda con paginación | `200 OK` |
| `GET` | `/consultas/:id` | Detalle de un registro | `200 OK` |
| `POST` | `/consultas` | Registra una nueva búsqueda (soporta visitantes anónimos) | `201 Created` |
| `DELETE` | `/consultas/:id` | Eliminación de un registro | `204 No Content` |

> `visitanteId` es **nullable**; permite trazar búsquedas de visitantes no autenticados.

---

## Formato Estándar de Errores

La API implementa un formato unificado de respuestas de error:

```json
{
  "error": "Error en los parámetros del producto",
  "details": [
    {
      "path": "precio",
      "message": "El precio debe ser mayor a 0"
    }
  ]
}
```

* `error`: Mensaje general descriptivo del error.
* `details`: *(Opcional)* Array generado por `ErroresZod.js` con el campo (`path`) y el mensaje de validación (`message`) de cada falla.

---

## Códigos de Estado HTTP

| Código | Semántica | Cuándo se usa |
|---|---|---|
| `200 OK` | Éxito | Lecturas y actualizaciones |
| `201 Created` | Recurso creado | `POST` exitoso |
| `204 No Content` | Eliminación exitosa | `DELETE` sin cuerpo |
| `400 Bad Request` | Datos inválidos | Rechazado por Zod o regla de negocio |
| `404 Not Found` | Recurso inexistente | ID no encontrado o ruta no registrada |
| `500 Internal Server Error` | Falla interna | Excepción no controlada (gestionada por `manejoErrores`) |

---

## Documentación Técnica Detallada

En la carpeta [`documentacionPropia/`](documentacionPropia/) se encuentran disponibles guías exhaustivas:

| # | Documento | Contenido |
|---|---|---|
| 1 | [Arquitectura por Capas](documentacionPropia/arquitectura-capas.md) | Organización desacoplada Routes → Middlewares → Controllers → Services → Prisma |
| 2 | [Guía de Prisma ORM](documentacionPropia/guia-prisma.md) | Configuración con PostgreSQL, Prisma 7, schema declarativo y cliente singleton |
| 3 | [Guía de Validación con Zod](documentacionPropia/guia-zod.md) | Esquemas Zod 4, `.safeParse()`, sanitización automática y DTOs |
| 4 | [Middlewares y Utilidades](documentacionPropia/middlewares-y-utils.md) | `logger`, `validarSchema`, `crearError`, `rutaNoEncontrada`, `manejoErrores` |
| 5 | [Consultas y CRUD con Prisma](documentacionPropia/consultas-y-crud-prisma.md) | `findMany`, `findUnique`, `where`, `orderBy`, paginación, mutaciones y relaciones |
| 6 | [Flujograma de Ejecución](documentacionPropia/flujoprograma.md) | Diagramas Mermaid del ciclo de vida de peticiones válidas y captura de excepciones |
