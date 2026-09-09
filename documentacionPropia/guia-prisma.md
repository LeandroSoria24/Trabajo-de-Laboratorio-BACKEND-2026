# 🐘 Guía Completa de Prisma ORM (v7) + PostgreSQL
### Cátedra: Desarrollo Backend — Facultad de Tecnología y Ciencias Aplicadas (UNCa)

Guía técnica, conceptual y paso a paso que recopila todos los comandos, archivos de configuración, definiciones del lenguaje y buenas prácticas utilizadas en el proyecto para integrar **Prisma ORM 7** con **PostgreSQL**.

---

## 📑 Contenido
1. [Flujo General: Del Código a la Base de Datos](#1-flujo-general-del-código-a-la-base-de-datos)
2. [Instalación de Dependencias](#2-instalación-de-dependencias)
3. [Inicialización del Entorno Prisma](#3-inicialización-del-entorno-prisma)
4. [Configuración de Variables de Entorno (`.env`)](#4-configuración-de-variables-de-entorno-env)
5. [Configuración de Prisma 7 (`prisma7.config.ts`)](#5-configuración-de-prisma-7-prisma7configts)
6. [El Esquema Declarativo (`schema.prisma`)](#6-el-esquema-declarativo-schemaprisma)
   - [¿Qué es Prisma Schema Language (PSL)?](#qué-es-prisma-schema-language-psl)
   - [Bloques `generator` y `datasource`](#bloques-generator-y-datasource)
   - [Tipos de Datos y Atributos](#tipos-de-datos-y-atributos)
   - [Modelo de Ejemplo de Cátedra (`Evento`)](#modelo-de-ejemplo-de-cátedra-evento)
   - [Modelos del Proyecto Biblioteca (`Autor` y `Libro`)](#modelos-del-proyecto-biblioteca-autor-y-libro)
7. [Migraciones con Prisma Migrate (`migrate dev`)](#7-migraciones-con-prisma-migrate-migrate-dev)
8. [Generación de Prisma Client (`generate`)](#8-generación-de-prisma-client-generate)
9. [Centralización del Cliente (`src/config/prisma.js`)](#9-centralización-del-cliente-srcconfigprismajs)
10. [Exploración de Datos con Prisma Studio](#10-exploración-de-datos-con-prisma-studio)
11. [Tabla Resumen de Comandos](#11-tabla-resumen-de-comandos)

---

## 1. Flujo General: Del Código a la Base de Datos

```mermaid
flowchart TD
    subgraph Configuración ["1. Declaración y Configuración"]
        ENV[".env (DATABASE_URL)"] --> CONFIG["prisma7.config.ts (env helper)"]
        SCHEMA["prisma/schema.prisma (PSL declarativo)"] --> CONFIG
    end

    subgraph BaseDeDatos ["2. Persistencia en PostgreSQL"]
        MIGRATE["npx prisma migrate dev --name init"]
        MIGRATE -->|"1. Compara cambios\n2. Genera SQL versionado\n3. Crea tablas"| DB[("gestion_eventos_db (localhost:5432)")]
    end

    subgraph CodigoCliente ["3. Código y Aplicación"]
        GENERATE["npx prisma generate"]
        SCHEMA --> GENERATE
        GENERATE -->|"Genera código adaptado"| CLIENT_FOLDER["src/generated/prisma/"]
        CLIENT_FOLDER --> SINGLETON["src/config/prisma.js (Instancia única)"]
        SINGLETON --> CONTROLLERS["Controladores Express (src/controllers)"]
    end

    subgraph Exploracion ["4. Inspección"]
        STUDIO["npx prisma studio (localhost:5555)"] <--> DB
    end

    CONFIG --> MIGRATE

    style ENV fill:#fde047,stroke:#eab308,color:#000
    style CONFIG fill:#38bdf8,stroke:#0284c7,color:#000
    style SCHEMA fill:#a855f7,stroke:#7e22ce,color:#fff
    style DB fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style CLIENT_FOLDER fill:#4ade80,stroke:#16a34a,color:#000
    style SINGLETON fill:#f97316,stroke:#ea580c,color:#fff
    style STUDIO fill:#ec4899,stroke:#be185d,color:#fff
```

---

## 2. Instalación de Dependencias

Para configurar **Prisma 7** con **PostgreSQL** y Node.js se instalaron los siguientes paquetes:

```bash
# Dependencias de producción (Cliente, adaptador de PostgreSQL, driver pg y dotenv)
npm install @prisma/client @prisma/adapter-pg pg dotenv

# Dependencia de desarrollo (CLI de Prisma alineado a la misma versión del cliente)
npm install --save-dev prisma@^7.0.0 @prisma/client@^7.0.0
```

### Rol de cada paquete:
* **`prisma`**: Interfaz de línea de comandos (CLI) de Prisma para ejecutar migraciones, validaciones y utilidades.
* **`@prisma/client`**: Motor cliente generado que permite interactuar con la base de datos desde JavaScript.
* **`@prisma/adapter-pg`**: Adaptador oficial de Prisma 7 para comunicar las consultas directamente con el driver de PostgreSQL.
* **`pg`**: Driver nativo oficial de PostgreSQL para Node.js.
* **`dotenv`**: Librería para cargar variables de entorno desde el archivo `.env`.

---

## 3. Inicialización del Entorno Prisma

El comando utilizado inicialmente para generar la estructura básica de Prisma fue:

```bash
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma
```

### ¿Qué hace este comando?
1. Crea la carpeta `prisma/` con el archivo inicial `schema.prisma`.
2. Genera el archivo de configuración `prisma7.config.ts` (o `prisma.config.ts`).
3. Crea un archivo `.env` con la plantilla de conexión.
4. Configura el proveedor como `postgresql` y fija la salida del cliente generado en `../src/generated/prisma`.

---

## 4. Configuración de Variables de Entorno (`.env`)

Ubicado en la raíz del proyecto. Contiene los datos confidenciales de acceso a la base de datos.

### Estructura de la cadena de conexión:
```text
postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/BASE_DE_DATOS?schema=ESQUEMA
```

### Implementación en el proyecto:
```env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/gestion_eventos_db?schema=public"
```

* **`postgres`**: Usuario administrador por defecto.
* **`1234`**: Contraseña del usuario PostgreSQL.
* **`localhost`**: Servidor local.
* **`5432`**: Puerto estándar de PostgreSQL.
* **`gestion_eventos_db`**: Nombre de la base de datos que Prisma utilizará (o creará automáticamente si no existe).
* **`schema=public`**: Esquema predeterminado de tablas en PostgreSQL.

> [!WARNING]
> El archivo `.env` **nunca debe subirse al repositorio Git**. Debe estar listado en `.gitignore`.

---

## 5. Configuración de Prisma 7 (`prisma7.config.ts`)

Prisma 7 introduce este archivo para configurar la fuente de datos mediante código TypeScript/JavaScript:

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

### ¿Por qué se utiliza el helper `env()` en lugar de `process.env`?
El archivo generado originalmente suele utilizar `process.env`. Sin embargo, VS Code puede mostrar advertencias de tipo en proyectos JavaScript que no cuentan con definiciones globales de Node.js instaladas. Para evitar advertencias y garantizar tipado seguro, se utiliza el helper **`env()`** provisto por `prisma/config`.

---

## 6. El Esquema Declarativo (`schema.prisma`)

### ¿Qué es Prisma Schema Language (PSL)?
El archivo `schema.prisma` contiene la descripción formal del modelo de datos. Se escribe utilizando **Prisma Schema Language (PSL)**, un lenguaje declarativo diseñado específicamente para describir estructuras de datos.

> **¿Qué significa que sea declarativo?**  
> La aplicación especifica **qué estructura necesita**, sin detallar paso a paso las instrucciones SQL necesarias para crearla.

### Bloques `generator` y `datasource`
```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

* **`generator client`**: Configura la generación de Prisma Client.
  * `provider = "prisma-client"`: Selecciona el generador oficial de Prisma Client.
  * `output`: Indica la carpeta destino del cliente generado (no se crea aquí, sino luego al ejecutar `npx prisma generate`).
* **`datasource db`**: Identifica el sistema de base de datos.
  * `db`: Nombre interno asignado al origen de datos.
  * `provider = "postgresql"`: Indica que Prisma utilizará el conector de PostgreSQL.

---

### Tipos de Datos y Atributos

#### Tipos de Datos
Indican qué clase de información puede almacenarse en cada campo:
* **`Int`**: Almacena números enteros sin parte decimal.
* **`String`**: Cadenas de texto (nombres, títulos, descripciones).
* **`DateTime`**: Almacena conjuntamente fecha y hora.

#### Atributos (comienzan con `@`)
Establecen restricciones, valores predeterminados o comportamientos especiales:
* **`@id`**: Establece que el campo identifica de manera única cada registro (clave primaria en PostgreSQL).
* **`@default(...)`**: Define el valor por defecto que se asignará si no se envía uno:
  * `autoincrement()`: Genera automáticamente un número entero superior al último (`SERIAL`).
  * `now()`: Asigna la fecha y hora exactas del momento de creación.
* **`@updatedAt`**: Actualiza automáticamente el campo cada vez que el registro se modifica a través de Prisma.
* **Modificador opcional (`?`)**: Un campo sin `?` es obligatorio (`NOT NULL`). Un campo con `?` permite valores nulos (`NULL`).

---

### Modelo de Ejemplo de Cátedra (`Evento`)
```prisma
model Evento {
  id          Int      @id @default(autoincrement())
  nombre      String
  descripcion String?
  lugar       String
  fecha       DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Convenciones utilizadas:**
* El modelo se escribe en singular y con formato **PascalCase**: `Evento`.
* Los campos se escriben con **camelCase**: `createdAt`.
* Los campos sin `?` son obligatorios (`nombre`, `lugar`, `fecha`).

---

### Modelos del Proyecto Biblioteca (`Autor` y `Libro`)
Aplicando exactamente las mismas reglas y tipos de datos a los recursos de nuestra API:

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

---

## 7. Migraciones con Prisma Migrate (`migrate dev`)

> [!IMPORTANT]
> **Definir el modelo en `schema.prisma` todavía no crea ninguna tabla en PostgreSQL.**  
> Solamente declaramos la estructura que la aplicación necesita. Para plasmarla en la base de datos se requiere una **migración**.

### ¿Qué es una migración?
Una migración es un **conjunto versionado de instrucciones SQL** que modifica la estructura de una base de datos para llevarla desde un estado conocido hacia un nuevo estado.

### ¿Por qué se versionan las migraciones?
* Conservan el historial de evolución del modelo a lo largo del tiempo.
* Permiten reproducir la misma estructura en otros equipos y entornos de despliegue.
* Facilitan que todo el equipo de trabajo trabaje con una base consistente.
* Vinculan los cambios del código con los cambios reales de la base de datos.

### El comando de migración:
```bash
npx prisma migrate dev --name init
```

#### Desglose del comando:
* **`npx`**: Ejecuta una herramienta instalada localmente en el proyecto sin requerir instalación global.
* **`prisma`**: Invoca la CLI de Prisma ORM.
* **`migrate`**: Selecciona el conjunto de comandos encargado de administrar migraciones.
* **`dev`**: Crea y aplica migraciones sobre una base de datos en entorno de desarrollo.
* **`--name init`**: Asigna el nombre descriptivo `"init"` a la migración inicial (crea la carpeta `prisma/migrations/XXXXXXXXXXXXXX_init/migration.sql`).

#### ¿Qué realiza Prisma Migrate en este paso?
1. Compara el estado esperado (`schema.prisma`) con el estado actual de PostgreSQL.
2. Si la base de datos no existe (`gestion_eventos_db`), la crea automáticamente.
3. Determina los cambios estructurales necesarios y genera el archivo `migration.sql`.
4. Ejecuta el SQL sobre PostgreSQL creando las tablas.
5. Registra la migración en la tabla interna `_prisma_migrations`.
6. Dispara automáticamente `prisma generate` para sincronizar el cliente.

---

## 8. Generación de Prisma Client (`generate`)

```bash
npx prisma generate
```

### ¿Qué significa el comando?
* **`npx`**: Ejecuta el ejecutable local de Prisma.
* **`prisma`**: CLI de Prisma.
* **`generate`**: Ejecuta los generadores configurados en `schema.prisma`.

### ¿Qué operaciones realiza?
En base a `schema.prisma`:
1. Interpreta el bloque `generator client`.
2. Analiza los modelos definidos (`Autor`, `Libro`, `Evento`).
3. Genera el código tipado adaptado a esos modelos.
4. Guarda los archivos en la carpeta configurada mediante `output` (`src/generated/prisma`).

> [!CAUTION]
> **`prisma generate` genera código para ser usado por la aplicación.**  
> No crea tablas, no ejecuta migraciones y no agrega registros en PostgreSQL.

---

## 9. Centralización del Cliente (`src/config/prisma.js`)

Para interactuar con la base de datos desde los controladores de Express, creamos una **única instancia reutilizable** de Prisma Client:

```javascript
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

// 1. Configurar el adaptador con la cadena de conexión de PostgreSQL
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

// 2. Instanciar Prisma Client inyectando el adaptador
const prisma = new PrismaClient({ adapter });

export default prisma;
```

### ¿Qué realiza cada parte?
* **`dotenv/config`**: Carga las variables definidas en `.env`.
* **`PrismaPg`**: Configura el adaptador para PostgreSQL.
* **`PrismaClient`**: Importa el cliente generado para nuestros modelos.
* **`new PrismaClient({ adapter })`**: Crea la instancia que utilizará la API.

### ¿Por qué utilizar un archivo separado (Patrón Singleton)?
* **Centraliza la configuración** del acceso a datos en un único punto.
* **Evita repetir la lógica de conexión** en cada controlador.
* **Previene agotar el grupo de conexiones (connection pool)** de PostgreSQL reutilizando siempre la misma instancia.
* Los controladores simplemente importan `prisma` ya preparado:
  ```javascript
  import prisma from '../config/prisma.js';
  ```

---

## 10. Exploración de Datos con Prisma Studio

Para inspeccionar o insertar datos de prueba sin escribir código:

```bash
npx prisma studio
```

Normalmente se abre automáticamente en el navegador en: **`http://localhost:5555`**

### ¿Qué es Prisma Studio?
Es una interfaz gráfica web de desarrollo que permite visualizar, filtrar, crear, editar y eliminar registros de los modelos definidos en `schema.prisma`.

> [!NOTE]
> **Prisma Studio no reemplaza a pgAdmin ni DBeaver:**  
> Cada herramienta se utiliza según su responsabilidad: pgAdmin administra el servidor PostgreSQL (permisos, bases de datos, copias de seguridad), mientras que Prisma Studio es un visualizador rápido centrado en los modelos de la aplicación.

---

## 11. Tabla Resumen de Comandos

| Comando | Función Principal | ¿Afecta la BD? | ¿Afecta el Código? |
|---|---|:---:|:---:|
| `npx prisma init` | Inicializa la estructura de Prisma en el proyecto | ❌ No | ✅ Sí (crea archivos) |
| `npx prisma validate` | Valida sintaxis y tipos en `schema.prisma` | ❌ No | ❌ No |
| `npx prisma format` | Alinea e indenta automáticamente `schema.prisma` | ❌ No | ✅ Sí (formatea archivo) |
| `npx prisma migrate dev --name <nombre>` | Crea el archivo SQL y aplica los cambios estructurales en PostgreSQL | ✅ **Sí (crea/modifica tablas)** | ✅ Sí (dispara `generate`) |
| `npx prisma generate` | Construye los archivos del cliente en `src/generated/prisma` | ❌ No | ✅ **Sí (compila el cliente)** |
| `npx prisma studio` | Abre la consola web en el puerto `5555` | ✅ Solo si editas registros | ❌ No |
