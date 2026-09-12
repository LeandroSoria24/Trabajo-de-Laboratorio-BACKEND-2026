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

* **Ejemplo académico (UNCa):** Un `Evento` posee exactamente una `ConfiguracionEvento` (y esa configuración pertenece exclusivamente a ese evento).
* **Regla clave:** La clave foránea **debe tener la restricción `@unique`** para evitar que más de un registro apunte al mismo padre.

```prisma
model Evento {
  id            Int                  @id @default(autoincrement())
  nombre        String
  configuracion ConfiguracionEvento? // Relación virtual inversa (opcional)
}

model ConfiguracionEvento {
  id                 Int     @id @default(autoincrement())
  limiteInscripcion  Int
  permiteCancelacion Boolean @default(true)
  
  // Clave foránea real en BD con @unique:
  eventoId           Int     @unique
  evento             Evento  @relation(fields: [eventoId], references: [id], onDelete: Cascade)
}
```

---

### B. Relación 1 a N (Uno a Muchos)

Un registro del modelo **A** puede tener asociados múltiples registros del modelo **B**, pero cada registro de **B** pertenece a un único registro de **A**.

* **Ejemplos:**
  - Una `Categoria` tiene muchos `Evento`s (`libros Libro[]`).
  - Cada `Evento` pertenece a una única `Categoria`.

```prisma
model Categoria {
  id      Int      @id @default(autoincrement())
  nombre  String   @unique
  eventos Evento[] // Campo virtual: lista de eventos vinculados
}

model Evento {
  id          Int       @id @default(autoincrement())
  nombre      String
  
  // Clave foránea física:
  categoriaId Int
  categoria   Categoria @relation(fields: [categoriaId], references: [id], onDelete: Restrict, onUpdate: Cascade)
}
```

> [!TIP]
> En la relación 1 a N, el lado "Muchos" (`Evento`) contiene el campo escalar `categoriaId` y el `@relation`. El lado "Uno" (`Categoria`) únicamente declara la lista `Evento[]`.

---

### C. Relación N a M (Muchos a Muchos: Implícita y Explícita)

Un registro de **A** puede relacionarse con muchos de **B**, y un registro de **B** puede relacionarse con muchos de **A**. Existen dos formas de implementarlas:

#### 1. Relación N:M Implícita (Manejada automáticamente por Prisma)
Se utiliza cuando **no necesitas guardar datos extra** en la tabla intermedia (como fecha de unión, rol o estado).

* **Ejemplo (UNCa):** Un `Evento` puede estar respaldado por varias `Institucion`es, y una `Institucion` respalda varios `Evento`s.

```prisma
model Evento {
  id            Int           @id @default(autoincrement())
  nombre        String
  instituciones Institucion[] // Solo listas en ambos modelos
}

model Institucion {
  id      Int      @id @default(autoincrement())
  nombre  String
  eventos Evento[]
}
```

> [!NOTE]
> Prisma creará automáticamente en PostgreSQL una tabla de unión oculta llamada `_EventoToInstitucion` con dos columnas (`A` y `B`) como claves foráneas compuestas, gestionando las inserciones y borrados sin código SQL adicional.

#### 2. Relación N:M Explícita (Con modelo intermedio)
Se utiliza cuando la tabla intermedia **contiene atributos propios**.

* **Ejemplo (UNCa):** Un `Participante` se inscribe en varios `Evento`s, pero la `Inscripcion` debe guardar `fechaInscripcion`, `asistio` o `estado`.

```prisma
model Evento {
  id            Int           @id @default(autoincrement())
  nombre        String
  inscripciones Inscripcion[]
}

model Participante {
  id            Int           @id @default(autoincrement())
  nombre        String
  email         String        @unique
  inscripciones Inscripcion[]
}

// Modelo intermedio explícito
model Inscripcion {
  id               Int          @id @default(autoincrement())
  fechaInscripcion DateTime     @default(now())
  asistio          Boolean      @default(false)

  eventoId         Int
  evento           Evento       @relation(fields: [eventoId], references: [id])

  participanteId   Int
  participante     Participante @relation(fields: [participanteId], references: [id])

  @@unique([eventoId, participanteId]) // Evita inscripciones duplicadas
}
```

---

### D. Consultas con Datos Relacionados (`include` y `select`)

Por defecto, Prisma no trae las entidades relacionadas para mantener las consultas ultra rápidas. Para incluirlas (equivalente a un `JOIN`), se utiliza `include`:

