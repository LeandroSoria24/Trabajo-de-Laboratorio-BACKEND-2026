# Flujo de Ejecución y Manejo de Errores en Express

> **Caso de ejemplo:** El cliente realiza una petición a una ruta que no existe:  
> `GET http://localhost:3000/pokemon`

---

## Diagrama de Flujo

```mermaid
flowchart TD
    A["1. Cliente envía GET /pokemon"] --> B["2. app.use(logger)"]
    B -->|"next() (vacío)"| C["3. Rutas (/artesanos, /productos, /docs)"]
    C -->|"No hay coincidencias"| D["4. app.use(rutaNoEncontrada)"]
    D -->|"next(error) (con argumento)"| E["5. app.use(manejoErrores)"]
    E -->|"res.status(404).json(...)"| F["6. Cliente recibe respuesta"]
    E -.->|"Dispara evento finish"| G["7. logger imprime en consola"]

    style A fill:#38bdf8,stroke:#0284c7,color:#000
    style B fill:#fde047,stroke:#eab308,color:#000
    style D fill:#f97316,stroke:#ea580c,color:#fff
    style E fill:#ef4444,stroke:#dc2626,color:#fff
    style G fill:#4ade80,stroke:#16a34a,color:#000
```

---

## Paso a Paso del Ciclo de Vida

### 1. Entrada y Registro: `app.use(logger)`
* Inicia el cronómetro: `const start = Date.now();`
* Se queda escuchando el evento de cierre de la respuesta: `res.on('finish', ...)`.
* Llama a **`next()`** *(sin argumentos)* para dar paso a la siguiente etapa.

### 2. Evaluación de Rutas
* Express compara la URL solicitada (`/pokemon`) con las rutas registradas:
  * `/` (No coincide)
  * `/info` (No coincide)
  * `/artesanos` (No coincide)
  * `/productos` (No coincide)
  * `/docs` (No coincide)
* Al no coincidir con ninguna, la petición continúa descendiendo por la cadena de middlewares.

### 3. Captura de Ruta Inexistente: `app.use(rutaNoEncontrada)`
* Al estar ubicada después de todas las rutas válidas, esta función captura cualquier petición no atendida.
* Ejecuta:
  ```javascript
  next(crearError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
  ```

> [!IMPORTANT]
> **La regla de oro de `next` en Express:**
> * `next()` *(vacío)* $\rightarrow$ Continúa al siguiente middleware normal.
> * `next(error)` *(con argumento)* $\rightarrow$ Express activa el **modo de error**, omite todos los middlewares normales restantes y salta directamente al siguiente **middleware de 4 parámetros** `(err, req, res, next)`.

### 4. Manejador Centralizado: `app.use(manejoErrores)`
* Express detecta la firma especial de 4 parámetros: `(err, req, res, next)`.
* Recibe el objeto generado por `crearError(...)` en el parámetro `err`.
* Extrae el código de estado (`err.status = 404`) y el mensaje (`err.message`).
* Envía la respuesta al cliente cerrando la conexión HTTP:
  ```javascript
  res.status(404).json({ error: "Ruta no encontrada: GET /pokemon" });
  ```

### 5. Finalización y Registro del Log: `res.on('finish')`
* La llamada a `res.json()` completa el envío y emite el evento `'finish'`.
* El listener configurado por el **`logger`** en el paso 1 se activa.
* Calcula la duración total y muestra en la terminal:
  ```text
  GET /pokemon - 404 (2ms)
  ```

---

## Resumen de Responsabilidades

| Middleware / Utilidad | Tipo | Responsabilidad Principal |
|---|---|---|
| **`logger`** | Informativo | Cronometra y registra en consola el resultado final de cada petición. |
| **`crearError`** | Utilidad (`utils`) | Estandariza la creación de objetos `Error` adjuntando un `status` HTTP. |
| **`rutaNoEncontrada`** | Middleware 404 | Intercepta peticiones huérfanas y delega un error 404 mediante `next(...)`. |
| **`manejoErrores`** | Middleware de Errores | Centraliza la respuesta JSON y oculta errores técnicos internos (500). |

---

## Flujo Completo de un Endpoint CRUD: `POST /productos`

Este flujo muestra la separación de responsabilidades de la **Unidad 3**: el validador (Zod) detiene entradas inválidas en el middleware, el controlador transfiere los datos limpios como **DTO** y el servicio ejecuta la lógica y persistencia con Prisma.

