# Guía Detallada: Middlewares y Utilidades
### API Poncho Digital — Cátedra Desarrollo Backend (UNCa)

Este documento explica en profundidad el funcionamiento, la lógica interna y las mejores prácticas de cada uno de los middlewares y utilidades (`utils`) creados para la API **Poncho Digital**.

---

## Índice
1. [¿Qué es un Middleware en Express?](#qué-es-un-middleware-en-express)
2. [1. Logger de Peticiones (`logger.js`)](#1-logger-de-peticiones-loggerjs)
3. [2. Validador de ID con Zod (`validarId.js`)](#2-validador-de-id-con-zod-validaridjs)
4. [3. Validador de Parámetros de Consulta (`validarQuerys.js`)](#3-validador-de-parámetros-de-consulta-validarquerysjs)
5. [4. Validador de Productos con Zod (`validarProducto.js`)](#4-validador-de-productos-con-zod-validarproductojs)
6. [5. Creador de Errores HTTP (`crearError.js`)](#5-creador-de-errores-http-crearerrorjs)
7. [6. Formateador de Errores Zod (`ErroresZod.js`)](#6-formateador-de-errores-zod-erroreszodjs)
8. [7. Capturador 404 (`rutaNoEncontrada.js`)](#7-capturador-404-rutanoencontradajs)
9. [8. Manejador Global Centralizado (`manejoErrores.js`)](#8-manejador-global-centralizado-manejoerroresjs)
10. [Mapa de Relación entre Componentes](#mapa-de-relación-entre-componentes)

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

## 2. Validador de ID con Zod (`validarId.js`)

**Ubicación:** `src/middlewares/validaciones/validarId.js`  
**Tipo:** Middleware de Validación a nivel de Ruta con Zod  
**Posición:** En las rutas `artesano.routes.js` y `producto.routes.js` antes de cada controlador con parámetro `/:id`.

### Código:
```javascript
import { crearError } from "../../utils/crearError.js";
import { FiltrarProductoPorIDSchema } from "../../validators/producto.schemas.js";
import { detallarErroresZod } from "../../utils/ErroresZod.js";

export const validarId = (req, res, next) => {
    const resultado = FiltrarProductoPorIDSchema.safeParse(req.params);
      
    if (!resultado.success) { 
        const detalles = detallarErroresZod(resultado.error);
        return next(crearError('Error en los parámetros del ID del producto', 400, detalles));
    }
    
    req.params.id = resultado.data.id;
    next();
};
```

### ¿Cómo funciona?
1. **`FiltrarProductoPorIDSchema.safeParse(req.params)`:** Pasa los parámetros de la URL directamente a Zod (`{ id: "15" }`).
2. **Coerción y validación numérica:** Zod aplica `z.coerce.number().int().positive()`. Si el ID es texto inválido (`"abc"`), decimal (`"1.5"`) o negativo (`"-3"`), Zod detecta el fallo.
3. **Formateo con `detallarErroresZod`:** Transforma los `issues` de Zod en un array limpio `[{ path: "id", message: "..." }]`.
4. **Delegación a `crearError`:** Envía a Express el error 400 acompañado de los detalles estructurados.
5. **`req.params.id = resultado.data.id`:** Asigna el ID ya convertido a tipo `Number` para que el controlador lo reciba limpio.

---

## 3. Validador de Parámetros de Consulta (`validarQuerys.js`)

**Ubicación:** `src/middlewares/validaciones/validarQuerys.js`  
**Tipo:** Middleware de Validación para Query Strings (`req.query`)  
**Posición:** En `GET /productos` antes de `getProductos`.

### Código:
```javascript
import { crearError } from "../../utils/crearError.js";
import { obtenerProductosSchema } from "../../validators/producto.schemas.js";
import { detallarErroresZod } from "../../utils/ErroresZod.js";

export const validarConsultaProductos = (req, res, next) => {
    const resultado = obtenerProductosSchema.safeParse(req.query);

    if (!resultado.success) {
        const detalles = detallarErroresZod(resultado.error);
        return next(crearError('Error en los parámetros de la consulta de Productos', 400, detalles));
    }

    req.consultaProductos = resultado.data;
    return next();
};
```

### ¿Cómo funciona?
1. **Evalúa `req.query`:** Valida filtros (`nombre`, `precio`, `artesanoId`, `eliminado`), ordenamiento (`ordenarPor`, `direccion`) y paginación (`pagina`, `limite`).
2. **Coerción y valores por defecto:** Por ejemplo, `pagina` y `limite` llegan como strings desde la URL (`?pagina=2&limite=5`) y Zod los transforma automáticamente a números enteros con valores por defecto (`pagina=1`, `limite=10`).
3. **Inyección en `req.consultaProductos`:** Almacena el objeto validado en la petición para que el controlador y el servicio lo consuman directamente sin tener que volver a parsear la URL.

---

## 4. Validador de Productos con Zod (`validarProducto.js`)

**Ubicación:** `src/middlewares/validaciones/validarProducto.js`  
**Esquemas:** `src/validators/producto.schemas.js`  
**Tipo:** Middleware de Validación con Zod  
**Posición:** En `producto.routes.js`, antes de `createProducto` (POST) y `updateProducto` (PUT).

### Código:
```javascript
import { crearError } from "../../utils/crearError.js";
import { crearProductoSchema, actualizarProductoSchema } from "../../validators/producto.schemas.js";
import { detallarErroresZod } from "../../utils/ErroresZod.js";

export const validarProducto = (req, res, next) => {
    let schema;
    let datosAValidar = req.body ?? {};

    switch (req.method) {
        case 'POST':
            schema = crearProductoSchema;
            break;
        case 'PUT':
            schema = actualizarProductoSchema;
            break;
        default:
            return next();
    }

    const resultado = schema.safeParse(datosAValidar);

    if (!resultado.success) { 
        const detalles = detallarErroresZod(resultado.error);
        return next(crearError('Error en los parámetros del producto', 400, detalles));
    }

    // Sobrescribimos req.body con los datos parseados y validados por Zod (DTO)
    req.body = resultado.data;
    next();
};
```

### ¿Cómo funciona?
1. **Blindaje ante `undefined` (`req.body ?? {}`):** Previene caídas si el cliente omite el body o el header `Content-Type: application/json`.
2. **Selección polimórfica de esquema:** En `POST` exige todos los campos obligatorios (`crearProductoSchema`); en `PUT` permite campos opcionales para modificaciones parciales (`actualizarProductoSchema`).
3. **Validación segura (`safeParse`):** No lanza excepciones no controladas.
4. **Captura de errores estructurados:** Usa `detallarErroresZod(resultado.error)` para extraer los campos con error.
5. **Sanitización y generación del DTO:** En caso de éxito, `req.body = resultado.data` entrega al controlador un DTO limpio, tipado y sin propiedades no deseadas.

---

## 5. Creador de Errores HTTP (`crearError.js`)

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

## 6. Formateador de Errores Zod (`ErroresZod.js`)

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

## 7. Capturador 404 (`rutaNoEncontrada.js`)

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

## 8. Manejador Global Centralizado (`manejoErrores.js`)

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
| **`validarId.js`** | Validación de URL (:id) | Rutas `/productos/:id` y `/artesanos/:id` | `req.params.id` como `Number` o error 400 |
| **`validarQuerys.js`** | Validación de Query Strings | `GET /productos` | `req.consultaProductos` validado con paginación/filtros |
| **`validarProducto.js`** | Validación de body (Zod) | Rutas POST y PUT de `/productos` | `req.body` como DTO limpio o error 400 |
| **`ErroresZod.js`** | Formateador de fallos Zod | `validarId`, `validarProducto`, `validarQuerys` | Array estructurado `[{ path, message }]` |
| **`producto.schemas.js`** | Esquemas declarativos | Middlewares de validación | Reglas de validación Zod con `.safeParse()` |
| **`crearError.js`** | Fabricador de Errores | Controladores, servicios y validadores | Objeto `Error` con `.status`, `.message` y `.details` |
| **`rutaNoEncontrada.js`** | Detección de rutas 404 | Express cuando no hay coincidencias | Error 404 transferido a `next(error)` |
| **`manejoErrores.js`** | Respuesta final de fallos | Express cuando se invoca `next(error)` | Respuesta JSON homogénea `{ error, details? }` |