#### 1. Obtener registro individual con su objeto relacionado:
```javascript
// GET /eventos/:id con su Categoría
const evento = await prisma.evento.findUnique({
  where: { id: 1 },
  include: {
    categoria: true // Incluye el objeto { id, nombre } de la categoría
  }
});
```

Resultado retornado:
```json
{
  "id": 1,
  "nombre": "Congreso de Tecnología",
  "categoriaId": 1,
  "categoria": {
    "id": 1,
    "nombre": "Jornada"
  }
}
```

#### 2. Inclusiones múltiples y anidadas en profundidad:
```javascript
const eventosDetallados = await prisma.evento.findMany({
  include: {
    categoria: true,
    configuracion: true,
    inscripciones: {
      include: {
        participante: true // Join anidado: Evento -> Inscripcion -> Participante
      }
    }
  }
});
```

#### 3. Proyección precisa con `select`:
```javascript
const eventosCompactos = await prisma.evento.findMany({
  select: {
    id: true,
    nombre: true,
    categoria: {
      select: {
        nombre: true // Trae solo el nombre de la categoría sin su ID
      }
    }
  }
});
```

#### 4. Filtrar por propiedades del modelo relacionado:
```javascript
// Buscar todos los eventos que pertenecen a la categoría "Jornada"
const jornadas = await prisma.evento.findMany({
  where: {
    categoria: {
      nombre: 'Jornada'
    }
  }
});

// En listas 1:N o N:M: filtrar con 'some', 'every' o 'none'
const categoriasConEventos = await prisma.categoria.findMany({
  where: {
    eventos: {
      some: {
        nombre: { contains: 'Node.js' }
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
// Crear un evento y asociarlo a una categoría existente con ID 2
const nuevoEvento = await prisma.evento.create({
  data: {
    nombre: 'Workshop de Node.js',
    categoria: {
      connect: { id: 2 } // O cualquier campo @unique como: connect: { nombre: 'Taller' }
    }
  }
});
```

#### 2. `create`: Crear padre e hijo en una sola transacción
```javascript
// Crear un evento y a su vez una nueva categoría al vuelo
const nuevoEvento = await prisma.evento.create({
  data: {
    nombre: 'Seminario de Cloud Computing',
    categoria: {
      create: {
        nombre: 'Seminarios'
      }
    }
  }
});
```

---

## 8. Migración de Datos: B.D. con Registros Existentes (Estrategia `--create-only`)

> **Contexto de Cátedra (UNCa - Desarrollo Backend):**
> En entornos reales y proyectos en evolución, los modelos cambian constantemente. Un desafío habitual es **incorporar una relación obligatoria (`NOT NULL`) a una tabla que ya contiene datos almacenados**.

### El Problema: Restricción NOT NULL sobre Datos Existentes

Imaginemos la situación inicial antes de migrar:
* La base de datos PostgreSQL ya contiene la tabla `Evento` con registros existentes:
  
  | id | nombre |
  | :--- | :--- |
  | 1 | Congreso de Tecnología |
  | 2 | Workshop de Node.js |

* Modificamos `schema.prisma` incorporando el modelo `Categoria` y la relación obligatoria:
  ```prisma
  model Evento {
    id          Int       @id @default(autoincrement())
    nombre      String
    categoriaId Int       // Obligatoria (NO es Int?)
    categoria   Categoria @relation(fields: [categoriaId], references: [id])
  }
  ```

* Al ejecutar la migración directa:
  ```bash
  npx prisma migrate dev --name incorporar-relaciones
  ```
  ❌ **Prisma bloquea la migración con un error crítico:**
  Intenta agregar la columna `categoriaId` con la restricción `NOT NULL` a una tabla que ya posee filas. Al no tener un valor por defecto (`@default`), PostgreSQL no sabe qué valor asignar a los registros 1 y 2, violando la integridad de datos.

---

### Paso 1: Generar la migración sin aplicarla (sin modificar la B.D.)

Usamos la bandera `--create-only`:

```bash
npx prisma migrate dev --name incorporar-relaciones --create-only
```

* **¿Qué hace `--create-only`?** Crea la carpeta y el archivo SQL en `prisma/migrations/<timestamp>_incorporar_relaciones/migration.sql`, pero **no ejecuta las instrucciones en la base de datos**.
* Esto nos da control total para editar manualmente el script SQL antes de que toque PostgreSQL.

---