```mermaid
flowchart TD
    CLI["1. Cliente envía POST /productos\n{ nombre, precio, stock, artesanoId }"] --> LOG["2. logger"]
    LOG --> ROUTE["3. producto.routes.js\nrouter.post('/', validarProducto, createProducto)"]
    
    ROUTE --> MW["4. validarProducto.js (Middleware Zod)\nsafeParse(req.body)"]
    
    MW -->|"[Error] Falló validación"| ERR["next(crearError(..., 400))"]
    ERR --> HANDLER["manejoErrores.js\nres.status(400).json(...)"]
    HANDLER --> RES_ERR["Cliente recibe 400 Bad Request"]
    
    MW -->|"[OK] Éxito: req.body = resultado.data"| CTRL["5. producto.controllers.js\nconst crearProductoDto = req.body"]
    
    CTRL --> SERV["6. producto.services.js\ncrearProducto(crearProductoDto)"]
    
    SERV -->|"¿Artesano existe?"| PRISMA["7. prisma.producto.create(...)"]
    SERV -.->|"[Error] No existe artesano"| THROW["throw crearError('Artesano inexistente.', 400)"]
    THROW -.->|"catch(error) en controller"| HANDLER
    
    PRISMA --> BD[("PostgreSQL")]
    BD --> PRISMA
    PRISMA -->|"Retorna registro creado"| SERV
    SERV -->|"Retorna nuevoProducto"| CTRL
    CTRL -->|"res.status(201).json(nuevoProducto)"| RES_OK["Cliente recibe 201 Created"]

    style CLI fill:#38bdf8,stroke:#0284c7,color:#000
    style LOG fill:#fde047,stroke:#eab308,color:#000
    style ROUTE fill:#a78bfa,stroke:#7c3aed,color:#000
    style MW fill:#34d399,stroke:#059669,color:#000
    style CTRL fill:#fb923c,stroke:#ea580c,color:#000
    style SERV fill:#f472b6,stroke:#db2777,color:#000
    style PRISMA fill:#f87171,stroke:#dc2626,color:#fff
    style BD fill:#e2e8f0,stroke:#94a3b8,color:#000
    style HANDLER fill:#ef4444,stroke:#dc2626,color:#fff
```

---

## Flujo Completo de Actualización: `PUT /productos/:id`

Este flujo describe paso a paso el recorrido desde el cliente hasta la persistencia y respuesta:

```mermaid
flowchart TD
    A["1. app.js\napp.use('/productos', productoRoutes)"] --> B["2. producto.routes.js\nrouter.put('/:id', validarId, validarProducto, updateProducto)"]
    B --> C["3. validarId.js\nValida que :id sea entero positivo"]
    C --> D["4. validarProducto.js\nswitch(req.method) -> case 'PUT'\nactualizarProductoSchema.safeParse(req.body)"]
    
    D -->|"[Error] !resultado.success"| E["next(crearError(..., 400))"]
    E --> F["manejoErrores.js\nres.status(400).json(...)"]
    
    D -->|"[OK] resultado.success"| G["req.body = resultado.data (DTO)\nnext()"]
    G --> H["5. producto.controllers.js (updateProducto)\nconst id = Number(req.params.id)\nconst actualizarProductoDto = req.body"]
    
    H --> I["6. producto.services.js (actualizarProducto)\nactualizarProducto(id, actualizarProductoDto)"]
    
    I -->|"Paso 6.1"| J{"findUnique producto por id"}
    J -->|"No existe"| K["throw crearError(..., 404)"]
    K -.->|"catch en controller"| F
    
    J -->|"Existe"| L{"¿Se envió artesanoId?"}
    L -->|"Sí y no existe artesano"| M["throw crearError('Artesano inexistente.', 400)"]
    M -.->|"catch en controller"| F
    
    L -->|"Válido"| N["7. prisma.producto.update({\n  where: { id },\n  data: { nombre, descripcion, precio, stock, artesanoId },\n  include: { artesano: true }\n})"]
    
    N --> O[("PostgreSQL")]
    O -->|"Actualiza y retorna el registro actualizado"| N
    N -->|"Retorna productoActualizado"| I
    I -->|"Retorna al controller"| H
    H --> P["8. res.json(productoActualizado)\nCliente recibe 200 OK con el objeto"]

    style A fill:#38bdf8,stroke:#0284c7,color:#000
    style B fill:#a78bfa,stroke:#7c3aed,color:#000
    style C fill:#34d399,stroke:#059669,color:#000
    style D fill:#34d399,stroke:#059669,color:#000
    style H fill:#fb923c,stroke:#ea580c,color:#000
    style I fill:#f472b6,stroke:#db2777,color:#000
    style N fill:#f87171,stroke:#dc2626,color:#fff
    style O fill:#e2e8f0,stroke:#94a3b8,color:#000
    style F fill:#ef4444,stroke:#dc2626,color:#fff
    style P fill:#4ade80,stroke:#16a34a,color:#000
```

