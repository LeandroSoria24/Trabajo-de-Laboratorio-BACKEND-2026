# Guía Detallada: Middlewares y Utilidades

Este documento explica en profundidad el funcionamiento, la lógica interna y las mejores prácticas de cada uno de los middlewares y utilidades (`utils`) creados para la API de biblioteca.

---

## 📑 Índice
1. [¿Qué es un Middleware en Express?](#qué-es-un-middleware-en-express)
2. [1. Logger de Peticiones (`logger.js`)](#1-logger-de-peticiones-loggerjs)
3. [2. Validador de ID (`validarId.js`)](#2-validador-de-id-validaridjs)
4. [3. Creador de Errores (`crearError.js`)](#3-creador-de-errores-crearerrorjs)
5. [4. Capturador 404 (`rutaNoEncontrada.js`)](#4-capturador-404-rutanoencontradajs)
6. [5. Manejador Global de Errores (`manejoErrores.js`)](#5-manejador-global-de-errores-manejoerroresjs)
7. [6. Validador de Libros con Zod (`validadlibro.js`)](#6-validador-de-libros-con-zod-validadlibrojs)
8. [Mapa de Relación entre Componentes](#mapa-de-relación-entre-componentes)

---

## ¿Qué es un Middleware en Express?

Un **middleware** es una función que se ejecuta en medio del ciclo de vida de una petición HTTP (entre que el cliente hace la solicitud y el servidor envía la respuesta final).

Tiene acceso a tres objetos fundamentales:
* **`req` (Request):** La información que envía el cliente (método, URL, headers, body, params, query).
* **`res` (Response):** Las herramientas para responderle al cliente (`res.json()`, `res.status()`, etc.).
* **`next` (Next function):** La función para pasar el control al siguiente middleware o ruta.

---

## 1. Logger de Peticiones (`logger.js`)

**Ubicación:** `src/middlewares/logger.js`  
**Tipo:** Middleware Informativo / Monitoreo  
**Posición en `app.js`:** Al principio de todo (antes de cualquier ruta).

### Código:
```javascript
export const logger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });

    next();
};
```

### ¿Cómo funciona línea por línea?
1. **`const start = Date.now();`**  
   Captura la marca de tiempo en milisegundos en el momento exacto en que la petición ingresa al servidor.
2. **`res.on('finish', () => { ... })`**  
   Node.js maneja eventos. El evento `'finish'` se emite automáticamente cuando la respuesta se ha terminado de enviar al cliente (por ejemplo, después de que un controlador ejecuta `res.json(...)`).  
   El callback **no se ejecuta de inmediato**: se queda "dormido" esperando que la petición termine.
3. **`const duration = Date.now() - start;`**  
   Calcula la diferencia de tiempo para saber cuántos milisegundos demoró la API en procesar la consulta.
4. **`req.originalUrl` vs `req.url`**  
   Se utiliza `req.originalUrl` porque los enrutadores modulares de Express (`libros.routes.js`, etc.) recortan el prefijo en `req.url`. Con `originalUrl` garantizamos ver la ruta completa original (ej: `/libros/1` en lugar de solo `/1`).
5. **`next();`**  
   Indispensable. Permite que la petición continúe su camino hacia los controladores y rutas. Si olvidamos el `next()`, el servidor se quedaría colgado eternamente.

### Salida de ejemplo en consola:
```text
GET /libros - 200 (3ms)
POST /libros - 201 (7ms)
GET /ruta-falsa - 404 (1ms)
```

---

## 2. Validador de ID (`validarId.js`)

**Ubicación:** `src/middlewares/validarId.js`  
**Tipo:** Middleware de Validación a nivel de Ruta  
**Posición:** En las rutas `libros.routes.js` y `autores.routes.js` antes de cada controlador con parámetro `/:id`.

### Código:
```javascript
import { crearError } from "../utils/crearError.js";

export const validarId = (req, res, next) => {
    const id = Number(req.params.id);
    const recurso = req.baseUrl.includes('libros') ? 'libro' : 'autor';

    if (!Number.isInteger(id) || id <= 0) {
        return next(crearError(`El ID del ${recurso} debe ser un número entero positivo`, 400));
    }

    next();
};
```

### ¿Cómo funciona?
1. **`Number(req.params.id)`:** Convierte el parámetro de texto de la URL en un número.
2. **`req.baseUrl.includes('libros') ? 'libro' : 'autor'`:**  
   Detecta automáticamente si la petición provino del router de libros (`/libros`) o de autores (`/autores`), permitiendo **reutilizar el mismo middleware** en ambos módulos adaptando el mensaje de error.
3. **`if (!Number.isInteger(id) || id <= 0)`:**  
   Si el ID no es un entero positivo (por ejemplo, `abc`, `-5` o `1.5`), corta el flujo llamando a `next(crearError(..., 400))`, derivando el error inmediatamente a `manejoErrores`.
4. **`next()`:** Si el ID es válido, deja pasar la petición al controlador correspondiente (`getLibroPorId`, `updateLibro`, etc.).

---

## 3. Creador de Errores (`crearError.js`)

**Ubicación:** `src/utils/crearError.js`  
**Tipo:** Función Utilitaria (Factory Pattern)  
**Propósito:** Estandarizar la creación de errores en cualquier parte de la aplicación, con validaciones internas para evitar que el programador envíe datos erróneos.

### Código:
```javascript
export const crearError = (mensaje, status = 500) => {
    // El status debe ser un número entre 400 y 599. Si no, forzamos un 500 (Error de Servidor)
    const statusCode = (
        typeof status === 'number' && 
        status >= 400 && 
        status < 600
    ) ? status : 500;

    // El mensaje debe ser un string no vacío. Si no lo es, asignamos un mensaje genérico
    const message = (typeof mensaje === 'string' && mensaje.trim() !== '') 
        ? mensaje 
        : "Ha ocurrido un error interno en el servidor.";

    const error = new Error(message);
    error.status = statusCode;
    return error;
};
```

### ¿Cómo funciona?
1. **`status = 500` (valor por defecto):**  
   Si el programador olvida pasar el código HTTP, se asume `500` automáticamente.
2. **Validación de `status`:**  
   El código HTTP debe ser un número entre 400 y 599. Si alguien pasa `200`, `"404"`, o `undefined`, se fuerza a `500`. Esto previene que un error del programador genere un código de respuesta inválido.
3. **Validación de `mensaje`:**  
   Si el mensaje no es un `string` o está vacío/solo con espacios, se asigna `"Ha ocurrido un error interno en el servidor."`. Esto evita que el cliente reciba un mensaje vacío o `null`.
4. **`new Error(message)`:**  
   Crea una instancia nativa de `Error` de JavaScript, otorgándole:
   * `error.message`: El texto descriptivo del fallo (ya validado).
   * `error.stack`: La traza completa que indica en qué archivo y línea ocurrió el error.
5. **`error.status = statusCode;`:**  
   Adjunta el código HTTP validado como propiedad personalizada.

> [!TIP]
> **¿Por qué las validaciones están en `crearError` y no en `manejoErrores`?**  
> Porque `crearError` es el punto de entrada controlado por el programador. Las validaciones aquí aseguran que cualquier error fabricado manualmente ya nazca con datos correctos, sin necesidad de duplicar lógica en el middleware final.

> [!TIP]
> **¿Por qué no devolver un objeto plano `{ error: mensaje, status }`?**  
> Porque un objeto nativo `Error` preserva la traza (`stack trace`). Si ocurre un fallo imprevisto, la consola puede decirnos con exactitud la línea de código donde se generó.

---

## 3. Capturador 404 (`rutaNoEncontrada.js`)

**Ubicación:** `src/middlewares/rutaNoEncontrada.js`  
**Tipo:** Middleware de Enrutamiento / Ruta Comodín  
**Posición en `app.js`:** Después de todas las rutas válidas, pero antes de `manejoErrores`.

### Código:
```javascript
import { crearError } from "../utils/crearError.js";

export const rutaNoEncontrada = (req, res, next) => {
    next(crearError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
};
```

### ¿Cómo funciona?
1. Si un cliente solicita una ruta que no existe (como `GET /usuarios`), Express intentará coincidirla con `/`, `/info`, `/libros`, `/autores` y `/docs`.
2. Al no coincidir con ninguna, la petición llega a este middleware.
3. Invoca la utilidad: `crearError('Ruta no encontrada: GET /usuarios', 404)`.
4. Llama a **`next(...)` con un argumento**. Al recibir un argumento, Express sabe que ocurrió un fallo y salta directamente al middleware de errores, ignorando cualquier otra función intermedia.

---

## 4. Manejador Global de Errores (`manejoErrores.js`)

**Ubicación:** `src/middlewares/manejoErrores.js`  
**Tipo:** Middleware de Errores (Error Handling Middleware)  
**Posición en `app.js`:** En la última posición absoluta de la aplicación.

### Código:
```javascript
export const manejoErrores = (err, req, res, next) => {
    const estado = err.status || 500;

    if (estado >= 500) {
        console.error(err);
        return res.status(500).json({
            mensaje: 'Error interno del servidor'
        });
    }

    res.status(estado).json({ error: err.message });
};
```

### Aspectos Clave:
* **Los 4 Parámetros `(err, req, res, next)`:**  
  Express detecta la cantidad de argumentos. Si una función tiene **4 parámetros**, la clasifica como manejador de errores. Si tuviera 3, no recibiría los errores.
* **`const estado = err.status || 500;`**  
  Si el error provino de `crearError('...', 404)`, `err.status` valdrá 404. Si fue un error inesperado de JavaScript (ej. un `TypeError` o variable indefinida), no tendrá `status` y asumirá automáticamente `500`.

### Lógica de Bifurcación (Seguridad vs Claridad):
1. **Errores del Servidor (`estado >= 500`):**
   * Se muestra `console.error(err)` en la terminal para que los desarrolladores puedan depurarlo.
   * Al cliente se le responde un mensaje genérico: `{ "mensaje": "Error interno del servidor" }`.  
     *(Principio de seguridad: nunca exponer al público librerías, versiones, rutas de carpetas o consultas SQL).*
2. **Errores del Cliente (`estado < 500`, como 400 o 404):**
   * Es seguro y necesario informar al usuario qué hizo mal:  
     `res.status(estado).json({ error: err.message });`

> [!IMPORTANT]
> **¿Por qué NO lleva `next()`?**  
> Porque `res.json()` ya envía la respuesta HTTP y cierra la conexión automáticamente. Llamar a `next()` después de haber respondido intentaría seguir procesando una petición ya finalizada.

---

## 6. Validador de Libros con Zod (`validadlibro.js`)

**Ubicación:** `src/middlewares/validaciones/validadlibro.js`  
**Esquemas:** `src/validators/libro.schemas.js`  
**Tipo:** Middleware de Validación con Zod  
**Posición:** En `libro.routes.js`, antes de `createLibro` (POST) y `updateLibro` (PUT).

### Esquema Zod (`libro.schemas.js`):
```javascript
import { z } from "zod";

export const crearLibroSchema = z.object({
  titulo: z.string().trim().min(1),
  autor: z.string().trim().min(1),
  anio: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  categoriaId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  categoriaID: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable()
});
```

### Middleware (`validadlibro.js`):
```javascript
import { crearError } from "../../utils/crearError.js";
import { crearLibroSchema, actualizarLibroSchema } from "../../validators/libro.schemas.js";

export const validarLibro = (req, res, next) => {
    const schema = req.method === 'PUT' ? actualizarLibroSchema : crearLibroSchema;
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
        const issue = resultado.error.issues[0];
        const campo = issue.path.join('.') || 'body';
        return next(crearError(`Error en el campo '${campo}': ${issue.message}`, 400));
    }

    req.body = resultado.data;
    next();
};
```

### ¿Cómo funciona?
1. **Selección de esquema:** Según `req.method`, elige `crearLibroSchema` (POST) o `actualizarLibroSchema` (PUT).
2. **`schema.safeParse(req.body)`:** Valida el body sin lanzar excepciones. Devuelve `{ success: true, data }` o `{ success: false, error }`.
3. **Si falla:** Extrae el primer `issue` de Zod, arma un mensaje descriptivo con el nombre del campo y lo envía como error 400 mediante `crearError`.
4. **Si pasa:** Reemplaza `req.body` con `resultado.data`, que contiene los datos ya limpios (con `.trim()` aplicado). Esto garantiza que los controladores siempre reciban datos sanitizados.

### Reglas declaradas en el esquema:

| Campo | Tipo | Reglas |
|---|---|---|
| **`titulo`** | `string` | Obligatorio, se eliminan espacios (`.trim()`), no puede quedar vacío (`.min(1)`) |
| **`autor`** | `string` | Obligatorio, se eliminan espacios (`.trim()`), no puede quedar vacío (`.min(1)`) |
| **`anio`** | `number` | Opcional/nullable, debe ser entero positivo |
| **`categoriaId`** / **`categoriaID`** | `number` | Opcional/nullable, debe ser entero positivo |

### Uso en las rutas:
```javascript
router.post('/', validarLibro, createLibro);
router.put('/:id', validarId, validarLibro, updateLibro);
```

> [!TIP]
> **El concepto de DTO en la cátedra (Unidad 3):**  
> Cuando `validadlibro.js` ejecuta `req.body = resultado.data`, los datos quedan limpios y normalizados. El controlador toma ese `req.body` y lo transfiere directamente a la **capa de servicios** (`src/services/libro.services.js`). A ese objeto plano de transferencia se lo denomina **DTO** (Data Transfer Object).

---

## Mapa de Relación entre Componentes

| Archivo | Rol | ¿Quién lo invoca o llama? | ¿Qué entrega al siguiente eslabón? |
|---|---|---|---|
| **`logger.js`** | Entrada y Salida | Express al recibir cualquier petición | Pasa la petición limpia mediante `next()` |
| **`validarId.js`** | Validación de parámetros | Rutas `/libros/:id` y `/autores/:id` | Pasa con `next()` o corta con `next(crearError(..., 400))` |
| **`validadlibro.js`** | Validación de body (Zod) | Rutas POST y PUT de `/libros` | Pasa con `req.body` limpio (DTO) o corta con `next(crearError(..., 400))` |
| **`libro.schemas.js`** | Esquemas de validación | `validadlibro.js` los importa | Objetos esquema Zod para usar con `.safeParse()` |
| **`libro.services.js`** | Lógica de negocio y persistencia | Controladores | El resultado de Prisma o un error lanzado con `throw` |
| **`crearError.js`** | Fabricador de Errores | Controladores, servicios, middlewares | Un objeto `Error` con `.status` y `.message` validados |
| **`rutaNoEncontrada.js`** | Detección de rutas 404 | Express cuando ninguna ruta coincide | Envía el error 404 a `next(error)` |
| **`manejoErrores.js`** | Respuesta final de fallos | Express cuando alguien hace `next(error)` | Responde el JSON final con código HTTP |
