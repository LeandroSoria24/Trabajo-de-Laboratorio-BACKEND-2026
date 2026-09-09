# 🔍 Guía de Métodos de Consulta y Operaciones CRUD en Prisma ORM
### Cátedra: Desarrollo Backend — Facultad de Tecnología y Ciencias Aplicadas (UNCa)

Esta guía recopila todas las formas de pedir, filtrar, ordenar, paginar y modificar datos en PostgreSQL utilizando **Prisma Client**, con ejemplos prácticos aplicados a los modelos de nuestro proyecto (`Autor` y `Libro`).

---

## 📑 Índice
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
7. [Tabla Resumen Rápida](#7-tabla-resumen-rápida)

---

## 1. Concepto Central: Modelos y Delegados

Cuando defines modelos en `prisma/schema.prisma`:

```prisma
model Autor {
  id           Int      @id @default(autoincrement())
  nombre       String
  nacionalidad String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Libro {
  id        Int      @id @default(autoincrement())
  titulo    String
  autor     String
  anio      Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Prisma Client genera automáticamente una propiedad (delegado) en minúscula camelCase dentro de la instancia `prisma`:

* `model Autor` $\rightarrow$ `prisma.autor.<metodo>()`
* `model Libro` $\rightarrow$ `prisma.libro.<metodo>()`

Todas las operaciones hacia la base de datos son **asíncronas** y devuelven una `Promise`, por lo que siempre deben utilizarse con `await` dentro de funciones `async`.

---

## 2. Métodos de Lectura (Consultas)

### A. `findMany` — Obtener múltiples registros
Equivale a una consulta `SELECT * FROM ...`. Devuelve siempre un **arreglo** (`[]`). Si no hay registros coincidentes, devuelve un arreglo vacío `[]` (nunca `null`).

#### 1. Traer todos los registros:
```javascript
const todosLosAutores = await prisma.autor.findMany();
```

#### 2. Traer registros con filtro básico:
```javascript
const autoresArgentinos = await prisma.autor.findMany({
  where: {
    nacionalidad: 'Argentina'
  }
});
```

---

### B. `findUnique` — Obtener un registro por campo único o ID
Busca un único registro utilizando un campo que tenga la restricción `@id` (clave primaria) o `@unique`.

* Si lo encuentra: devuelve el **objeto**.
* Si no existe: devuelve **`null`**.

```javascript
const autor = await prisma.autor.findUnique({
  where: {
    id: 1
  }
});
```

> [!IMPORTANT]
> `findUnique` **solo permite** buscar por campos marcados como identificadores o únicos en el `schema.prisma`. Si intentas buscar por un campo ordinario (ej. `nacionalidad`), Prisma lanzará un error de validación.

---

### C. `findFirst` — Obtener el primer registro que cumpla una condición
A diferencia de `findUnique`, `findFirst` permite buscar por **cualquier campo**, sin importar si es único o no. Retorna el primer registro que coincida con el criterio, o `null` si no encuentra ninguno.

```javascript
// Buscar el primer autor cuyo nombre sea "Jorge Luis Borges"
const autor = await prisma.autor.findFirst({
  where: {
    nombre: 'Jorge Luis Borges'
  }
});
```

---

### D. `count` — Contar registros
Devuelve un número entero indicando cuántas filas coinciden con el criterio (equivalente a `SELECT COUNT(*)`).

```javascript
// Contar todos los autores
const total = await prisma.autor.count();

// Contar con condiciones
const totalArgentinos = await prisma.autor.count({
  where: { nacionalidad: 'Argentina' }
});
```

---

## 3. Modificadores y Opciones de Consulta

Prisma permite combinar opciones dentro del argumento del método de búsqueda (`findMany`, `findFirst`, etc.):

### `where` y Operadores de Filtro
Permite aplicar condiciones lógicas complejas similares a la cláusula `WHERE` de SQL:

```javascript
const libros = await prisma.libro.findMany({
  where: {
    // 1. Comparaciones numéricas
    anio: {
      gte: 2000, // Mayor o igual (>=)
      lte: 2024  // Menor o igual (<=)
      // gt: 2000  (Mayor estricto >)
      // lt: 2024  (Menor estricto <)
      // not: 2010 (Diferente !=)
    },

    // 2. Búsquedas en texto
    titulo: {
      contains: 'Quijote',      // Contiene el texto (LIKE %Quijote%)
      mode: 'insensitive'      // Ignora mayúsculas y minúsculas
      // startsWith: 'Don'     (Comienza con)
      // endsWith: 'Mancha'    (Termina con)
    },

    // 3. Pertenencia a una lista (IN)
    autor: {
      in: ['Cervantes', 'Borges', 'Cortázar']
    }
  }
});
```

#### Operadores lógicos (`AND`, `OR`, `NOT`):
```javascript
const autores = await prisma.autor.findMany({
  where: {
    OR: [
      { nacionalidad: 'Argentina' },
      { nacionalidad: 'Uruguaya' }
    ]
  }
});
```

---

### `select`: Proyección de columnas
Permite especificar explícitamente cuáles campos devolver (equivalente a `SELECT id, nombre FROM ...`).

```javascript
const autores = await prisma.autor.findMany({
  select: {
    id: true,
    nombre: true
    // nacionalidad, createdAt y updatedAt NO se devuelven
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
const autoresPorNombre = await prisma.autor.findMany({
  orderBy: {
    nombre: 'asc' // o 'desc' para descendente
  }
});

// Orden múltiple
const librosOrdenados = await prisma.libro.findMany({
  orderBy: [
    { anio: 'desc' },
    { titulo: 'asc' }
  ]
});
```

---

### `take` y `skip`: Paginación y Límites
Permite limitar la cantidad de resultados devueltos (`LIMIT`) y saltar un número determinado de filas (`OFFSET`):

```javascript
const limite = 5;
const pagina = 2;

const librosPaginados = await prisma.libro.findMany({
  skip: (pagina - 1) * limite, // Salta los primeros 5
  take: limite                  // Toma los siguientes 5
});
```

---

## 4. Métodos de Escritura (Mutaciones CRUD)

### A. `create` — Insertar un nuevo registro
Inserta una nueva fila en la base de datos y devuelve el registro recién creado (incluyendo `id` autogenerado y marcas de tiempo).

```javascript
const nuevoAutor = await prisma.autor.create({
  data: {
    nombre: 'Gabriel García Márquez',
    nacionalidad: 'Colombiana'
  }
});
```

---

### B. `update` — Modificar un registro existente
Modifica un registro localizado mediante un campo único en `where`. Devuelve el objeto actualizado.

```javascript
const autorActualizado = await prisma.autor.update({
  where: {
    id: 1
  },
  data: {
    nacionalidad: 'Argentina'
  }
});
```

> [!WARNING]
> Si el registro con ese `id` no existe en la base de datos, `update` **lanza un error** (código `P2025` de Prisma). Por eso es común verificar primero su existencia o dejar que el bloque `try/catch` lo procese.

---

### C. `delete` — Eliminar un registro
Elimina un registro localizado por campo único en `where`. Devuelve el objeto que acaba de ser eliminado.

```javascript
const autorEliminado = await prisma.autor.delete({
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
const autor = await prisma.autor.upsert({
  where: { id: 1 },
  update: {
    nombre: 'Nombre Modificado'
  },
  create: {
    nombre: 'Nombre Nuevo',
    nacionalidad: 'Chilena'
  }
});
```

---

### E. Operaciones en Lote
Para manipular múltiples registros a la vez:

* **`createMany`**: Inserta varios registros a partir de una lista.
  ```javascript
  await prisma.autor.createMany({
    data: [
      { nombre: 'Julio Cortázar', nacionalidad: 'Argentina' },
      { nombre: 'Mario Vargas Llosa', nacionalidad: 'Peruana' }
    ]
  });
  ```
* **`updateMany`**: Actualiza todos los registros que cumplan una condición.
* **`deleteMany`**: Elimina todos los registros que cumplan una condición (o todos si se deja vacío `where: {}`).

---

## 5. Mapeo Práctico: De Memoria a Prisma en los Controladores

Así es como se transforman los métodos del controlador `src/controllers/autores.controllers.js`:

| Acción HTTP | Ruta | En Memoria (JavaScript) | Con Prisma ORM |
| :--- | :--- | :--- | :--- |
| **GET** | `/autores` | `autores` | `await prisma.autor.findMany()` |
| **GET** | `/autores/:id` | `autores.find(a => a.id === id)` | `await prisma.autor.findUnique({ where: { id } })` |
| **POST** | `/autores` | `autores.push(nuevoAutor)` | `await prisma.autor.create({ data: { nombre, nacionalidad } })` |
| **PUT** | `/autores/:id` | `autor.nombre = ...` | `await prisma.autor.update({ where: { id }, data: { ... } })` |
| **DELETE** | `/autores/:id` | `autores.splice(indice, 1)` | `await prisma.autor.delete({ where: { id } })` |

---

## 6. Manejo de Respuestas, Valores Nulos y Errores

Al usar Prisma en controladores Express:

1. **Campos numéricos en URL (`req.params`):**
   `req.params.id` siempre es un `string`. PostgreSQL espera un número entero para campos de tipo `Int`:
   ```javascript
   const id = Number(req.params.id);
   ```

2. **Diferencia entre `findUnique` y `update`/`delete` ante registros inexistentes:**
   * `findUnique`: Si el registro no existe, retorna **`null`**. Puedes hacer `if (!autor) return next(crearError('...', 404));`.
   * `update` / `delete`: Si el registro no existe, lanza un **error de Prisma** (`Record to update not found`). Puedes verificar primero con `findUnique` o capturar el código `error.code === 'P2025'` en el `catch`.

3. **Estructura recomendada en controlador:**
   ```javascript
   export const getAutorPorId = async (req, res, next) => {
       try {
           const id = Number(req.params.id);
           const autor = await prisma.autor.findUnique({ where: { id } });

           if (!autor) {
               return next(crearError(`No existe un autor con id ${id}`, 404));
           }

           res.json(autor);
       } catch (error) {
           next(error);
       }
   };
   ```

---

## 7. Tabla Resumen Rápida

| Método Prisma | ¿Qué hace? | ¿Qué devuelve si no encuentra nada? | Requiere en `where` |
|---|---|:---:|---|
| `findMany()` | Obtiene una lista de registros | Arreglo vacío `[]` | Cualquier campo / opcional |
| `findUnique()` | Obtiene un único registro | `null` | Solo campos `@id` o `@unique` |
| `findFirst()` | Obtiene el primer registro coincidente | `null` | Cualquier campo |
| `count()` | Cuenta la cantidad de filas coincidentes | `0` | Cualquier campo / opcional |
| `create()` | Inserta un nuevo registro | Lanza excepción si falla | No usa `where` (usa `data`) |
| `update()` | Modifica un registro existente | Lanza excepción si no existe | Solo campos `@id` o `@unique` |
| `delete()` | Elimina un registro existente | Lanza excepción si no existe | Solo campos `@id` o `@unique` |
| `upsert()` | Crea o actualiza según existencia | Siempre crea o actualiza | Solo campos `@id` o `@unique` |
