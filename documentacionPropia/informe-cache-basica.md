# Informe Técnico — Caché Básica en Memoria
**Materia:** Laboratorio de Computación  
**Grupo:** 7 y 8  
**Integrantes:** Leandro Soria Rosales (MUN° 00292) · Santiago Ortiz (MUN° 00451)  
**Tema:** Caché básica en memoria con expiración (TTL)  
**Proyecto:** API Poncho Digital — Fiesta Nacional e Internacional del Poncho

---

## 1. Explicación Conceptual

### 1.1 ¿Qué es una caché?

Una **caché** es un mecanismo de almacenamiento temporal que guarda el resultado de operaciones costosas para reutilizarlas en consultas posteriores idénticas, sin repetir el procesamiento original. El término proviene del francés *cacher* (esconder) y su uso en sistemas informáticos se remonta al diseño de memorias intermedias entre el procesador y la RAM en los años 1960 (Patterson & Hennessy, 2017).

En el contexto de APIs web, el término refiere a guardar la respuesta de un endpoint en memoria del servidor para evitar consultar la base de datos repetidamente.

### 1.2 Diferencia entre consultar la base de datos y reutilizar un resultado temporal

Cuando una aplicación recibe una petición `GET /productos`, el flujo sin caché es:

```
Cliente → Express → Prisma ORM → PostgreSQL → Serialización JSON → Cliente
```

Este ciclo involucra comunicación por TCP/IP, planificación y ejecución de una consulta SQL, lectura desde el almacenamiento del motor relacional y serialización del resultado. En condiciones normales, este proceso insume entre 20 ms y 150 ms por petición.

Con caché en memoria, el flujo se convierte en:

```
Cliente → Express → Map en RAM → Cliente   (si hay HIT)
Cliente → Express → PostgreSQL → RAM → Cliente   (si hay MISS, luego se guarda)
```

El acceso a un `Map` de JavaScript es O(1) y opera en la misma memoria del proceso Node.js, sin ningún I/O de red. El tiempo de respuesta se reduce a menos de 2 ms en la mayoría de los casos. La diferencia fundamental es que **el dato en caché puede no reflejar el estado actual de la base de datos**, a diferencia de una consulta directa que siempre devuelve el estado más reciente.

### 1.3 Ventajas y limitaciones

**Ventajas:**
- Reducción significativa de la latencia percibida por el usuario (de ~50 ms a ~1 ms en lecturas repetidas).
- Descarga del pool de conexiones de PostgreSQL, protegiendo a la base de datos ante picos de concurrencia.
- Implementación sin dependencias externas complejas (no requiere Redis ni infraestructura adicional).

**Limitaciones:**
- **Inconsistencia temporal (*stale data*):** Si los datos cambian en la base de datos mientras la caché es válida, las consultas en ese intervalo devolverán información desactualizada.
- **Volatilidad:** Al estar en la memoria del proceso, la caché se pierde ante cualquier reinicio del servidor.
- **Ámbito local:** En una arquitectura con múltiples réplicas del servidor, cada instancia mantiene su propia caché independiente, pudiendo generar respuestas diferentes entre nodos.
- **Consumo de RAM:** Sin límite de entradas, conjuntos de datos muy grandes pueden comprometer la memoria disponible del proceso.

### 1.4 Tiempo de vida (TTL) y estrategia de expiración

El **TTL (Time To Live)** establece el intervalo de tiempo durante el cual una entrada en caché se considera válida. Transcurrido ese tiempo, la entrada se marca como *expirada* y la próxima consulta debe volver a la base de datos.

En este proyecto se utilizó una **estrategia de expiración pasiva con invalidación activa**:

- **Pasiva (on-access):** Cada vez que entra una petición, la librería `node-cache` evalúa si la entrada está vigente. Si venció, la descarta y el middleware procede a consultar la base de datos. No hay temporizadores activos bloqueando el event loop de Node.js.
- **Activa (eviction):** Cuando se ejecuta una operación de escritura (`POST`, `PUT`, `DELETE`), el código invalida explícitamente todas las entradas de caché relacionadas con el recurso modificado, garantizando que la próxima lectura obtenga datos frescos sin esperar al vencimiento natural del TTL.

### 1.5 ¿Qué sucede cuando la información cambia antes de que expire la caché?

Sin invalidación activa existe una **ventana de inconsistencia** cuya duración máxima equivale al TTL configurado. En ese período, los clientes reciben datos que ya no reflejan el estado real de la base de datos. Este comportamiento se conoce como **eventual consistency** y es aceptable en contextos donde la información cambia con baja frecuencia y la frescura no es crítica (por ejemplo, un catálogo de productos de feria).

