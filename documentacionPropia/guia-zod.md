# Guía Completa: Zod — Validación de Datos en JavaScript

Este documento explica qué es Zod, cómo funciona internamente, y cómo lo utilizamos en nuestra API de biblioteca para validar los datos que envía el cliente.

---

## 📑 Índice
1. [¿Qué es Zod?](#qué-es-zod)
2. [¿Por qué usar Zod?](#por-qué-usar-zod)
3. [Instalación](#instalación)
4. [Concepto Fundamental: ¿Qué es un Esquema?](#concepto-fundamental-qué-es-un-esquema)
5. [Tipos Primitivos](#tipos-primitivos)
6. [Métodos de Transformación y Restricción](#métodos-de-transformación-y-restricción)
7. [Opcionalidad y Nulabilidad](#opcionalidad-y-nulabilidad)
8. [Esquemas de Objetos (`z.object`)](#esquemas-de-objetos-zobject)
9. [Validación: `.parse()` vs `.safeParse()`](#validación-parse-vs-safeparse)
10. [Estructura de Errores de Zod](#estructura-de-errores-de-zod)
11. [Cómo lo usamos en la API de Biblioteca](#cómo-lo-usamos-en-la-api-de-biblioteca)
12. [Referencia Rápida de Métodos](#referencia-rápida-de-métodos)
13. [Errores Comunes y Soluciones](#errores-comunes-y-soluciones)

---

## ¿Qué es Zod?

**Zod** es una librería de validación de datos para JavaScript y TypeScript. Su propósito es definir **esquemas** (contratos) que describen qué forma deben tener los datos, y luego verificar que los datos recibidos cumplan esas reglas.

Pensá en Zod como un **guardia de seguridad** en la puerta de entrada de tu API: revisa cada dato que llega y solo deja pasar lo que cumple con las reglas definidas.

### Analogía:
```
Sin Zod:                              Con Zod:
┌─────────────┐                       ┌─────────────┐
│   Cliente    │                       │   Cliente    │
│  envía body  │                       │  envía body  │
└──────┬──────┘                       └──────┬──────┘
       │                                      │
       ▼                                      ▼
┌──────────────┐                      ┌──────────────┐
│ Controlador  │ ← recibe datos       │    ZOD       │ ← valida y limpia
│ (sin validar)│   crudos/erróneos    │  (esquema)   │   los datos
└──────────────┘                      └──────┬──────┘
                                              │ ✅ datos limpios
                                              ▼
                                      ┌──────────────┐
                                      │ Controlador  │
                                      │ (datos OK)   │
                                      └──────────────┘
```

---

## ¿Por qué usar Zod?

### Antes (validación manual):
```javascript
export const validarLibro = (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
        return next(crearError('El cuerpo debe ser un objeto JSON', 400));
    }
    if (typeof req.body.titulo !== 'string' || req.body.titulo.trim() === '') {
        return next(crearError('El título es obligatorio', 400));
    }
    if (typeof req.body.autor !== 'string' || req.body.autor.trim() === '') {
        return next(crearError('El autor es obligatorio', 400));
    }
    // ... y así con cada campo, anidando if tras if
    req.body.titulo = req.body.titulo.trim();
    req.body.autor = req.body.autor.trim();
    next();
};
```

### Ahora (con Zod):
```javascript
const schema = z.object({
    titulo: z.string().trim().min(1),
    autor: z.string().trim().min(1),
});

const resultado = schema.safeParse(req.body);
// resultado.data ya tiene los datos limpios ✅
```

**Ventajas:**
- **Menos código:** Una sola declaración reemplaza decenas de `if`.
- **Más legible:** Las reglas se leen como una descripción en inglés.
- **Transformación automática:** `.trim()` limpia los espacios sin código extra.
- **Errores detallados:** Zod genera mensajes descriptivos automáticamente con el nombre del campo y la regla que falló.

---

## Instalación

```bash
npm install zod@4.4.3 --save-exact
```

Usamos `--save-exact` para fijar la versión exacta y evitar que una actualización automática rompa algo.

### Importación en los archivos:
```javascript
import { z } from "zod";
```

`z` es el objeto principal de Zod. Todo se accede desde él: `z.string()`, `z.number()`, `z.object()`, etc.

---

## Concepto Fundamental: ¿Qué es un Esquema?

Un **esquema** es un contrato que describe la forma exacta que deben tener los datos. Es como un molde: si los datos encajan en el molde, pasan; si no, Zod te dice exactamente dónde y por qué fallaron.

```javascript
// El esquema es la DEFINICIÓN de las reglas
const esquema = z.string().min(3);

// safeParse es la VERIFICACIÓN de un dato contra esas reglas
esquema.safeParse("Hola");    // ✅ { success: true, data: "Hola" }
esquema.safeParse("Hi");      // ❌ { success: false, error: ... }
esquema.safeParse(123);       // ❌ { success: false, error: ... }
```

> [!IMPORTANT]
> Un esquema **no modifica** los datos originales. Devuelve una copia validada (y opcionalmente transformada) en `resultado.data`.

---

## Tipos Primitivos

Zod soporta todos los tipos básicos de JavaScript:

### `z.string()` — Cadenas de texto
```javascript
z.string();   // Solo acepta strings

// Ejemplos:
z.string().safeParse("Hola");   // ✅
z.string().safeParse(123);      // ❌ expected string, received number
z.string().safeParse(null);     // ❌ expected string, received null
```

### `z.number()` — Números
```javascript
z.number();   // Solo acepta números (enteros o decimales)

// Ejemplos:
z.number().safeParse(42);       // ✅
z.number().safeParse(3.14);     // ✅
z.number().safeParse("42");     // ❌ expected number, received string
```

### `z.boolean()` — Booleanos
```javascript
z.boolean();   // Solo acepta true o false

// Ejemplos:
z.boolean().safeParse(true);    // ✅
z.boolean().safeParse("true");  // ❌ expected boolean, received string
```

### `z.date()` — Fechas
```javascript
z.date();   // Solo acepta instancias de Date

// Ejemplo:
z.date().safeParse(new Date());   // ✅
z.date().safeParse("2024-01-01"); // ❌ expected date, received string
```

---

## Métodos de Transformación y Restricción

Los métodos se encadenan después del tipo base para agregar reglas adicionales:

### Para Strings:

| Método | Qué hace | Ejemplo |
|---|---|---|
| `.trim()` | Elimina espacios al inicio y final | `"  Hola  "` → `"Hola"` |
| `.min(n)` | Mínimo `n` caracteres (después de trim si se usó) | `.min(1)` → no puede estar vacío |
| `.max(n)` | Máximo `n` caracteres | `.max(100)` → hasta 100 caracteres |
| `.email()` | Debe ser un email válido | `"user@mail.com"` ✅ |
| `.url()` | Debe ser una URL válida | `"https://..."` ✅ |
| `.regex(pattern)` | Debe cumplir una expresión regular | `.regex(/^[A-Z]/)` |
| `.includes(str)` | Debe contener el substring | `.includes("@")` |
| `.startsWith(str)` | Debe empezar con | `.startsWith("http")` |

### Para Numbers:

| Método | Qué hace | Ejemplo |
|---|---|---|
| `.int()` | Debe ser entero (sin decimales) | `42` ✅, `3.14` ❌ |
| `.positive()` | Debe ser mayor a 0 | `1` ✅, `0` ❌, `-5` ❌ |
| `.nonnegative()` | Debe ser 0 o mayor | `0` ✅, `-1` ❌ |
| `.min(n)` | Valor mínimo | `.min(1000)` → año mínimo |
| `.max(n)` | Valor máximo | `.max(2026)` → año máximo |

### Ejemplo encadenado:
```javascript
// "El título debe ser un string, sin espacios en los bordes, con al menos 1 carácter"
z.string().trim().min(1)

// Lectura: string → trim → min(1)
// Primero verifica que sea string
// Luego le aplica trim (elimina espacios)
// Finalmente verifica que tenga al menos 1 carácter DESPUÉS del trim
```

> [!TIP]
> **El orden importa.** Si ponés `.trim()` antes de `.min(1)`, el string `"   "` (solo espacios) primero se convierte en `""` y luego falla el `.min(1)`. Esto es lo que queremos: que un campo con solo espacios sea rechazado.

---

## Opcionalidad y Nulabilidad

### `.optional()` — El campo puede no existir
```javascript
const schema = z.object({
    anio: z.number().optional()
});

schema.safeParse({});            // ✅ { data: {} }              — sin el campo
schema.safeParse({ anio: 2024 });// ✅ { data: { anio: 2024 } }  — con el campo
schema.safeParse({ anio: null });// ❌ — null NO es lo mismo que "no estar"
```

### `.nullable()` — El campo puede ser `null`
```javascript
const schema = z.object({
    anio: z.number().nullable()
});

schema.safeParse({ anio: null }); // ✅ { data: { anio: null } }
schema.safeParse({});             // ❌ — el campo es obligatorio, pero acepta null como valor
```

### `.optional().nullable()` — Puede no existir O ser `null`
```javascript
const schema = z.object({
    anio: z.number().int().positive().optional().nullable()
});

schema.safeParse({});               // ✅ no viene el campo
schema.safeParse({ anio: null });   // ✅ viene como null
schema.safeParse({ anio: 2024 });   // ✅ viene con valor válido
schema.safeParse({ anio: -5 });     // ❌ no es positive
schema.safeParse({ anio: "2024" }); // ❌ no es number
```

> [!IMPORTANT]
> **Diferencia clave entre `optional` y `nullable`:**
> - `optional()`: El campo puede **no estar presente** en el objeto (undefined).
> - `nullable()`: El campo **está presente** pero su valor es `null`.
> - En la práctica, para campos de base de datos que admiten NULL, usamos ambos: `.optional().nullable()`.

---

## Esquemas de Objetos (`z.object`)

Para validar un body JSON completo, definimos un esquema de objeto:

```javascript
const crearLibroSchema = z.object({
    titulo: z.string().trim().min(1),
    autor:  z.string().trim().min(1),
    anio:   z.number().int().positive().optional().nullable()
});
```

### ¿Qué valida esto?

```javascript
// ✅ Caso exitoso completo
crearLibroSchema.safeParse({
    titulo: "  Cien Años de Soledad  ",
    autor: "García Márquez",
    anio: 1967
});
// Resultado: { success: true, data: { titulo: "Cien Años de Soledad", autor: "García Márquez", anio: 1967 } }
// Nota: "titulo" salió sin espacios gracias al .trim()

// ✅ Sin año (es optional)
crearLibroSchema.safeParse({
    titulo: "El Principito",
    autor: "Saint-Exupéry"
});
// Resultado: { success: true, data: { titulo: "El Principito", autor: "Saint-Exupéry" } }

// ❌ Título vacío
crearLibroSchema.safeParse({
    titulo: "   ",
    autor: "Cervantes"
});
// Resultado: { success: false, error: { issues: [{ path: ["titulo"], message: "Too small..." }] } }

// ❌ Sin autor
crearLibroSchema.safeParse({
    titulo: "Don Quijote"
});
// Resultado: { success: false, error: { issues: [{ path: ["autor"], message: "Invalid input: expected string..." }] } }
```

---

## Validación: `.parse()` vs `.safeParse()`

Zod ofrece dos formas de validar datos:

### `.parse()` — Lanza una excepción si falla
```javascript
try {
    const datos = schema.parse(req.body); // ✅ devuelve los datos validados
    console.log(datos);
} catch (error) {
    console.error(error.issues); // ❌ hay que usar try/catch
}
```

### `.safeParse()` — Devuelve un resultado sin lanzar excepciones
```javascript
const resultado = schema.safeParse(req.body);

if (!resultado.success) {
    // ❌ resultado.error contiene los detalles
    console.log(resultado.error.issues);
} else {
    // ✅ resultado.data contiene los datos validados y limpios
    console.log(resultado.data);
}
```

> [!TIP]
> **Usamos `.safeParse()` en nuestra API** porque nos permite manejar el error de forma controlada con `next(crearError(...))` sin necesidad de un bloque `try/catch` adicional. Es más predecible y limpio.

---

## Estructura de Errores de Zod

Cuando `.safeParse()` falla, `resultado.error` contiene un array de `issues`. Cada issue describe un problema específico:

```javascript
const resultado = schema.safeParse({ titulo: "", autor: 123 });

// resultado.error.issues:
[
    {
        code: "too_small",        // Tipo de error
        minimum: 1,               // Valor mínimo esperado
        path: ["titulo"],         // Qué campo falló
        message: "Too small: expected string to have >=1 characters"
    },
    {
        code: "invalid_type",     // Tipo de error
        expected: "string",       // Qué se esperaba
        path: ["autor"],          // Qué campo falló
        message: "Invalid input: expected string, received number"
    }
]
```

### Propiedades de cada `issue`:

| Propiedad | Descripción | Ejemplo |
|---|---|---|
| `code` | Identificador del tipo de error | `"too_small"`, `"invalid_type"` |
| `path` | Array con la ruta al campo que falló | `["titulo"]`, `["direccion", "calle"]` |
| `message` | Mensaje descriptivo del error | `"Too small: expected string..."` |
| `expected` | (En `invalid_type`) El tipo esperado | `"string"`, `"number"` |
| `minimum` | (En `too_small`) El valor mínimo | `1` |

### ¿Cómo extraemos un mensaje útil?
```javascript
const issue = resultado.error.issues[0];         // Tomamos el primer error
const campo = issue.path.join('.') || 'body';     // "titulo", "autor", etc.
const mensaje = `Error en '${campo}': ${issue.message}`;
// → "Error en 'titulo': Too small: expected string to have >=1 characters"
```

---

## Cómo lo usamos en la API de Biblioteca

### Paso 1: Definir los esquemas en `src/validators/libro.schemas.js`

Los esquemas van en una carpeta separada (`validators/`) para mantenerlos independientes de Express:

```javascript
import { z } from "zod";

export const crearLibroSchema = z.object({
    titulo: z.string().trim().min(1),
    autor:  z.string().trim().min(1),
    anio:   z.number().int().positive().optional().nullable(),
    categoriaID: z.number().int().positive().optional().nullable()
});

export const actualizarLibroSchema = z.object({
    titulo: z.string().trim().min(1),
    autor:  z.string().trim().min(1),
    anio:   z.number().int().positive().optional().nullable(),
    categoriaID: z.number().int().positive().optional().nullable()
});
```

### Paso 2: Crear el middleware en `src/middlewares/validaciones/validadlibro.js`

El middleware conecta el esquema de Zod con el flujo de Express:

```javascript
import { crearError } from "../../utils/crearError.js";
import { crearLibroSchema, actualizarLibroSchema } from "../../validators/libro.schemas.js";

export const validarLibro = (req, res, next) => {
    // 1. Elegir esquema según el método HTTP
    const schema = req.method === 'PUT' ? actualizarLibroSchema : crearLibroSchema;

    // 2. Validar el body
    const resultado = schema.safeParse(req.body);

    // 3. Si falla, enviar error 400
    if (!resultado.success) {
        const issue = resultado.error.issues[0];
        const campo = issue.path.join('.') || 'body';
        return next(crearError(`Error en el campo '${campo}': ${issue.message}`, 400));
    }

    // 4. Si pasa, reemplazar req.body con los datos limpios
    req.body = resultado.data;
    next();
};
```

### Paso 3: Conectar en las rutas (`libro.routes.js`)

```javascript
import { validarLibro } from '../middlewares/validaciones/validadlibro.js';

router.post('/', validarLibro, createLibro);
router.put('/:id', validarId, validarLibro, updateLibro);
```

### Paso 4: Transferir los datos como DTO al Servicio (`libro.controllers.js` y `libro.services.js`)

Como el middleware ya sanitizó y validó los datos en `req.body`, el controlador los toma como un **DTO** y delega la operación al servicio:

```javascript
// src/controllers/libro.controllers.js
export const createLibro = async (req, res, next) => {
    try {
        const crearLibroDto = req.body; // DTO validado por Zod
        const nuevoLibro = await crearLibroService(crearLibroDto);
        return res.status(201).json(nuevoLibro);
    } catch (error) {
        return next(error);
    }
};
```

```javascript
// src/services/libro.services.js
export const crearLibro = async (crearLibroDto) => {
    // Aplica reglas de negocio y persiste mediante Prisma Client
    return prisma.libro.create({ data: { ... } });
};
```

### Flujo completo:
```
Cliente envía POST /libros con body: { titulo: "  El Quijote  ", autor: "Cervantes", anio: 1605 }
        │
        ▼
┌──────────────────┐
│  validarLibro    │  ← middleware (Zod)
│                  │
│  1. safeParse()  │  ← Comprueba tipos y normaliza con .trim()
│  2. ¿success?    │
│     ✅ → next()  │  ← Guarda en req.body los datos limpios: { titulo: "El Quijote", ... }
│     ❌ → 400     │  ← Corta con next(crearError(...))
└────────┬─────────┘
         │ ✅
         ▼
┌─────────────────────────┐
│  createLibro            │  ← controlador (gestiona HTTP)
│  crearLibroDto=req.body │  ← transfiere datos como DTO
│  crearLibroService(dto) │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  crearLibro (servicio)  │  ← servicio (reglas de negocio + persistencia)
│  prisma.libro.create()  │  ← único componente que habla con Prisma
└─────────────────────────┘
```

---

## Referencia Rápida de Métodos

### Tipos base
| Método | Tipo que acepta |
|---|---|
| `z.string()` | Cadenas de texto |
| `z.number()` | Números |
| `z.boolean()` | true / false |
| `z.date()` | Instancias de Date |
| `z.object({...})` | Objetos con estructura definida |
| `z.array(schema)` | Arrays de un tipo específico |
| `z.enum([...])` | Solo valores específicos (ej: `z.enum(["activo", "inactivo"])`) |

### Modificadores de tipo
| Método | Efecto |
|---|---|
| `.optional()` | El campo puede no estar presente |
| `.nullable()` | El campo puede ser `null` |
| `.optional().nullable()` | Puede no estar o ser `null` |

### Restricciones de string
| Método | Efecto |
|---|---|
| `.trim()` | Elimina espacios al inicio y final |
| `.min(n)` | Mínimo `n` caracteres |
| `.max(n)` | Máximo `n` caracteres |
| `.email()` | Formato de email válido |
| `.url()` | Formato de URL válido |
| `.regex(patron)` | Debe cumplir la regex |

### Restricciones de number
| Método | Efecto |
|---|---|
| `.int()` | Debe ser entero |
| `.positive()` | Mayor que 0 |
| `.nonnegative()` | Mayor o igual que 0 |
| `.min(n)` | Valor mínimo |
| `.max(n)` | Valor máximo |

### Validación
| Método | Comportamiento ante error |
|---|---|
| `.parse(data)` | Lanza excepción (necesita try/catch) |
| `.safeParse(data)` | Devuelve `{ success, data/error }` |

---

## Errores Comunes y Soluciones

### 1. "Invalid input: expected string, received undefined"
**Causa:** El campo es obligatorio pero no fue enviado en el body.  
**Solución:** Si el campo debería ser opcional, agregá `.optional()` al esquema.

### 2. "Too small: expected string to have >=1 characters"
**Causa:** El string está vacío o solo tiene espacios (después de `.trim()`).  
**Solución:** Asegurate de enviar un valor no vacío para ese campo.

### 3. "Invalid input: expected number, received string"
**Causa:** Se envió `"1605"` (string) en vez de `1605` (número).  
**Solución:** Asegurate de que el JSON del body tenga el tipo correcto. Si necesitás aceptar strings numéricos, usá `z.coerce.number()` en vez de `z.number()`:
```javascript
// z.coerce.number() convierte "1605" → 1605 automáticamente
anio: z.coerce.number().int().positive().optional().nullable()
```

### 4. "Expected object, received null"
**Causa:** El body de la petición llegó como `null` (por ejemplo, si no se envió `Content-Type: application/json`).  
**Solución:** Verificar que el cliente envíe el header `Content-Type: application/json`.

### 5. Campos extra que no están en el esquema
**Comportamiento por defecto:** Zod los ignora (los excluye de `resultado.data`). Esto es seguro porque el controlador solo recibe los campos definidos.  
**Si querés rechazarlos:** Usá `.strict()`:
```javascript
const schema = z.object({
    titulo: z.string(),
    autor: z.string()
}).strict(); // ❌ rechaza campos que no estén en el esquema
```
