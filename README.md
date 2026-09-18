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

Plataforma digital para la gestión y difusión de los artesanos, productores y productos de la tradicional **Fiesta Nacional e Internacional del Poncho** en la provincia de Catamarca. La API REST proporciona servicios desacoplados para la postulación y registro de artesanos, administración de su catálogo de productos artesanales, asignación de stands dentro del predio ferial y recopilación de estadísticas.

---

## Tecnologías Utilizadas

* **Node.js**: v20 / v24 LTS (ESM `"type": "module"`)
* **Express.js**: v5.x
* **PostgreSQL**: Motor de base de datos relacional
* **Prisma ORM**: v7.x (cliente con adaptador `@prisma/adapter-pg`)
* **Zod**: Validación declarativa de esquemas y contratos de entrada
* **Dotenv**: Gestión segura de credenciales por variables de entorno

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

### 3. Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto tomando como referencia [.env.example](file:///c:/Users/actos/Desktop/Laboratorio/Trabajo-de-Laboratorio-BACKEND-2026/.env.example):
```env
DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST:5432/postgres?schema=public"
```

### 4. Sincronizar y generar el cliente de Prisma
```bash
# Sincronizar modelos en PostgreSQL
npx prisma db push

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

```text
src/
├── app.js                      # Configuración de Express, middlewares y rutas
├── config/
│   └── prisma.js              # Instancia compartida del cliente Prisma
├── controllers/                # Coordinación HTTP y delegación mediante DTOs
│   ├── artesano.controllers.js
│   └── producto.controllers.js
├── middlewares/                # Filtros, validaciones y manejo global de errores
│   ├── logger.js               # Registro de tiempo y estado de cada petición
│   ├── manejoErrores.js        # Manejador global centralizado de errores
│   ├── rutaNoEncontrada.js     # Captura de rutas no existentes (404)
│   └── validaciones/
│       ├── validarId.js        # Validación de parámetros numéricos en URL (:id)
│       ├── validarProducto.js  # Validación con Zod para req.body en POST/PUT (DTO)
│       └── validarQuerys.js    # Validación con Zod para req.query (filtros y paginación)
├── routes/                     # Definición de endpoints y handlers
│   ├── artesano.routes.js
│   └── producto.routes.js
├── services/                   # Lógica de negocio y persistencia con Prisma
│   └── producto.services.js
├── utils/
│   ├── crearError.js          # Fábrica estándar de errores HTTP (status, mensaje y details)
│   └── ErroresZod.js          # Formateador de errores de Zod a { path, message }
└── validators/
    └── producto.schemas.js    # Contratos declarativos de entrada con Zod (body, params y querys)
```

---

## Endpoints de la API

### Generales
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Bienvenida de la API Poncho Digital |
| `GET` | `/info` | Metadatos de la API (versión y estado) |

---

### Artesanos (`/artesanos`)
| Método | Ruta | Descripción | Código Éxito |
|---|---|---|---|
| `GET` | `/artesanos` | Listado completo de artesanos con sus productos | `200 OK` |
| `GET` | `/artesanos/:id` | Detalle de un artesano por su ID | `200 OK` |
| `POST` | `/artesanos` | Registro / postulación de un nuevo artesano | `201 Created` |
| `PUT` | `/artesanos/:id` | Actualización de datos del artesano | `200 OK` |
| `DELETE` | `/artesanos/:id` | Eliminación de un artesano por su ID | `204 No Content` |

---

### Productos (`/productos`)
| Método | Ruta | Descripción | Código Éxito |
|---|---|---|---|
| `GET` | `/productos` | Listado con filtros, orden y paginación (`?nombre=&precio=&pagina=&limite=`) | `200 OK` |
| `GET` | `/productos/:id` | Detalle de un producto por su ID (valida ID con Zod) | `200 OK` |
| `POST` | `/productos` | Creación de un producto (valida body con Zod y persistencia) | `201 Created` |
| `PUT` | `/productos/:id` | Actualización de datos de un producto (valida ID y body con Zod) | `200 OK` |
| `DELETE` | `/productos/:id` | Eliminación física definitiva de un producto por su ID | `200 OK` |
| `PATCH` | `/productos/:id` | Eliminación lógica (soft delete marcando `eliminado: true`) | `200 OK` |

---

## Formato Estándar de Errores

La API implementa un formato unificado de respuestas de error. Cuando una petición falla por validación o regla de negocio, el cliente recibe:

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
* `details`: *(Opcional)* Array con el detalle de cada campo que falló (`path` y `message`), generado automáticamente por `ErroresZod.js`.

---

## Códigos de Estado HTTP

* `200 OK`: Petición exitosa (lectura o actualización).
* `201 Created`: Creación exitosa de un recurso.
* `204 No Content`: Eliminación exitosa sin cuerpo de respuesta.
* `400 Bad Request`: Formato de datos inválido (rechazado por Zod o reglas de negocio con `details`).
* `404 Not Found`: Recurso inexistente por ID o endpoint no registrado.
* `500 Internal Server Error`: Excepción no controlada gestionada por `manejoErrores` (`{ "error": "Error interno del servidor" }`).

---

## Documentación Técnica Detallada

En la carpeta [`documentacionPropia/`](file:///c:/Users/actos/Desktop/Laboratorio/Trabajo-de-Laboratorio-BACKEND-2026/documentacionPropia) se encuentran disponibles guías exhaustivas preparadas para la cátedra:

1. [**Arquitectura por Capas**](file:///c:/Users/actos/Desktop/Laboratorio/Trabajo-de-Laboratorio-BACKEND-2026/documentacionPropia/arquitectura-capas.md): Organización desacoplada (Rutas $\rightarrow$ Middlewares/Zod $\rightarrow$ Controladores $\rightarrow$ Servicios $\rightarrow$ Prisma ORM).
2. [**Guía de Prisma ORM**](file:///c:/Users/actos/Desktop/Laboratorio/Trabajo-de-Laboratorio-BACKEND-2026/documentacionPropia/guia-prisma.md): Configuración con PostgreSQL, Prisma 7, schema declarativo y cliente singleton.
3. [**Guía de Validación con Zod**](file:///c:/Users/actos/Desktop/Laboratorio/Trabajo-de-Laboratorio-BACKEND-2026/documentacionPropia/guia-zod.md): Esquemas de validación, `.safeParse()`, sanitización automática y DTOs.
4. [**Middlewares y Utilidades**](file:///c:/Users/actos/Desktop/Laboratorio/Trabajo-de-Laboratorio-BACKEND-2026/documentacionPropia/middlewares-y-utils.md): Explicación línea por línea de `logger`, `validarId`, `validarProducto`, `crearError`, `rutaNoEncontrada` y `manejoErrores`.
5. [**Consultas y Operaciones CRUD con Prisma**](file:///c:/Users/actos/Desktop/Laboratorio/Trabajo-de-Laboratorio-BACKEND-2026/documentacionPropia/consultas-y-crud-prisma.md): Métodos de consulta (`findMany`, `findUnique`, `where`, `orderBy`, paginación), mutaciones y relaciones 1:N.
6. [**Flujograma de Ejecución**](file:///c:/Users/actos/Desktop/Laboratorio/Trabajo-de-Laboratorio-BACKEND-2026/documentacionPropia/flujoprograma.md): Diagramas Mermaid detallando el ciclo de vida de peticiones válidas y captura de excepciones.