Cuando la frescura es importante (precios, stock, disponibilidad), la invalidación activa al momento de cada escritura elimina esta ventana por completo. La siguiente lectura después de cualquier modificación siempre produce un *CACHE MISS* forzado y obtiene los datos actualizados de PostgreSQL.

---

## 2. Caso Elegido en el Laboratorio

### 2.1 Descripción del endpoint

Se seleccionó el endpoint `GET /productos` de la API Poncho Digital, que retorna el catálogo público de artesanías disponibles en la Fiesta Nacional e Internacional del Poncho.

**Justificación de la elección:**
- Los datos son **públicos y no sensibles**: cualquier visitante puede consultar el catálogo sin autenticación.
- Es el endpoint con **mayor frecuencia de consulta** en toda la API, ya que es la pantalla principal del catálogo.
- Dispone de operaciones de escritura directamente asociadas (`POST /productos`, `PUT /productos/:id`, `DELETE /productos/:id`) que permiten demostrar con precisión el impacto de las modificaciones sobre la caché.
- El contenido cambia con baja frecuencia relativa (un artesano modifica sus productos esporádicamente), haciendo que un TTL de 30 segundos sea razonable.

### 2.2 Rutas afectadas

| Método | Ruta | Caché |
| :--- | :--- | :--- |
| GET | `/productos` | ✅ TTL 30s |
| GET | `/productos/all` | ✅ TTL 30s |
| GET | `/productos/:id` | ✅ TTL 30s |
| POST | `/productos` | Invalida `/productos` |
| PUT | `/productos/:id` | Invalida `/productos` |
| DELETE | `/productos/:id` | Invalida `/productos` |

---

## 3. Implementación

### 3.1 Librería utilizada

Se utilizó **`node-cache`** (v5.x), una librería de caché en memoria para Node.js sin dependencias propias. Provee una API simple con soporte nativo de TTL, limpieza periódica de entradas vencidas y acceso por clave en tiempo constante O(1).

> *Fuente: npm — node-cache. https://www.npmjs.com/package/node-cache*

Se optó por esta librería en lugar de una implementación manual con `Map` por las siguientes razones:
- El TTL y la limpieza periódica están gestionados internamente por la librería, reduciendo la superficie de error.
- La API es más expresiva y semánticamente clara (`cache.get`, `cache.set`, `cache.del`).
- No requiere Redis ni ningún proceso externo adicional.

### 3.2 Código implementado

**`src/middlewares/cache.js`**

```javascript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 30, checkperiod: 60 });

export const cacheMiddleware = (ttl = 30) => (req, res, next) => {
    if (req.method !== 'GET') return next();

    const clave = req.originalUrl;
    const hit = cache.get(clave);

    if (hit) {
        console.log(`[CACHE HIT]  ${clave}`);
        res.setHeader('X-Cache', 'HIT');
        return res.status(hit.statusCode).json(hit.data);
    }

    console.log(`[CACHE MISS] ${clave} — consultando BD...`);
    res.setHeader('X-Cache', 'MISS');

    const jsonOriginal = res.json.bind(res);
    res.json = (body) => {
        if (res.statusCode < 300) cache.set(clave, { data: body, statusCode: res.statusCode }, ttl);
        return jsonOriginal(body);
    };

    next();
};

export const invalidarCache = (prefijo) => {
    cache.del(cache.keys().filter(k => k.startsWith(prefijo)));
    console.log(`[CACHE INVALIDADA] "${prefijo}"`);
};
```

El middleware intercepta la respuesta sobreescribiendo `res.json` para capturar el cuerpo antes de enviarlo al cliente y guardarlo en la caché. De esta forma, la lógica de caché no requiere modificar los controladores ni los servicios existentes.

**`src/routes/producto.routes.js`** (extracto de la modificación):

```javascript
import { cacheMiddleware } from '../middlewares/cache.js';

// 30 segundos de TTL en todos los endpoints GET de productos
router.get('/', autenticarUsuarioOpcional, validarSchema(obtenerProductosSchema, 'query'), cacheMiddleware(30), getProductos);
router.get('/all', autenticarUsuarioOpcional, validarSchema(obtenerProductosSchema, 'query'), cacheMiddleware(30), getProductos);
router.get('/:id', autenticarUsuarioOpcional, validarSchema(idParamSchema, 'params'), cacheMiddleware(30), getProductoPorId);
```

**`src/controllers/producto.controllers.js`** (extracto de invalidación):

```javascript
import { invalidarCache } from '../middlewares/cache.js';

export const updateProducto = async (req, res, next) => {
    try {
        const productoActualizado = await actualizarProducto(Number(req.params.id), req.body);
        invalidarCache('/productos'); // datos cambiaron: se purga la caché
        return res.json(productoActualizado);
    } catch (error) { return next(error); }
};
```

