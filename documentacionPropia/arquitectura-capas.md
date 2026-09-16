# Arquitectura por Capas — API de Biblioteca

Este documento explica cómo está organizado el proyecto por capas, qué responsabilidad tiene cada una, qué reglas de negocio maneja, y por qué es importante que cada capa **solo haga su trabajo y nada más**.

---

## 📑 Índice
1. [¿Qué es una Arquitectura por Capas?](#qué-es-una-arquitectura-por-capas)
2. [Vista General del Proyecto](#vista-general-del-proyecto)
3. [Capa 1: Punto de Entrada (`app.js`)](#capa-1-punto-de-entrada-appjs)
4. [Capa 2: Rutas (`routes/`)](#capa-2-rutas-routes)
5. [Capa 3: Middlewares (`middlewares/`)](#capa-3-middlewares-middlewares)
6. [Capa 4: Validadores (`validators/`)](#capa-4-validadores-validators)
7. [Capa 5: Controladores (`controllers/`)](#capa-5-controladores-controllers)
8. [Capa 6: Acceso a Datos — Prisma (`config/`, `prisma/`)](#capa-6-acceso-a-datos--prisma)
9. [Capa Transversal: Utilidades (`utils/`)](#capa-transversal-utilidades-utils)
10. [Flujo Completo de una Petición](#flujo-completo-de-una-petición)
11. [Reglas de Negocio por Entidad](#reglas-de-negocio-por-entidad)
12. [Principio de Separación de Responsabilidades](#principio-de-separación-de-responsabilidades)
13. [Tabla Resumen: Quién Hace Qué](#tabla-resumen-quién-hace-qué)

---

## ¿Qué es una Arquitectura por Capas?

Es una forma de organizar el código donde **cada carpeta (capa) tiene una responsabilidad clara y definida**. Ninguna capa debería hacer el trabajo de otra.

### Analogía: Un restaurante

```
┌──────────────────────────────────────────────────────────────┐
│                        RESTAURANTE                           │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│   Recepción  │   Mozo       │   Cocina     │   Depósito      │
│   (app.js)   │   (routes)   │   (control.) │   (Prisma/BD)   │
├──────────────┼──────────────┼──────────────┼─────────────────┤
│ Abre el      │ Recibe al    │ Prepara el   │ Guarda y        │
│ local,       │ cliente,     │ pedido,      │ entrega los     │
│ configura    │ toma el      │ verifica     │ ingredientes    │
│ las mesas    │ pedido y     │ que esté     │ (datos)         │
│              │ lo lleva     │ bien hecho   │                 │
│              │ a cocina     │              │                 │
└──────────────┴──────────────┴──────────────┴─────────────────┘
```

**Regla fundamental:** El mozo no cocina. La cocina no atiende mesas. El depósito no toma pedidos.

---

## Vista General del Proyecto

```
src/
├── app.js                          ← Punto de entrada (configura Express)
│
├── routes/                         ← Capa de Enrutamiento
│   ├── libro.routes.js
│   └── autor.routes.js
│
├── middlewares/                     ← Capa de Middlewares (filtros intermedios)
│   ├── logger.js                       ← Monitoreo
│   ├── manejoErrores.js                ← Red de seguridad final
│   ├── rutaNoEncontrada.js             ← Captura 404
│   └── validaciones/
│       ├── validarId.js                ← Validación de parámetros URL
│       └── validadlibro.js             ← Validación de body con Zod
│
├── validators/                     ← Capa de Esquemas de Validación (Zod)
│   └── libro.schemas.js              ← Contratos de entrada
│
├── controllers/                    ← Capa de Controladores (recibe HTTP, valida DTO, responde)
│   ├── libro.controllers.js
│   └── autor.controllers.js
│
├── services/                       ← Capa de Servicios (lógica de negocio y único acceso a Prisma)
│   └── libro.services.js
│
├── config/                         ← Capa de Configuración
│   └── prisma.js                      ← Conexión a la base de datos
│
├── utils/                          ← Utilidades transversales
│   └── crearError.js                  ← Fábrica de errores
│
├── data/                           ← Datos estáticos (legacy, ya no se usan activamente)
│   ├── libros.data.js
│   └── autores.data.js
│
└── generated/prisma/               ← Código auto-generado por Prisma (NO se toca)

prisma/
└── schema.prisma                   ← Definición de modelos y relaciones (BD)
```

---

## Capa 1: Punto de Entrada (`app.js`)

**Archivo:** `src/app.js`  
**Responsabilidad:** Configurar y arrancar la aplicación Express.

### ¿Qué hace esta capa?
1. Crea la instancia de Express (`const app = express()`).
2. Registra el middleware de parseo JSON (`app.use(express.json())`).
3. Conecta los middlewares globales (logger).
4. Monta las rutas bajo sus prefijos (`/libros`, `/autores`).
5. Registra los middlewares de error (404 y manejo global).
6. Inicia el servidor en el puerto configurado.

### ¿Qué NO debe hacer?
- ❌ Definir lógica de negocio.
- ❌ Hacer consultas a la base de datos.
- ❌ Validar datos de entrada.

### Código:
```javascript
import express from "express";
import librosRoutes from './routes/libro.routes.js';
import autoresRoutes from './routes/autor.routes.js';
import { logger } from "./middlewares/logger.js"
import { manejoErrores } from "./middlewares/manejoErrores.js"
import { rutaNoEncontrada } from "./middlewares/rutaNoEncontrada.js"

const app = express();
const PORT = 3000;
app.use(express.json());

app.use(logger);                          // 1° Middleware: monitoreo

app.use('/libros', librosRoutes);         // Rutas de libros
app.use('/autores', autoresRoutes);       // Rutas de autores

app.use(rutaNoEncontrada);                // Captura rutas inexistentes (404)
app.use(manejoErrores);                   // Red de seguridad final (errores)

app.listen(PORT, () => {
    console.log(`servidor iniciado en puerto http://localhost:${PORT}`)
});
```

### Orden estricto en app.js:
```
1. express.json()         ← Parsear el body
2. logger                 ← Registrar peticiones
3. Rutas                  ← Atender peticiones
4. rutaNoEncontrada       ← Capturar lo que no coincidió
5. manejoErrores          ← Responder errores
```

> [!WARNING]
> **El orden en `app.js` importa.** Si `manejoErrores` se coloca antes de las rutas, nunca se ejecutaría porque Express solo lo activa cuando alguien llama a `next(error)`. Si `rutaNoEncontrada` se coloca antes de las rutas, toda petición devolvería 404.

---

## Capa 2: Rutas (`routes/`)

**Archivos:** `src/routes/libro.routes.js`, `src/routes/autor.routes.js`  
**Responsabilidad:** Definir **qué endpoints existen** y **en qué orden pasan los middlewares y controladores**.

### ¿Qué hace esta capa?
- Declara los métodos HTTP disponibles (GET, POST, PUT, DELETE).
- Asigna la URL de cada endpoint.
- Define la cadena de middlewares que se ejecutan antes del controlador.

### ¿Qué NO debe hacer?
- ❌ Contener lógica de negocio.
- ❌ Acceder a la base de datos.
- ❌ Validar datos directamente (delega a middlewares).

### Ejemplo (`libro.routes.js`):
```javascript
import { Router } from "express";
import { getLibros, createLibro, updateLibro, deleteLibro } from '../controllers/libro.controllers.js';
import { validarId } from '../middlewares/validaciones/validarId.js';
import { validarLibro } from '../middlewares/validaciones/validadlibro.js';

const router = Router();

router.get('/',          getLibros);                        // Sin validación
router.get('/:id',       validarId, getLibroPorId);         // Valida ID → Controlador
router.post('/',         validarLibro, createLibro);         // Valida body → Controlador
router.put('/:id',       validarId, validarLibro, updateLibro); // Valida ID → body → Controlador
router.delete('/:id',    validarId, deleteLibro);            // Valida ID → Controlador
```

### La cadena de ejecución se lee de izquierda a derecha:
```
router.put('/:id', validarId, validarLibro, updateLibro);
                      │            │             │
                      1°           2°            3°
                   Valida ID   Valida body    Ejecuta lógica
                   (params)    (req.body)     de negocio
```

Si cualquier middleware de la cadena llama a `next(error)`, los siguientes **no se ejecutan** y el error salta directamente a `manejoErrores`.

---

## Capa 3: Middlewares (`middlewares/`)

**Archivos:** `src/middlewares/`  
**Responsabilidad:** Interceptar la petición **antes** o **después** de que llegue al controlador, para ejecutar lógica transversal (que aplica a múltiples rutas).

### Tipos de middlewares en el proyecto:

| Middleware | Tipo | Cuándo se ejecuta | Responsabilidad |
|---|---|---|---|
| `logger.js` | Informativo | Al inicio de toda petición | Registra método, URL, código y duración |
| `validarId.js` | Validación | Antes del controlador en rutas con `/:id` | Verifica que el ID sea un entero positivo |
| `validadlibro.js` | Validación (Zod) | Antes del controlador en POST y PUT | Valida y sanitiza el body con esquemas Zod |
| `rutaNoEncontrada.js` | Error 404 | Después de todas las rutas | Captura peticiones a URLs inexistentes |
| `manejoErrores.js` | Error Handler | Al final absoluto de `app.js` | Centraliza la respuesta HTTP ante cualquier error |

### ¿Qué NO deben hacer?
- ❌ Acceder a la base de datos.
- ❌ Contener lógica de negocio (crear, actualizar, eliminar registros).
- ❌ Definir rutas.

### Regla para distinguir un middleware de un controlador:
- **Middleware:** Filtra, valida o modifica la petición. Llama a `next()` para continuar o `next(error)` para cortar.
- **Controlador:** Ejecuta la acción final (consulta a BD) y envía la respuesta con `res.json()`.

---

## Capa 4: Validadores (`validators/`)

**Archivos:** `src/validators/libro.schemas.js`  
**Responsabilidad:** Definir los **contratos de entrada** (esquemas Zod) que describen qué forma deben tener los datos que envía el cliente.

### ¿Qué hace esta capa?
- Declara las reglas de validación de cada campo (tipo, longitud, formato, obligatoriedad).
- Centraliza los contratos en un solo lugar, separados de Express.

### ¿Qué NO debe hacer?
- ❌ Acceder a `req`, `res` o `next` (es independiente de Express).
- ❌ Hacer consultas a la base de datos.
- ❌ Contener lógica de negocio.

### Ejemplo:
```javascript
import { z } from "zod";

export const crearLibroSchema = z.object({
    titulo: z.string().trim().min(1),
    autor:  z.string().trim().min(1),
    anio:   z.number().int().positive().optional().nullable(),
    categoriaID: z.number().int().positive().optional().nullable()
});
```

> [!TIP]
> **¿Por qué separar los esquemas de los middlewares?**  
> Porque los esquemas son **reglas puras**: describen la forma de los datos sin depender de Express. Se podrían reutilizar en scripts, tests o incluso en otro framework sin cambiar una sola línea.

---

## Capa 5: Controladores (`controllers/`)

**Archivos:** `src/controllers/libro.controllers.js`, `src/controllers/autor.controllers.js`  
**Responsabilidad:** Coordinar la solicitud y la respuesta HTTP. Recibe los datos ya procesados por el middleware y los transfiere al servicio como un **DTO**.

### ¿Qué hace esta capa?
- Recibe los objetos `req`, `res` y `next`.
- Obtiene los datos previamente validados y normalizados desde `req.body` (el **DTO**).
- Invoca la operación correspondiente del servicio pasando el DTO:
  ```javascript
  const crearLibroDto = req.body;
  const nuevoLibro = await crearLibroService(crearLibroDto);
  return res.status(201).json(nuevoLibro);
  ```
- Selecciona el código de estado HTTP (`201` en creación, `200` en actualización/lectura).
- Construye y envía la respuesta JSON.
- Atrapa cualquier error y lo deriva al middleware global con `next(error)`.

### ¿Qué NO debe hacer?
- ❌ No importa Zod ni repite validaciones de formato (eso ya lo hizo el middleware).
- ❌ No importa Prisma Client ni ejecuta consultas de base de datos para operaciones con servicios.
- ❌ No comprueba existencia de categorías ni aplica reglas de negocio (eso lo hace el servicio).

---

## Capa 6: Servicios (`services/`)

**Archivos:** `src/services/libro.services.js`  
**Responsabilidad:** Concentrar la **lógica de negocio**, comprobar reglas del dominio (como existencia de relaciones) y ser la **única capa que ejecuta operaciones con Prisma Client**.

### ¿Qué hace esta capa?
- Recibe un objeto con los datos de la operación (**DTO**); **no recibe `req` ni `res` ni depende de Express**.
- Comprueba reglas de negocio (por ejemplo, verificar que la categoría especificada exista antes de crear el registro).
- Realiza operaciones mediante **Prisma Client** (`prisma.libro.create`, `prisma.libro.update`, etc.).
- Devuelve el resultado si todo está correcto.
- Si se produce un error o se incumple una regla, lo propaga mediante `throw error` para que el controlador lo capture y lo envíe a `next(error)`.

### Ejemplo en `src/services/libro.services.js`:
```javascript
export const crearLibro = async (crearLibroDto) => {
    const { titulo, autor, anio, categoriaId } = crearLibroDto;
    
    // 1. Regla de negocio: comprobar que la categoría exista
    if (categoriaId) {
        const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } });
        if (!categoria) {
            throw crearError("Categoría inexistente.", 400);
        }
    }

    // 2. Persistir con Prisma Client
    return prisma.libro.create({
        data: {
            titulo,
            autor: String(autor),
            anio: anio ? Number(anio) : null,
            categoria: categoriaId ? { connect: { id: categoriaId } } : undefined
        },
        include: { categoria: true }
    });
};
```

---

## Capa 7: Acceso a Datos — Prisma

**Archivos:** `src/config/prisma.js`, `prisma/schema.prisma`  
**Responsabilidad:** Definir los modelos de datos, sus relaciones y gestionar la conexión a PostgreSQL.

### `prisma/schema.prisma` — Los modelos:
```prisma
model Autor {
  id           Int      @id @default(autoincrement())
  nombre       String
  nacionalidad String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @default(now()) @updatedAt
}

model Categoria {
  id     Int    @id @default(autoincrement())
  nombre String @unique
  libros Libro[]
}

model Libro {
  id          Int        @id @default(autoincrement())
  titulo      String
  autor       String
  anio        Int?
  categoriaID Int?
  categoria   Categoria? @relation(fields: [categoriaID], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @default(now()) @updatedAt
}
```

### `src/config/prisma.js` — La conexión:
```javascript
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});
const prisma = new PrismaClient({ adapter });
export default prisma;
```

### ¿Qué NO debe hacer?
- ❌ Contener lógica de negocio.
- ❌ Acceder a `req` o `res`.
- ❌ Ser importada por los middlewares o las rutas (solo los controladores la usan).

---

## Capa Transversal: Utilidades (`utils/`)

**Archivos:** `src/utils/crearError.js`  
**Responsabilidad:** Proveer funciones auxiliares que pueden ser usadas por **cualquier capa**.

Las utilidades no pertenecen a una capa específica; son herramientas compartidas. A diferencia de los middlewares, no interceptan peticiones: son funciones puras que reciben datos y devuelven resultados.

### `crearError.js`:
- **Quién la usa:** Controladores, middlewares de validación y `rutaNoEncontrada`.
- **Qué hace:** Crea un objeto `Error` estandarizado con `status` y `message` validados.

```javascript
export const crearError = (mensaje, status = 500) => {
    const statusCode = (
        typeof status === 'number' && status >= 400 && status < 600
    ) ? status : 500;

    const message = (typeof mensaje === 'string' && mensaje.trim() !== '') 
        ? mensaje 
        : "Ha ocurrido un error interno en el servidor.";

    const error = new Error(message);
    error.status = statusCode;
    return error;
};
```

---

## Flujo Completo de una Petición

### Caso exitoso: `POST /libros` con body válido

```
Cliente envía: POST /libros
Body: { "titulo": "  Don Quijote  ", "autor": "  Cervantes  ", "anio": 1605 }

   ┌─────────────────────────────────────────────────────────────────┐
   │                         app.js                                  │
   │                                                                 │
   │  1. express.json()    → Parsea el body JSON                     │
   │  2. logger            → Inicia cronómetro, registra res.on()    │
   │  3. app.use('/libros', librosRoutes)  → Coincide con /libros    │
   │                                                                 │
   └───────────────────────────┬─────────────────────────────────────┘
                               │
   ┌───────────────────────────▼─────────────────────────────────────┐
   │                    libro.routes.js                               │
   │                                                                  │
   │  router.post('/', validarLibro, createLibro)                     │
   │                       │              │                           │
   └───────────────────────┼──────────────┼───────────────────────────┘
                           │              │
   ┌───────────────────────▼──────┐       │
   │      validadlibro.js         │       │
   │                              │       │
   │  1. Importa crearLibroSchema │       │
   │  2. safeParse(req.body)      │       │
   │  3. ✅ success = true        │       │
   │  4. req.body = datos limpios │       │
   │  5. next()                   │       │
   └──────────────────────────────┘       │
                                          │
   ┌──────────────────────────────────────▼───────────────────────────┐
   │                  libro.controllers.js                            │
   │                                                                  │
   │  createLibro:                                                    │
   │  1. Extrae req.body como DTO: const crearLibroDto = req.body     │
   │  2. Invoca al servicio: await crearLibroService(crearLibroDto)   │
   │  3. Responde HTTP: res.status(201).json(nuevoLibro)              │
   └──────────────────────────────────┬───────────────────────────────┘
                                      │
   ┌──────────────────────────────────▼───────────────────────────────┐
   │                    libro.services.js                             │
   │                                                                  │
   │  crearLibro:                                                     │
   │  1. Recibe crearLibroDto                                         │
   │  2. Comprueba regla de negocio: ¿existe la categoría indicada?   │
   │  3. Persiste en BD: prisma.libro.create(...)                     │
   │  4. Retorna el nuevo libro creado                                │
   └──────────────────────────────────┬───────────────────────────────┘
                                      │
                                      ▼
   logger detecta res.on('finish') → imprime: POST /libros - 201 (8ms)

   Cliente recibe: 201 Created
   { "id": 5, "titulo": "Don Quijote", "autor": "Cervantes", "anio": 1605, ... }
```

### Caso con error 1: `POST /libros` con body inválido (Falla en Middleware)

```
Cliente envía: POST /libros
Body: { "titulo": "   ", "autor": 123 }

   logger → registra
        │
   libro.routes.js → router.post('/', validarLibro, createLibro)
        │
   validadlibro.js:
   1. safeParse({ titulo: "   ", autor: 123 })
   2. ❌ success = false
   3. issue: { path: ["titulo"], message: "Too small..." }
   4. next(crearError("Error en 'titulo': Too small...", 400))
        │
        │  ← createLibro y el Servicio NUNCA se ejecutan
        │
   manejoErrores.js:
   1. Recibe err con status 400
   2. res.status(400).json({ error: "Error en 'titulo': Too small..." })
        │
   logger → POST /libros - 400 (2ms)
```

### Caso con error 2: `POST /libros` con regla de negocio rota (Falla en el Servicio)

```
Cliente envía: POST /libros
Body: { "titulo": "Don Quijote", "autor": "Cervantes", "categoriaId": 9999 }

   logger → registra
        │
   libro.routes.js → router.post('/', validarLibro, createLibro)
        │
   validadlibro.js:
   1. safeParse(...) → ✅ Datos válidos
   2. req.body = datos limpios
   3. next()
        │
   libro.controllers.js:
   1. const crearLibroDto = req.body
   2. try { await crearLibroService(crearLibroDto) }
        │
   libro.services.js:
   1. prisma.categoria.findUnique({ where: { id: 9999 } })
   2. ❌ Categoria no existe
   3. throw crearError("Categoría inexistente.", 400)
        │
        │  ← El throw sube al catch del controlador
        │
   libro.controllers.js:
   1. catch (error) { next(error) }
        │
   manejoErrores.js:
   1. Recibe err con status 400
   2. res.status(400).json({ error: "Categoría inexistente." })
        │
   logger → POST /libros - 400 (5ms)
```

---

## Reglas de Negocio por Entidad

### 📚 Libro

| Regla | Dónde se aplica | Tipo |
|---|---|---|
| `titulo` es obligatorio y no puede estar vacío | `validators/libro.schemas.js` | Validación de entrada |
| `autor` es obligatorio y no puede estar vacío | `validators/libro.schemas.js` | Validación de entrada |
| `titulo` y `autor` se limpian de espacios (trim) | `validators/libro.schemas.js` | Transformación |
| `anio` debe ser un entero positivo (si se envía) | `validators/libro.schemas.js` | Validación de entrada |
| `categoriaID` debe ser un entero positivo (si se envía) | `validators/libro.schemas.js` | Validación de entrada |
| El ID en la URL debe ser un entero positivo | `middlewares/validaciones/validarId.js` | Validación de parámetro |
| No se puede asociar una categoría inexistente | `services/libro.services.js` | Regla de negocio |
| No se puede actualizar un libro que no existe | `services/libro.services.js` | Regla de negocio |
| No se puede eliminar un libro que no existe | `controllers/libro.controllers.js` | Regla de negocio |
| Respuesta 201 al crear exitosamente | `controllers/libro.controllers.js` | Convención REST |
| Respuesta 204 al eliminar exitosamente | `controllers/libro.controllers.js` | Convención REST |

### ✍️ Autor

| Regla | Dónde se aplica | Tipo |
|---|---|---|
| `nombre` es obligatorio | `controllers/autor.controllers.js` | Validación en controlador |
| El ID en la URL debe ser un entero positivo | `middlewares/validaciones/validarId.js` | Validación de parámetro |
| No se puede actualizar un autor que no existe | `controllers/autor.controllers.js` | Regla de negocio |
| No se puede eliminar un autor que no existe | `controllers/autor.controllers.js` | Regla de negocio |
| `nacionalidad` es opcional (se guarda como null si no viene) | `controllers/autor.controllers.js` | Regla de negocio |

### 🏷️ Categoría

| Regla | Dónde se aplica | Tipo |
|---|---|---|
| `nombre` debe ser único en la BD | `prisma/schema.prisma` (`@unique`) | Restricción de BD |
| Una categoría puede tener muchos libros | `prisma/schema.prisma` (relación `Libro[]`) | Relación |

---

## Principio de Separación de Responsabilidades

### ¿Qué significa?
Cada capa tiene **una sola razón para existir**. Si necesitás cambiar cómo se valida un campo, solo tocás los `validators/`. Si necesitás cambiar una consulta o regla de negocio, solo tocás los `services/`. Si necesitás cambiar una respuesta HTTP, tocás `controllers/`. Si necesitás agregar una nueva ruta, solo tocás `routes/`.

### ¿Qué pasa si NO se respeta?

| Violación | Problema |
|---|---|
| Validar datos dentro del controlador | Si tenés 10 rutas que reciben `titulo`, vas a repetir la validación 10 veces |
| Hacer consultas a la BD desde un middleware | El middleware se acopla a Prisma y no se puede reutilizar |
| Definir rutas dentro de `app.js` | `app.js` crece descontroladamente y se vuelve imposible de mantener |
| Poner lógica de negocio en las rutas o controladores | El código se acopla a Express y no puede reutilizarse en scripts o pruebas |

### Regla práctica:

> **Prisma Client se utiliza en `services/` (para operaciones migradas) o `controllers/` (pendientes de migrar). Nunca en middlewares ni rutas.**  
> **Express (`req`, `res`) solo vive en `routes/`, `app.js`, `middlewares/` y `controllers/`. Los `services/` son JavaScript puro.**

---

## Tabla Resumen: Quién Hace Qué

| Capa | Carpeta | Responsabilidad | Importa | NO importa |
|---|---|---|---|---|
| **Punto de Entrada** | `app.js` | Configurar y arrancar Express | `express`, `routes`, `middlewares` | `prisma`, `validators`, `services` |
| **Rutas** | `routes/` | Declarar endpoints y cadena de middlewares | `controllers`, `middlewares` | `prisma`, `validators`, `services` |
| **Middlewares** | `middlewares/` | Filtrar, validar (Zod), monitorear, manejar errores | `utils`, `validators` | `prisma`, `controllers`, `services` |
| **Validadores** | `validators/` | Definir esquemas Zod (contratos de entrada) | `zod` | Todo lo demás |
| **Controladores** | `controllers/` | Gestión HTTP: recibe req, pasa DTO a service, responde | `services`, `utils`, `prisma` (temporal) | `express.Router`, `validators` |
| **Servicios** | `services/` | Lógica de negocio + persistencia con Prisma | `prisma`, `utils` | `express` (req/res), `validators` |
| **Acceso a Datos** | `config/`, `prisma/` | Conexión a BD y definición de modelos | `dotenv`, `@prisma` | Todo lo demás |
| **Utilidades** | `utils/` | Funciones auxiliares reutilizables | Nada (son independientes) | Todo lo demás |

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
 vuelven ilegibles y no se pueden testear |

### Regla práctica:

> **Si estás importando `prisma` fuera de `controllers/` o `config/`, algo está mal.**  
> **Si estás importando `express` fuera de `routes/`, `app.js` o `middlewares/`, algo está mal.**

---

## Tabla Resumen: Quién Hace Qué

| Capa | Carpeta | Responsabilidad | Importa | NO importa |
|---|---|---|---|---|
| **Punto de Entrada** | `app.js` | Configurar y arrancar Express | `express`, `routes`, `middlewares` | `prisma`, `validators` |
| **Rutas** | `routes/` | Declarar endpoints y cadena de middlewares | `controllers`, `middlewares` | `prisma`, `validators` |
| **Middlewares** | `middlewares/` | Filtrar, validar, monitorear, manejar errores | `utils`, `validators` | `prisma`, `controllers` |
| **Validadores** | `validators/` | Definir esquemas Zod (contratos de entrada) | `zod` | Todo lo demás |
| **Controladores** | `controllers/` | Lógica de negocio + operaciones CRUD | `prisma`, `utils` | `express.Router`, `validators` |
| **Acceso a Datos** | `config/`, `prisma/` | Conexión a BD y definición de modelos | `dotenv`, `@prisma` | Todo lo demás |
| **Utilidades** | `utils/` | Funciones auxiliares reutilizables | Nada (son independientes) | Todo lo demás |

---

## Diagrama de Dependencias entre Capas

```mermaid
flowchart TD
    APP["app.js\n(Punto de Entrada)"]
    ROUTES["routes/\n(Enrutamiento)"]
    MW["middlewares/\n(Filtros)"]
    VAL["validators/\n(Esquemas Zod)"]
    CTRL["controllers/\n(Lógica de Negocio)"]
    PRISMA["config/prisma.js\n(Acceso a Datos)"]
    UTILS["utils/\n(Herramientas)"]
    BD[("PostgreSQL\n(Base de Datos)")]

    APP --> ROUTES
    APP --> MW
    ROUTES --> MW
    ROUTES --> CTRL
    MW --> VAL
    MW --> UTILS
    CTRL --> PRISMA
    CTRL --> UTILS
    PRISMA --> BD

    style APP fill:#38bdf8,stroke:#0284c7,color:#000
    style ROUTES fill:#a78bfa,stroke:#7c3aed,color:#000
    style MW fill:#fde047,stroke:#eab308,color:#000
    style VAL fill:#34d399,stroke:#059669,color:#000
    style CTRL fill:#fb923c,stroke:#ea580c,color:#000
    style PRISMA fill:#f87171,stroke:#dc2626,color:#fff
    style UTILS fill:#94a3b8,stroke:#64748b,color:#000
    style BD fill:#e2e8f0,stroke:#94a3b8,color:#000
```

> [!NOTE]
> Las flechas indican dirección de importación: `A → B` significa que A importa de B. Notar que las dependencias siempre van "hacia abajo" (hacia la base de datos), nunca al revés. Esto se llama **dependencia unidireccional** y es la base de una arquitectura mantenible.
