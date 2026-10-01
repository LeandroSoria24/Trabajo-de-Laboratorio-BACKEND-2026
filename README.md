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

Plataforma digital para la gestión y difusión de los artesanos, productores y productos de la tradicional **Fiesta Nacional e Internacional del Poncho** en la provincia de Catamarca. La API REST proporciona servicios desacoplados para la autenticación y registro de usuarios con roles, gestión integral de artesanos vinculados a sus cuentas, administración de su catálogo de productos artesanales, organización del predio ferial mediante pabellones, sectores y stands (con asignación 1:1), y evaluación de solicitudes de postulación por parte de evaluadores y administradores.

---

## Tecnologías Utilizadas

| Tecnología | Versión | Rol |
|---|---|---|
| **Node.js** | v24 LTS | Runtime (ESM `"type": "module"`) |
| **Express.js** | v5.x | Framework HTTP |
| **PostgreSQL** | Supabase | Motor de base de datos relacional con tipos nativos (`UUID`, `DECIMAL`) |
| **Prisma ORM** | v7.10.x | Acceso a datos (cliente con adaptador `@prisma/adapter-pg`) |
| **Bcrypt** | v6.0.0 | Hashing seguro de contraseñas (salt factor 10) |
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
# Aplicar migraciones pendientes en PostgreSQL
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
│   Services       │  Lógica de negocio, bcrypt, reglas de integridad
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Prisma ORM     │  Acceso a PostgreSQL (queries, transactions)
└──────────────────┘
```

---

## Modelo de Datos

El schema Prisma (`prisma/schema.prisma`) define los siguientes **enums** y **modelos**:

### Enums

| Enum | Valores | Descripción |
|---|---|---|
| `RolUsuario` | `ADMINISTRADOR`, `EVALUADOR`, `ARTESANO`, `VISITANTE` | Roles del sistema con permisos diferenciados |
| `EstadoStand` | `DISPONIBLE`, `OCUPADO`, `MANTENIMIENTO` | Estado operativo de los stands del predio |
| `EstadoSolicitud` | `PENDIENTE`, `EN_REVISION`, `APROBADA`, `RECHAZADA` | Estados del circuito de postulación |

### Diagrama Entidad-Relación (DER)

![Diagrama Entidad-Relación - Poncho Digital](documentacionPropia/der-poncho-digital.png)

### Diagrama de Relaciones

```
Usuario (1) ═══════════════ (1) Artesano (1) ──── (N) Producto
   │                               │
   │ (evaluador)                   └──── (0..1) Stand (1) ──── Pabellon (N:1)
   ▼                                       │           └──── Sector (N:1)
SolicitudPostulacion (N) ◄─────────────────┘
   ▲
   │ (postulante)
   └─────────────────────────────── Artesano (N:1)