### Detalle de las 8 etapas del flujo:
1. **Entrada al servidor (`app.js`):** La petición HTTP `PUT /productos/:id` ingresa y es derivada al enrutador `productoRoutes`.
2. **Definición de ruta y tubería (`producto.routes.js`):** Se encadenan los middlewares `validarId`, `validarProducto` y el controlador `updateProducto`.
3. **Validación de identificador (`validarId.js`):** Comprueba que `:id` sea convertible a entero positivo.
4. **Validación de datos con Zod (`validarProducto.js`):** Mediante un `switch`, selecciona `actualizarProductoSchema` y ejecuta `safeParse(req.body)`. Si falla, corta la ejecución con error 400. Si aprueba, almacena los datos limpios en `req.body` y continúa con `next()`.
5. **Controlador (`updateProducto`):** Extrae los datos preparados (`id` numérico y `actualizarProductoDto`) y convoca a la capa de servicios mediante `await actualizarProducto(...)`.
6. **Lógica de negocio (`producto.services.js`):**
   - Comprueba la existencia previa del producto mediante `findUnique` (si no existe, lanza un error 404 con `throw crearError(...)`).
   - Comprueba la validez de `artesanoId` si fue provisto (si no existe el artesano, lanza un error 400).
7. **Persistencia con Prisma ORM (`prisma.producto.update`):** Envía el objeto de actualización con los campos correspondientes e incluye la relación `artesano: true`. PostgreSQL ejecuta la actualización y devuelve en una sola operación el registro modificado junto con los datos del artesano.
8. **Respuesta al cliente:** El controlador recibe el objeto del producto actualizado y responde con `res.json(productoActualizado)` (código HTTP 200).

---

## Flujo Completo de Eliminación Física y Lógica: `DELETE` y `PATCH`

### 1. Eliminación Física Definitiva (`DELETE /productos/:id`)

```mermaid
flowchart TD
    A["1. Cliente: DELETE /productos/:id"] --> B["2. producto.routes.js\nrouter.delete('/:id', validarId, deleteProducto)"]
    B --> C["3. validarId.js (Zod)\nFiltrarProductoPorIDSchema.safeParse(req.params)"]
    C -->|"[Error] ID inválido"| ERR["next(crearError(..., 400)) -> manejoErrores.js"]
    C -->|"[OK] req.params.id = resultado.data.id"| D["4. producto.controllers.js (deleteProducto)\nconst id = Number(req.params.id)\nawait eliminarProducto(id)"]
    D --> E["5. producto.services.js (eliminarProducto)"]
    E --> F{"findUnique(id)"}
    F -->|"No existe"| G["throw crearError('No existe...', 404)"]
    G -.->|"catch en controller"| ERR
    F -->|"Existe"| H["prisma.producto.delete({ where: { id } })"]
    H --> I[("PostgreSQL")]
    I --> H
    H --> D
    D --> J["6. res.status(200).send('Producto eliminado exitosamente')"]

    style A fill:#38bdf8,stroke:#0284c7,color:#000
    style B fill:#a78bfa,stroke:#7c3aed,color:#000
    style C fill:#34d399,stroke:#059669,color:#000
    style D fill:#fb923c,stroke:#ea580c,color:#000
    style E fill:#f472b6,stroke:#db2777,color:#000
    style H fill:#f87171,stroke:#dc2626,color:#fff
    style I fill:#e2e8f0,stroke:#94a3b8,color:#000
    style J fill:#4ade80,stroke:#16a34a,color:#000
    style ERR fill:#ef4444,stroke:#dc2626,color:#fff
```

### 2. Eliminación Lógica / Soft Delete (`PATCH /productos/:id`)

```mermaid
flowchart TD
    A["1. Cliente: PATCH /productos/:id"] --> B["2. producto.routes.js\nrouter.patch('/:id', validarId, deleteProductoLogico)"]
    B --> C["3. validarId.js (Zod)\nValida ID entero positivo"]
    C --> D["4. producto.controllers.js (deleteProductoLogico)\nawait deleteLogico(id)"]
    D --> E["5. producto.services.js (deleteLogico)\nfindUnique(id)"]
    E -->|"[Error] No existe"| F["throw crearError(..., 404) -> manejoErrores.js"]
    E -->|"[OK] Existe"| G["prisma.producto.update({\n  where: { id },\n  data: { eliminado: true }\n})"]
    G --> H[("PostgreSQL")]
    H --> G
    G --> D
    D --> I["6. res.status(200).json({ message: 'Producto eliminado logicamente' })"]

    style A fill:#38bdf8,stroke:#0284c7,color:#000
    style B fill:#a78bfa,stroke:#7c3aed,color:#000
    style C fill:#34d399,stroke:#059669,color:#000
    style D fill:#fb923c,stroke:#ea580c,color:#000
    style E fill:#f472b6,stroke:#db2777,color:#000
    style G fill:#f87171,stroke:#dc2626,color:#fff
    style H fill:#e2e8f0,stroke:#94a3b8,color:#000
    style I fill:#4ade80,stroke:#16a34a,color:#000
    style F fill:#ef4444,stroke:#dc2626,color:#fff
```