La misma llamada a `invalidarCache` se replicó en `createProducto` y `deleteProductoLogico`.

---

## 4. Evidencias: Las Tres Situaciones

### Situación 1 — Primera consulta (CACHE MISS)

`GET http://localhost:3000/productos` ejecutado por primera vez tras levantar el servidor.

**Consola del servidor:**
```
[CACHE MISS] /productos — consultando BD...
GET /productos - 200 (47ms)
```

**Cabeceras HTTP recibidas por el cliente:**
```
X-Cache: MISS
```
**Tiempo de respuesta:** ~47 ms. El middleware no encontró la clave, delegó la ejecución al controlador, que consultó PostgreSQL a través de Prisma. La respuesta fue guardada en memoria por 30 segundos.

---

### Situación 2 — Consulta antes del vencimiento (CACHE HIT)

`GET http://localhost:3000/productos` ejecutado 10 segundos después de la primera consulta.

**Consola del servidor:**
```
[CACHE HIT]  /productos
GET /productos - 200 (1ms)
```

**Cabeceras HTTP recibidas por el cliente:**
```
X-Cache: HIT
```
**Tiempo de respuesta:** ~1 ms. El middleware encontró la entrada vigente en memoria, interrumpió el ciclo normal de la petición y respondió directamente sin consultar la base de datos. La reducción de latencia fue de aproximadamente el 98 %.

---

### Situación 3 — Consulta después del vencimiento (CACHE EXPIRED)

`GET http://localhost:3000/productos` ejecutado 35 segundos después de la primera consulta (TTL de 30s superado).

**Consola del servidor:**
```
[CACHE MISS] /productos — consultando BD...
GET /productos - 200 (43ms)
```

**Cabeceras HTTP recibidas por el cliente:**
```
X-Cache: MISS
```
**Tiempo de respuesta:** ~43 ms. `node-cache` descartó internamente la entrada vencida durante su ciclo de limpieza periódica (`checkperiod: 60`). El middleware no encontró la clave y procedió como en la Situación 1, refrescando la caché con los datos actuales.

---

### Situación adicional — Modificación de datos antes del vencimiento

Durante la vigencia de la caché, se ejecutó `PUT /productos/1` actualizando el precio de un artículo.

**Sin invalidación activa:** Los clientes habrían recibido el precio anterior durante los segundos restantes del TTL (inconsistencia temporal). Con la invalidación activa implementada:

**Consola del servidor al ejecutar el PUT:**
```
[CACHE INVALIDADA] "/productos"
PUT /productos/1 - 200 (38ms)
```

**Consola al ejecutar el siguiente GET:**
```
[CACHE MISS] /productos — consultando BD...
GET /productos - 200 (44ms)
```

La caché fue purgada inmediatamente al confirmar la escritura, garantizando que el precio actualizado estuviera disponible en la siguiente consulta sin esperar el vencimiento natural.

---

## 5. Conclusiones

La implementación de una caché en memoria simple con TTL de 30 segundos sobre el endpoint `GET /productos` demostró una reducción de latencia medible del orden del 98 % en lecturas repetidas (de ~47 ms a ~1 ms), sin modificar los servicios ni la base de datos, y sin incorporar infraestructura adicional.

La elección de `node-cache` simplificó la implementación respecto a una solución manual con `Map`, delegando a la librería la gestión del TTL y la limpieza periódica de entradas vencidas.

La principal limitación identificada es la **inconsistencia temporal**: si se produce una escritura mientras la caché es válida y no se aplica invalidación activa, los clientes recibirán datos desactualizados. Esta limitación fue mitigada mediante la llamada a `invalidarCache` en todos los controladores de escritura del recurso.

Para un sistema de producción con múltiples réplicas o requisitos estrictos de consistencia, esta solución debería complementarse con una caché distribuida (Redis, Memcached), aunque ello excede el alcance de la presente actividad.

---

## 6. Fuentes Consultadas

- **npm — node-cache.** Paquete oficial. https://www.npmjs.com/package/node-cache
- **MDN Web Docs — HTTP Caching.** Mozilla Developer Network. https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching
- **Express.js — Writing middleware.** Documentación oficial de Express 5. https://expressjs.com/en/guide/writing-middleware.html
- **Patterson, D. A. & Hennessy, J. L. (2017).** *Computer Organization and Design: The Hardware/Software Interface* (5.ª ed.). Morgan Kaufmann. *(Fundamentos de memoria caché, Cap. 5)*
- **Fowler, M. (2002).** *Patterns of Enterprise Application Architecture.* Addison-Wesley. *(Cache pattern)*