Localidad (1) ──────────────────── (N) Artesano
```

### Modelos y Entidades

| Modelo | Descripción | Identificador | Soft Delete |
|---|---|---|---|
| `Usuario` | Cuenta del sistema. Contraseña hasheada con bcrypt (`passwordHash`) y rol asignado. | `id: String @db.Uuid` | — |
| `Localidad` | Localidades de Catamarca referenciadas por artesanos. | `id: Int` | — |
| `Artesano` | Perfil de artesano vinculado **obligatoriamente (1 a 1)** a un `Usuario`. | `id: Int` | `activo: Boolean` |
| `Producto` | Artículo del catálogo de un artesano. Moneda con precisión `Decimal(10,2)`. | `id: Int` | `activo: Boolean` |
| `Pabellon` | Pabellón del predio ferial (ej: "Pabellón de Artesanías Tradicionales"). | `id: Int` | — |
| `Sector` | Sector interno del predio (ej: "Sector Norte"). | `id: Int` | — |
| `Stand` | Espacio físico. Vinculado a Pabellón, Sector y asignación **1:1 opcional** con Artesano. | `id: Int` | — |
| `SolicitudPostulacion` | Postulación de un artesano para un stand, evaluada por un usuario evaluador. | `id: Int` | — |

### Reglas de integridad clave
- **`Usuario.id` es UUID (`@db.Uuid`)**: Identificador único global compatible con seguridad criptográfica.
- **`Usuario.rol` con `@default(VISITANTE)`**: Todo usuario nuevo ingresa como visitante automáticamente.
- **`Artesano ↔ Usuario` (1:1 obligatorio)**: `usuarioId String @unique @db.Uuid` con `onDelete: Cascade`.
- **`Stand ↔ Artesano` (1:1 opcional)**: `artesanoId Int? @unique` con `onDelete: SetNull`.
- **`Producto ↔ Artesano`**: `onDelete: Cascade` (si se elimina el artesano, se eliminan sus productos).
- **`SolicitudPostulacion`**: Relaciona `artesanoId` (postulante), `standId` (stand pedido) y `evaluadorId` (`Usuario` que dictamina).

---

## Endpoints de la API

### Autenticación y Usuarios — `/usuarios`
| Método | Ruta | Descripción | Validación Zod | Código Éxito |
|---|---|---|---|---|
| `POST` | `/usuarios/registro` | Registra un nuevo usuario con contraseña hasheada (bcrypt) y rol `VISITANTE` | `registrarUsuarioSchema` | `201 Created` |
| `POST` | `/usuarios/login` | Inicia sesión verificando hash bcrypt y retorna datos del usuario y rol | `iniciarSesionSchema` | `200 OK` |

---

### Artesanos — `/artesanos`
| Método | Ruta | Descripción | Código Éxito |
|---|---|---|---|
| `GET` | `/artesanos` | Listado paginado con filtros (`?nombre=&rubro=&localidadId=&activo=&pagina=&limite=`) | `200 OK` |
| `GET` | `/artesanos/:id` | Detalle de un artesano (incluye `localidad`, `productos` y `stand`) | `200 OK` |
| `POST` | `/artesanos` | Registro de artesano (requiere `usuarioId` UUID existente) | `201 Created` |
| `PUT` | `/artesanos/:id` | Actualización de datos del artesano | `200 OK` |
| `DELETE` | `/artesanos/:id` | **Soft delete** — marca `activo: false` | `200 OK` |

---

### Productos — `/productos`
| Método | Ruta | Descripción | Código Éxito |
|---|---|---|---|
| `GET` | `/productos` | Listado con filtros, orden y paginación | `200 OK` |
| `GET` | `/productos/:id` | Detalle de un producto | `200 OK` |
| `POST` | `/productos` | Creación de un producto (valida existencia del artesano) | `201 Created` |
| `PUT` | `/productos/:id` | Actualización de datos del producto | `200 OK` |
| `DELETE` | `/productos/:id` | Eliminación **física** del producto | `204 No Content` |
| `PATCH` | `/productos/:id` | **Soft delete** — marca `activo: false` | `200 OK` |

---

### Stands, Pabellones y Sectores — `/stands`
| Método | Ruta | Descripción | Código Éxito |
|---|---|---|---|
| `GET` | `/stands` | Listado con filtros por `pabellonId`, `sectorId`, `estado`, `artesanoId` | `200 OK` |
| `GET` | `/stands/:id` | Detalle de un stand | `200 OK` |
| `POST` | `/stands` | Creación de stand (`pabellonId`, `sectorId`, `codigo`, `numero`) | `201 Created` |
| `PUT` | `/stands/:id` | Actualización de datos del stand | `200 OK` |
| `DELETE` | `/stands/:id` | Eliminación de un stand | `204 No Content` |

---

## Formato Estándar de Errores

La API implementa un formato unificado de respuestas de error:

```json
{
  "error": "El email no tiene un formato válido.",
  "details": [
    {
      "path": "email",
      "message": "El email no tiene un formato válido."
    }
  ]
}
```

---

## Documentacion Tecnica Detallada

> **Documento Maestro Unificado:**  
> Puedes consultar la guia completa con toda la teoria, arquitectura, base de datos, flujos de ejecucion y endpoints en:  
> **[DOCUMENTACION COMPLETA UNIFICADA](documentacionPropia/DOCUMENTACION_COMPLETA.md)**

En la carpeta [`documentacionPropia/`](documentacionPropia/) tambien se encuentran disponibles las guias tecnicas individuales:

| # | Documento | Contenido |
|---|---|---|
| Ref | **[Documentacion Completa Unificada](documentacionPropia/DOCUMENTACION_COMPLETA.md)** | **Compendio integral de toda la teoria, arquitectura, base de datos, diagramas y endpoints.** |
| 1 | [Arquitectura por Capas](documentacionPropia/arquitectura-capas.md) | Organizacion desacoplada Routes -> Middlewares -> Controllers -> Services -> Prisma |
| 2 | [Estructura de Base de Datos](documentacionPropia/estructura-base-de-datos.md) | Explicacion teorica del modelo relacional, diagrama ER Mermaid, normalizacion y decisiones de diseño |
| 3 | [Guia de Prisma ORM](documentacionPropia/guia-prisma.md) | Configuracion con PostgreSQL, Prisma 7, schema declarativo y cliente singleton |
| 4 | [Guia de Validacion con Zod](documentacionPropia/guia-zod.md) | Esquemas Zod 4, validacion de UUIDs, sanitizacion automatica y DTOs |
| 5 | [Middlewares y Utilidades](documentacionPropia/middlewares-y-utils.md) | `logger`, `validarSchema`, `crearError`, `rutaNoEncontrada`, `manejoErrores` |
| 6 | [Consultas y CRUD con Prisma](documentacionPropia/consultas-y-crud-prisma.md) | `findMany`, `findUnique`, `where`, `orderBy`, paginacion, mutaciones y transacciones |
| 7 | [Flujograma de Ejecucion](documentacionPropia/flujoprograma.md) | Diagramas Mermaid del ciclo de vida de peticiones validas y captura de excepciones |