### Paso 2: Adaptar el bloque SQL en `migration.sql` (6 Pasos Críticos)

Abrimos el archivo `migration.sql` generado y reemplazamos el bloque de creación de `Categoria` y alteración de `Evento` por la siguiente secuencia lógica de 6 pasos:

```sql
-- 1. Crear la tabla Categoria
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- 2. Agregar temporalmente la columna en Evento PERMITIENDO valores NULL
ALTER TABLE "Evento" ADD COLUMN "categoriaId" INTEGER;

-- 3. Crear una categoría inicial para los registros existentes (semilla / valor base)
INSERT INTO "Categoria" ("nombre") VALUES ('Jornada');

-- 4. Asignar el ID de esa categoría a todos los eventos huérfanos existentes
UPDATE "Evento" 
SET "categoriaId" = (
    SELECT "id" 
    FROM "Categoria" 
    WHERE "nombre" = 'Jornada'
) 
WHERE "categoriaId" IS NULL;

-- 5. Ahora que ninguna fila tiene NULL, convertir la columna en obligatoria (NOT NULL)
ALTER TABLE "Evento" ALTER COLUMN "categoriaId" SET NOT NULL;

-- 6. Crear la clave foránea con integridad referencial
ALTER TABLE "Evento" 
ADD CONSTRAINT "Evento_categoriaId_fkey" 
FOREIGN KEY ("categoriaId") 
REFERENCES "Categoria"("id") 
ON DELETE RESTRICT 
ON UPDATE CASCADE;
```

> [!IMPORTANT]
> El orden de estas 6 instrucciones es inalterable: primero se crea la tabla destino, luego se agrega la columna permisiva, se inserta la categoría semilla, se pueblan los eventos huérfanos, se vuelve obligatoria la columna y finalmente se enlaza la clave foránea.

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
   * ✔ Existe la tabla `Categoria` en PostgreSQL.
   * ✔ Se creó el registro semilla `"Jornada"`.
   * ✔ Todos los eventos previos (`Congreso de Tecnología`, `Workshop de Node.js`) ahora poseen `categoriaId = 1`.
   * ✔ Las nuevas tablas secundarias (`ConfiguracionEvento`, `Institucion`, `Participante`, `Inscripcion`, `_EventoToInstitucion`) se crearon satisfactoriamente.
   * ✔ No se perdió ningún dato histórico de la tabla `Evento`.

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
| **Velocidad de iteración** | ⚡ Ultrarrápido: ideal para iterar modelos y probar relaciones. | ⏱️ Más formal: requiere nombrar cada migración (`--name`). |
| **Bases de datos en la nube (ej. Supabase)** | Excelente para prototipado rápido y entornos de desarrollo personal. | Recomendado para sincronizar cambios estructurados entre miembros de equipo. |
| **Scripts SQL manuales** | ❌ No permite insertar SQL personalizado en el proceso de migración. | ✔ Permite editar el `migration.sql` (ej. con `--create-only`) para poblar datos. |
| **Entornos de Producción** | ❌ No recomendado (no hay trazabilidad ni control estricto). | ✔ Se despliega con `npx prisma migrate deploy`. |

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

// ✅ 100% SEGURO: Prisma NO concatena strings
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
// ⚠️ RIESGOSO si se concatena manualmente:
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
| `npx prisma db push` | Sincroniza directamente el esquema con la base de datos | ✔ Sí (advierte si hay cambios destructivos) | ❌ No |
| `npx prisma migrate dev --name <nombre>` | Crea y aplica una nueva migración versionada con historial SQL | ✔ Sí | ✔ Sí (`prisma/migrations/`) |
| `npx prisma migrate dev --create-only` | Genera el archivo SQL para edición manual sin aplicarlo a la B.D. | ✔ Sí (no toca la B.D.) | ✔ Sí |
| `npx prisma migrate deploy` | Aplica migraciones pendientes en entornos de staging / producción | ✔ Sí | ❌ No (solo lee las existentes) |
| `npx prisma migrate reset` | Destruye la base de datos y reaplica todas las migraciones desde cero | ❌ **No (Borra todo)** | ❌ No |
| `npx prisma generate` | Regenera Prisma Client a partir del archivo `schema.prisma` | N/A (no toca la B.D.) | ❌ No |
| `npx prisma studio` | Abre panel visual interactivo en el navegador (`localhost:5555`) | N/A (interfaz gráfica) | ❌ No |

