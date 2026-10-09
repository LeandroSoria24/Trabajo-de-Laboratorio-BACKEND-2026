# Guía Detallada: Middlewares y Utilidades
### API Poncho Digital — Cátedra Desarrollo Backend (UNCa)

Este documento explica en profundidad el funcionamiento, la lógica interna y las mejores prácticas de cada uno de los middlewares y utilidades (`utils`) creados para la API **Poncho Digital**.

---

## Índice
1. [¿Qué es un Middleware en Express?](#qué-es-un-middleware-en-express)
2. [1. Logger de Peticiones (`logger.js`)](#1-logger-de-peticiones-loggerjs)
3. [2. Validador Universal con Zod (`validarSchema.js`)](#2-validador-universal-con-zod-validarschemajs)
4. [3. Autenticación JWT y Revocaciones (`autenticarUsuario.js`)](#3-autenticación-jwt-y-revocaciones-autenticarusuariojs)
5. [4. Creador de Errores HTTP (`crearError.js`)](#4-creador-de-errores-http-crearerrorjs)
6. [5. Formateador de Errores Zod (`ErroresZod.js`)](#5-formateador-de-errores-zod-erroreszodjs)
7. [6. Capturador 404 (`rutaNoEncontrada.js`)](#6-capturador-404-rutanoencontradajs)
8. [7. Manejador Global Centralizado (`manejoErrores.js`)](#7-manejador-global-centralizado-manejoerroresjs)
9. [Mapa de Relación entre Componentes](#mapa-de-relación-entre-componentes)

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
   Se utiliza `req.originalUrl` porque los enrutadores modulares de Express (`artesano.routes.js`, `producto.routes.js`, etc.) recortan el prefijo en `req.url`. Con `originalUrl` garantizamos ver la ruta completa original (ej: `/productos/1` en lugar de solo `/1`).
5. **`next();`**  
   Indispensable. Permite que la petición continúe su camino hacia los controladores y rutas.

### Salida de ejemplo en consola:
```text
GET /productos - 200 (3ms)
POST /productos - 201 (7ms)
GET /ruta-falsa - 404 (1ms)
```

---

## 2. Validador Universal con Zod (`validarSchema.js`)

**Ubicación:** `src/middlewares/validarSchema.js`  
**Tipo:** Middleware Fábrica Universal (Factory Pattern) con Zod  
**Posición:** En las rutas de cualquier entidad (`artesano.routes.js`, `producto.routes.js`, etc.) para validar `body`, `params` o `query`.

### Código:
```javascript
import { crearError } from '../utils/crearError.js';
import { detallarErroresZod } from '../utils/ErroresZod.js';

export const validarSchema = (schema, origen = 'body') => (req, res, next) => {
    const datos = req[origen] ?? {};
    const resultado = schema.safeParse(datos);

    if (!resultado.success) {
        const detalles = detallarErroresZod(resultado.error);
        return next(crearError(`Error en los parámetros de ${origen}`, 400, detalles));
    }

    if (origen === 'query') {
        req.consulta = resultado.data;
    } else {
        req[origen] = resultado.data;
    }

    next();
};
```

### ¿Cómo funciona?
1. **Patrón Fábrica (Factory Function):** Recibe el esquema declarativo de Zod (`schema`) y el segmento de la petición a evaluar (`origen`: `'body'`, `'params'` o `'query'`). Retorna la función middleware estándar `(req, res, next)` que Express puede ejecutar.
2. **Acceso dinámico mediante corchetes (`req[origen]`):**
   - Si `origen = 'query'`, evalúa `req.query`.
   - Si `origen = 'params'`, evalúa `req.params`.
   - Si `origen = 'body'`, evalúa `req.body`.
3. **Blindaje ante `undefined` (`req[origen] ?? {}`):** Evita fallos de ejecución si el cliente omite el body o no envía cabeceras `Content-Type`.
4. **Validación y sanitización (`schema.safeParse`):** Zod comprueba tipos, coerciones automáticas (`z.coerce.number()`) y valores por defecto (`.default()`).
5. **Formateo y delegación de errores:** Si la validación falla, transforma los errores con `detallarErroresZod(resultado.error)` y pasa un error HTTP 400 a `next(...)`.
6. **Inyección de datos limpios (DTO):**
   - Para el cuerpo (`body`) o parámetros de ruta (`params`), actualiza `req[origen] = resultado.data`.
   - Para consultas URL (`query`), inyecta los filtros y paginación sanitizados en **`req.consulta`**. Esto previene conflictos con el *getter* nativo de sólo lectura de Express 5 sobre `req.query` y brinda a los controladores un acceso unificado y seguro.

---

## 3. Autenticación JWT y Revocaciones (`autenticarUsuario.js`)

**Ubicación:** `src/middlewares/autenticarUsuario.js`  
**Tipo:** Middleware de Seguridad, Autenticación y Autorización (Bearer JWT con RFC 6750)  
**Posición en rutas:** En rutas privadas (`src/routes/usuario.routes.js`, ej. `/me`, `/logout`) antes de los controladores que requieren identidad verificada.

### Código:
```javascript
import jwt from "jsonwebtoken";
import { verificarToken } from "../services/token.services.js";
import { tokenEstaRevocado } from "../services/revocaciones.services.js";

export const autenticarUsuario = async (req, res, next) => {
    const encabezado = req.get("Authorization")?.trim();
    if (!encabezado) {
        res.set("WWW-Authenticate", "Bearer");
        return res.status(401).json({
            mensaje: "Se requiere un token de acceso."
        });
    }

    const coincidencia = /^Bearer\s+(\S+)$/i.exec(encabezado);
    if (!coincidencia) {
        res.set("WWW-Authenticate", 'Bearer error="invalid_request"');
        return res.status(400).json({
            mensaje: "Usar Authorization: Bearer <token>."
        });
    }

    try {
        req.usuario = verificarToken(coincidencia[1]);
        if (await tokenEstaRevocado(req.usuario.jti)) {
            throw new jwt.JsonWebTokenError("Token revocado.");
        }
    } catch (error) {
        if (!(error instanceof jwt.JsonWebTokenError)) {
            return next(error);
        }
        res.set("WWW-Authenticate", 'Bearer error="invalid_token"');
        return res.status(401).json({
            mensaje: "Token inválido, vencido o revocado."
        });
    }

    return next();
};
```

### ¿Cómo funciona paso a paso?
1. **Extracción del encabezado (`req.get("Authorization")`):**
   Obtiene el valor de la cabecera HTTP de forma insensible a mayúsculas/minúsculas y remueve espacios en los bordes.
2. **Validación de presencia (RFC 6750):**
   Si la petición carece de cabecera `Authorization`, responde HTTP `401 Unauthorized` e incluye la cabecera estándar `WWW-Authenticate: Bearer` exigida por la especificación OAuth 2.0 / Bearer Token.
3. **Validación de formato sintáctico (`/^Bearer\s+(\S+)$/i`):**
   Aplica una expresión regular insensible a mayúsculas para comprobar que el esquema sea `Bearer` seguido de una cadena no vacía (`<token>`). Si el cliente envía un formato incorrecto (ej: `Basic ...` o solo el token sin la palabra `Bearer`), responde HTTP `400 Bad Request` con cabecera `WWW-Authenticate: Bearer error="invalid_request"`.
4. **Verificación criptográfica y estructural (`verificarToken`):**
   Extrae el token del grupo de captura (`coincidencia[1]`) y lo delega al servicio `src/services/token.services.js`. Allí se valida la firma con `JWT_SECRET`, algoritmo `HS256`, y se comprueban con **Zod** los claims requeridos (`sub` tipo UUID, `exp` número y `jti` cadena válida).
5. **Comprobación de Lista Negra en Base de Datos (`tokenEstaRevocado`):**
   Consulta de forma asíncrona en PostgreSQL si el identificador único del token (`req.usuario.jti`) figura en la tabla `TokenRevocado`. Si fue revocado (por ejemplo, porque el usuario cerró sesión con `/logout`), fuerza el lanzamiento de una excepción `jwt.JsonWebTokenError("Token revocado.")`.
6. **Captura y diagnóstico de errores:**
   Si la excepción capturada es una instancia de `jwt.JsonWebTokenError` (token alterado, firma inválida, expirado por tiempo o revocado), emite `401 Unauthorized` con cabecera `WWW-Authenticate: Bearer error="invalid_token"` y mensaje unificado `"Token inválido, vencido o revocado."`. Si se produce cualquier otro fallo imprevisto (ej. caída de conexión con la base de datos), lo remite a `next(error)` para su gestión en el middleware global de 500.
7. **Inyección de identidad (`req.usuario`) y prosecución (`next()`):**
   Al superar exitosamente todas las etapas, asocia el objeto `{ id: payload.sub, jti, exp }` a `req.usuario` y llama a `next()`, permitiendo que los controladores dependientes consuman la identidad del usuario autenticado sin volver a consultar o decodificar el token.

---

## 4. Creador de Errores HTTP (`crearError.js`)

**Ubicación:** `src/utils/crearError.js`  
**Tipo:** Función Utilitaria (Factory Pattern)  
**Propósito:** Estandarizar la creación de instancias nativas de `Error`, adjuntando `status` HTTP y detalles opcionales.

### Código:
```javascript
/**
 * Estructura interna del objeto devuelto:
 * {
 *   name: 'Error',
 *   message: 'Producto no encontrado',   
 *   status: 404,                        
 *   details: [...],                     
 *   stack: 'Error: Producto no encontrado\n    at crearError (...)\n    at ...' 
 * }
 */
export const crearError = (mensaje, status = 500, details = null) => {
    const error = new Error(mensaje);
    error.status = status;

    if (details) {
        error.details = details;
    }

    return error;
};
```

### ¿Cómo funciona?
1. **Instancia nativa `Error`:** Preserva el `stack trace` completo para depuración en desarrollo.
2. **Propiedad `status`:** Asigna el código de respuesta HTTP correspondiente (ej: `400`, `404`, `500`).
3. **Propiedad opcional `details`:** Permite adjuntar arrays con el detalle de los errores de validación sin acoplar la función a ninguna librería específica.

---

## 5. Formateador de Errores Zod (`ErroresZod.js`)

**Ubicación:** `src/utils/ErroresZod.js`  
**Tipo:** Utilidad especializada de formateo para Zod  
**Propósito:** Transformar la estructura interna de `ZodError` en un formato estándar consumible por clientes frontend.

### Código:
```javascript
export const detallarErroresZod = (ZodError) =>
    ZodError.issues.map((issue) => ({
        path: issue.path.join('.') || null,
        message: issue.message,
    }));
```

### ¿Cómo funciona?
1. **`ZodError.issues`:** Recorre la lista de todas las reglas del esquema que no se cumplieron.
2. **`issue.path.join('.')`:** Convierte la ruta de la propiedad a texto legible (ej: `["precio"]` $\rightarrow$ `"precio"`, o `["direccion", "calle"]` $\rightarrow$ `"direccion.calle"`). Si es una validación global, retorna `null`.
3. **`issue.message`:** Extrae el mensaje explicativo definido en el esquema.
4. **Retorno:** Un array de objetos `{ path, message }` listo para inyectar en `crearError(..., 400, detalles)`.

---

## 6. Capturador 404 (`rutaNoEncontrada.js`)

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
1. Si una petición no coincide con ningún endpoint registrado (`/`, `/info`, `/artesanos`, `/productos`), cae automáticamente en este middleware.
2. Invoca `crearError` con código `404`.
3. Al llamar a **`next(error)` con argumento**, Express salta directamente al middleware global de manejo de errores.

---

## 7. Manejador Global Centralizado (`manejoErrores.js`)

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
            error: 'Error interno del servidor'
        });
    }

    const cuerpo = { error: err.message };

    if (err.details) {
        cuerpo.details = err.details;
    }

    res.status(estado).json(cuerpo);
};
```

### Aspectos Clave:
* **Firma de 4 Parámetros `(err, req, res, next)`:** Obligatoria en Express para que la función sea reconocida como capturadora de errores.
* **Seguridad en errores 500:** Registra `err` en consola para los desarrolladores, pero responde un mensaje genérico `{ "error": "Error interno del servidor" }` para no filtrar datos sensibles al cliente.
* **Respuesta unificada en errores 4xx:** Devuelve `{ error: err.message }` y, si contiene `err.details`, incluye el desglose de validaciones en la propiedad `details`.

---

## Mapa de Relación entre Componentes

| Archivo | Rol | ¿Quién lo invoca o llama? | ¿Qué entrega al siguiente eslabón? |
|---|---|---|---|
| **`logger.js`** | Monitoreo HTTP | Express al recibir cualquier petición | Deja pasar la petición limpia con `next()` |
| **`validarSchema.js`** | Validación universal (body, params, query) | Rutas HTTP antes de los controladores | `req[origen]` como DTO limpio y tipado o error 400 |
| **`autenticarUsuario.js`** | Autenticación Bearer JWT y Lista Negra | Rutas privadas (`/me`, `/logout`) | Inyecta `req.usuario = { id, jti, exp }` o rechaza 401/400 |
| **`comun.schemas.js`** | Esquemas Zod compartidos | Rutas con parámetros comunes (`:id`) | Regla para validar identificadores numéricos |
| **`producto.schemas.js`** | Esquemas Zod de Producto | Rutas de `/productos` | Reglas de validación Zod con `.safeParse()` |
| **`ErroresZod.js`** | Formateador de fallos Zod | `validarSchema` | Array estructurado `[{ path, message }]` |
| **`crearError.js`** | Fabricador de Errores | Controladores, servicios y validadores | Objeto `Error` con `.status`, `.message` y `.details` |
| **`rutaNoEncontrada.js`** | Detección de rutas 404 | Express cuando no hay coincidencias | Error 404 transferido a `next(error)` |
| **`manejoErrores.js`** | Respuesta final de fallos | Express cuando se invoca `next(error)` | Respuesta JSON homogénea `{ error, details? }` |
