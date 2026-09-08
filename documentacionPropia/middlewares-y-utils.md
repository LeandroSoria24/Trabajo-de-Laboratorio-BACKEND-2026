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
7. [Mapa de Relación entre Componentes](#mapa-de-relación-entre-componentes)

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
**Propósito:** Estandarizar la creación de errores en cualquier parte de la aplicación.

### Código:
```javascript
export const crearError = (mensaje, status) => {
    const error = new Error(mensaje);
    error.status = status;
    return error;
};
```

### ¿Cómo funciona?
1. **`new Error(mensaje)`**  
   Crea una instancia nativa de `Error` de JavaScript. Esto le otorga automáticamente:
   * `error.message`: El texto descriptivo del fallo.
   * `error.stack`: La traza completa que indica en qué archivo y qué línea exacta ocurrió el error.
2. **`error.status = status;`**  
   Agrega una propiedad personalizada llamada `status` para guardar el código HTTP deseado (ej: 400, 404, 401, 403, 500).
3. **Retorno:**  
   Devuelve el objeto completo listo para ser lanzado (`throw`) o enviado mediante `next(error)`.

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

## Mapa de Relación entre Componentes

| Archivo | Rol | ¿Quién lo invoca o llama? | ¿Qué entrega al siguiente eslabón? |
|---|---|---|---|
| **`logger.js`** | Entrada y Salida | Express al recibir cualquier petición | Pasa la petición limpia mediante `next()` |
| **`validarId.js`** | Validación de parámetros | Rutas `/libros/:id` y `/autores/:id` | Pasa con `next()` o corta con `next(crearError(..., 400))` |
| **`crearError.js`** | Fabricador de Errores | Controladores, `validarId` y `rutaNoEncontrada` | Un objeto `Error` con `.status` y `.message` |
| **`rutaNoEncontrada.js`** | Detección de rutas 404 | Express cuando ninguna ruta coincide | Envía el error 404 a `next(error)` |
| **`manejoErrores.js`** | Respuesta final de fallos | Express cuando alguien hace `next(error)` | Responde el JSON final con código HTTP |
