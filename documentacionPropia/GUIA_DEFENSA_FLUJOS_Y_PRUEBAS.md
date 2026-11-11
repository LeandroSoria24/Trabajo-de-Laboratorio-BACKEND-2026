# Guia Completa de Defensa Final: Flujos de Negocio, REST Client en VS Code, Postman y Swagger

**Proyecto:** API Poncho Digital - Fiesta Nacional e Internacional del Poncho  
**Autores:** Leandro Soria Rosales (M.U. N° 00292) y Santiago Ortiz (M.U. N° 00451)

---

## 1. Como hacer las peticiones directamente desde el IDE (VS Code) como tu companero

En la captura de pantalla se observa que tu companero utiliza archivos con extension **`.http`** dentro de la carpeta **`api-test/`** usando la extension **REST Client** de Visual Studio Code.

### Paso 1: Instalar la extension en VS Code
1. Abre Visual Studio Code.
2. Presiona `Ctrl + Shift + X` para abrir el panel de **Extensiones**.
3. Busca **`REST Client`** (el autor es **Huachao Mao**, identificador `humao.rest-client`).
4. Haz clic en **Install** (Instalar).

### Paso 2: Como funciona y por que es tan comoda para la defensa
* Al abrir cualquier archivo `.http` de la carpeta `api-test/`, veras que encima de cada bloque separado por `###` aparece automaticamente un boton pequeno que dice **`Send Request`**.
* Al hacer clic en **`Send Request`**, VS Code ejecuta la peticion HTTP contra tu servidor local (`http://localhost:3000`) y abre automaticamente un panel a la derecha (`Response`) mostrando el codigo de estado (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`), los encabezados (como `X-Cache: MISS` o `X-Cache: HIT`) y el JSON de respuesta.
* **Captura automatica de Tokens e IDs (sin copiar ni pegar):** En los archivos `.http` que preparamos en `api-test/`, las peticiones de login y creacion tienen la directiva `# @name loginArtesano` o `# @name loginAdmin`. De esa forma, las peticiones siguientes toman automaticamente el token con `{{loginArtesano.response.body.token}}` y los IDs creados con `{{crearSolicitud.response.body.solicitud.id}}`.

### Archivos `.http` listos en la carpeta `api-test/` (163 peticiones en total)
Se crearon 5 archivos organizados para cubrir el flujo principal y cualquier flujo adicional que pida el docente:
1. `api-test/01-flujo-critico-principal-defensa.http`: **Flujo Critico Principal de punta a punta** (45 peticiones encadenadas con todos los casos de exito y error 400, 401, 403, 404 y 409).
2. `api-test/02-flujo-usuarios-roles-sesiones.http`: **Flujo de Usuarios, las 3 Reglas 409 de Roles, Ultimo Admin Activo y Revocacion JWT (Blacklist)** (32 peticiones).
3. `api-test/03-flujo-artesanos-y-solicitudes.http`: **Flujo de Autogestion de Artesano, Cancelacion, Aislamiento, Rechazo de Solicitudes y ABM Administrativo** (29 peticiones).
4. `api-test/04-flujo-infraestructura-stands-pabellones-sectores.http`: **Flujo de Infraestructura Ferial (Pabellones, Sectores, Localidades, Mantenimiento, Artesano Inactivo y Regla 1:1 de Stands)** (41 peticiones).
5. `api-test/05-flujo-catalogo-productos-y-cache.http`: **Flujo de Catalogo de Productos, Vista Diferenciada (Visitante vs Autenticado) y Cache de 30s (`X-Cache: MISS/HIT`)** (16 peticiones).

---

## 2. Checklist Previo a las 18:00 hs (Preparacion del Entorno)

El profesor indico que a las 18:00 hs puntuales todos los grupos deben tener **la API corriendo, la base migrada y los datos de prueba cargados**. Ejecuta estos comandos en orden antes de las 18:00 hs:

```powershell
# 1. Verificar o aplicar migraciones pendientes en la base de datos
npx prisma migrate deploy

# 2. Cargar todos los datos de prueba iniciales (limpia tablas preservando Localidades y crea datos realistas)
npm run seed

# 3. Regenerar el archivo swagger-output.json por si se revisa en /docs
npm run docs

# 4. Levantar el servidor en modo desarrollo (queda escuchando en http://localhost:3000)
npm run dev
```

### Credenciales Cargadas por `npm run seed` (Listas para usar)

| Rol | Nombre | Email | Password | Estado Inicial en el Seeder |
| :--- | :--- | :--- | :--- | :--- |
| **ADMINISTRADOR** | Administrador Poncho | `admin@ponchodigital.gob.ar` | `Admin1234#` | Cuenta activa (`usuario.activo: true`) |
| **ADMINISTRADOR** | Santiago Admin | `santiago.admin@ponchodigital.gob.ar` | `Admin1234#` | Cuenta activa (`usuario.activo: true`) |
| **ARTESANO** | Lorenza Gutierrez | `lorenza@artesanoscatamarca.com` | `Artesano1234#` | Cuenta activa, Perfil comercial activo (`artesano.activo: true`), Rubro Textil, Solicitud `APROBADA`, ocupa Stand `A01` |
| **ARTESANO** | Juan Carlos Morales | `juan.ceramica@artesanoscatamarca.com` | `Artesano1234#` | Cuenta activa, Perfil comercial activo (`artesano.activo: true`), Rubro Ceramica, Solicitud `APROBADA`, ocupa Stand `B01` |
| **ARTESANO** | Carmen Albarracin | `carmen.madera@artesanoscatamarca.com` | `Artesano1234#` | Cuenta activa, Perfil comercial activo (`artesano.activo: true`), Rubro Madera, ocupa Stand `C01` |
| **ARTESANO** | Marcos Carrizo | `marcos.plata@artesanoscatamarca.com` | `Artesano1234#` | Cuenta activa (`usuario.activo: true`), Perfil comercial pendiente de aprobacion (`artesano.activo: false`), Rubro Metales, Solicitud `PENDIENTE` |
| **ARTESANO** | Elena Nieva | `elena.cuero@artesanoscatamarca.com` | `Artesano1234#` | Cuenta activa, Perfil comercial activo (`artesano.activo: true`), Rubro Cuero, Solicitud `EN_REVISION`, sin stand ocupado |

### Stands Cargados por `npm run seed`

| Codigo | Numero | Estado Inicial | Pabellon | Sector | Artesano Asignado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `A01` | 1 | `OCUPADO` | Pabellon Artesanal | Sector Textil | Lorenza Gutierrez |
| `A02` | 2 | `DISPONIBLE` | Pabellon Artesanal | Sector Textil | Ninguno (`null`) |
| `B01` | 3 | `OCUPADO` | Pabellon Artesanal | Sector Ceramica | Juan Carlos Morales |
| `B02` | 4 | `DISPONIBLE` | Pabellon Artesanal | Sector Ceramica | Ninguno (`null`) |
| `C01` | 5 | `OCUPADO` | Pabellon Central | Sector Madera | Carmen Albarracin |
| `C02` | 6 | `DISPONIBLE` | Pabellon Central | Sector Madera | Ninguno (`null`) |
| `D01` | 7 | `DISPONIBLE` | Pabellon Central | Sector Metales | Ninguno (`null`) |
| `D02` | 8 | `MANTENIMIENTO` | Pabellon Central | Sector Cuero | Ninguno (`null`) |

---

## 3. Como Importar la Coleccion Completa en Postman (163 peticiones en 5 carpetas)

En la raiz del proyecto se encuentra el archivo **`Poncho_Digital_Postman_Collection.json`** (y una copia en `api-test/Poncho_Digital_Postman_Collection.json`).

1. Abre **Postman**.
2. Haz clic en el boton **Import** (arriba a la izquierda).
3. Arrastra el archivo `Poncho_Digital_Postman_Collection.json`.
4. La coleccion contiene las **5 carpetas completas** (163 peticiones en total, espejo exacto de los 5 archivos `.http`), incluye **Variables de Coleccion** y **Scripts Automaticos (`Tests`)** en cada peticion:
   * Cada peticion verifica automaticamente el codigo HTTP esperado en la pestana **Test Results** (`PASS`).
   * Cuando ejecutas cualquier Login o creacion de entidad, los tokens e IDs se guardan automaticamente en las variables de coleccion (`pm.collectionVariables.set`) para los pasos siguientes.

---

## 4. Flujo Critico Principal para Presentar en la Defensa (Paso a Paso con Casos de Error)

> **Archivo en VS Code:** `api-test/01-flujo-critico-principal-defensa.http`  
> **Carpeta en Postman:** `01 - FLUJO CRITICO PRINCIPAL (Defensa Paso a Paso)`

Este flujo demuestra el ciclo de vida completo y mas critico del negocio de **Poncho Digital**: desde que un artesano se registra en la plataforma hasta que es evaluado por la comision organizadora, recibe un stand fisico en el predio ferial, publica sus productos en el catalogo (demostrando cache y vista diferenciada) y cierra su sesion revocando su credencial JWT.

---

### Etapa 1: Registro Publico de Usuario (`POST /usuarios/registro`)

**Regla de negocio:** Todo usuario registrado por la via publica recibe automaticamente el rol `ARTESANO` y su cuenta nace con `activo: true`. El esquema Zod utiliza `.strict()`, rechazando cualquier intento de inyectar roles u otros atributos en el body.

#### 1.1 Caso de Error `400 Bad Request` (Validacion de formato y longitud en Zod)
* **Metodo y URL:** `POST http://localhost:3000/usuarios/registro`
* **Body (JSON):**
```json
{
  "nombre": "S",
  "email": "correo-invalido",
  "password": "123"
}
```
* **Resultado esperado:** `400 Bad Request` detallando que el nombre requiere minimo 2 caracteres, el email es invalido y la contrasena requiere minimo 8 caracteres.

#### 1.2 Caso de Error `400 Bad Request` (Intento de inyeccion de campos con `.strict()`)
* **Metodo y URL:** `POST http://localhost:3000/usuarios/registro`
* **Body (JSON):**
```json
{
  "nombre": "Sebastian Tejidos",
  "email": "seba.artesanias@gmail.com",
  "password": "PasswordSeguro2026.",
  "rol": "ADMINISTRADOR"
}
```
* **Resultado esperado:** `400 Bad Request` porque Zod `.strict()` bloquea propiedades no declaradas en el esquema.

#### 1.3 Caso de Exito `201 Created` (Registro exitoso)
* **Metodo y URL:** `POST http://localhost:3000/usuarios/registro`
* **Body (JSON):**
```json
{
  "nombre": "Sebastian Tejidos",
  "email": "seba.artesanias@gmail.com",
  "password": "PasswordSeguro2026."
}
```
* **Resultado esperado:** `201 Created` devolviendo el usuario con `roles: ["ARTESANO"]` y sin exponer `passwordHash`.

#### 1.4 Caso de Error `409 Conflict` (Email duplicado)
* **Metodo y URL:** `POST http://localhost:3000/usuarios/registro`
* **Body (JSON):** Enviar exactamente el mismo JSON anterior.
* **Resultado esperado:** `409 Conflict` (`"Ya existe usuario con ese email."`).

---

### Etapa 2: Autenticacion JWT y Verificacion de Identidad (`POST /usuarios/login` y `GET /usuarios/me`)

**Regla de negocio:** El login verifica el hash con `bcrypt`, comprueba que la cuenta este activa (`activo: true`) y firma un token JWT con algoritmo `HS256`, expiracion de 15 minutos (`15m`) y un identificador unico de token (`jti`) para permitir su revocacion.

#### 2.1 Caso de Error `401 Unauthorized` (Contrasena incorrecta o email inexistente)
* **Metodo y URL:** `POST http://localhost:3000/usuarios/login`
* **Body (JSON):**
```json
{
  "email": "seba.artesanias@gmail.com",
  "password": "PasswordIncorrecta!"
}
```
* **Resultado esperado:** `401 Unauthorized` (`"Las credenciales son inválidas."`). Por seguridad no revela cual de los dos campos fallo.

#### 2.2 Caso de Exito `200 OK` (Login del artesano)
* **Metodo y URL:** `POST http://localhost:3000/usuarios/login`
* **Body (JSON):**
```json
{
  "email": "seba.artesanias@gmail.com",
  "password": "PasswordSeguro2026."
}
```
* **Resultado esperado:** `200 OK` devolviendo `token` y datos del `usuario`.

#### 2.3 Casos de Error `401 Unauthorized` y `400 Bad Request` en `/usuarios/me`
* `GET http://localhost:3000/usuarios/me` sin header `Authorization` -> **`401 Unauthorized`** (`"Se requiere un token de acceso."`).
* `GET http://localhost:3000/usuarios/me` con header `Authorization: Token abc` -> **`400 Bad Request`** (`"Usar Authorization: Bearer <token>."`).

#### 2.4 Caso de Exito `200 OK` (`GET /usuarios/me`)
* **Metodo y URL:** `GET http://localhost:3000/usuarios/me`
* **Header:** `Authorization: Bearer <tokenArtesano>`
* **Resultado esperado:** `200 OK` devolviendo la cuenta autenticada con `artesano: null` (aun no completo su ficha comercial).

---

### Etapa 3: Completar Perfil Comercial de Artesano (`POST /artesanos/me`)

**Regla de negocio:** Una cuenta con rol `ARTESANO` no puede postularse a la feria hasta que completa su ficha comercial (`POST /artesanos/me`). Al crear su perfil comercial, este nace con **`activo: false`** (no visible en el catalogo publico de visitantes hasta que un Administrador apruebe su postulacion).

#### 3.1 Caso de Error `404 Not Found` (Intentar postularse sin perfil comercial)
* **Metodo y URL:** `POST http://localhost:3000/solicitudes`
* **Header:** `Authorization: Bearer <tokenArtesano>`
* **Body (JSON):**
```json
{
  "observaciones": "Quiero postularme sin tener perfil de artesano cargado"
}
```
* **Resultado esperado:** `404 Not Found` (`"Debe completar su perfil de artesano antes de postularse a la feria."`).

#### 3.2 Caso de Error `409 Conflict` (DNI duplicado de otro artesano)
* **Metodo y URL:** `POST http://localhost:3000/artesanos/me`
* **Header:** `Authorization: Bearer <tokenArtesano>`
* **Body (JSON):**
```json
{
  "nombre": "Sebastian",
  "apellido": "Quiroga",
  "dni": "18234567",
  "telefono": "+54 3834 556677",
  "localidadId": 1,
  "rubro": "Textil",
  "nombreEmprendimiento": "Telares del Valle"
}
```
* **Resultado esperado:** `409 Conflict` (`"Ya existe un artesano registrado con el DNI 18234567"`).

#### 3.3 Caso de Exito `201 Created` (Completar perfil de artesano)
> Nota: En REST Client y Postman se consulta primero `GET /localidades` para tomar automaticamente el primer `localidadId` valido de la base de datos.
* **Metodo y URL:** `POST http://localhost:3000/artesanos/me`
* **Header:** `Authorization: Bearer <tokenArtesano>`
* **Body (JSON):**
```json
{
  "nombre": "Sebastian",
  "apellido": "Quiroga",
  "dni": "39888777",
  "telefono": "+54 3834 556677",
  "localidadId": 1,
  "rubro": "Textil",
  "nombreEmprendimiento": "Telares del Valle",
  "descripcionTrayectoria": "Artesano textil con 12 anos de experiencia en lana de llama y oveja."
}
```
* **Resultado esperado:** `201 Created` devolviendo el perfil con `activo: false`.

#### 3.4 Caso de Error `409 Conflict` (Intentar crear un segundo perfil para el mismo usuario)
* **Metodo y URL:** `POST http://localhost:3000/artesanos/me` (repetir envio)
* **Resultado esperado:** `409 Conflict` (`"El usuario ya tiene un perfil de artesano registrado."`).

---

### Etapa 4: Solicitud de Postulacion Ferial (`POST /solicitudes` y `GET /solicitudes/me`)

**Regla de negocio:** Un artesano con perfil comercial puede presentar su postulacion (`POST /solicitudes`), que nace en estado `PENDIENTE`. No se permite tener mas de una solicitud activa (`PENDIENTE`, `EN_REVISION` o `APROBADA`) al mismo tiempo.

#### 4.1 Caso de Exito `201 Created` (Presentar postulacion)
* **Metodo y URL:** `POST http://localhost:3000/solicitudes`
* **Header:** `Authorization: Bearer <tokenArtesano>`
* **Body (JSON):**
```json
{
  "observaciones": "Solicito stand en sector textil para exhibicion de ponchos y mantas tradicionales."
}
```
* **Resultado esperado:** `201 Created` con `estado: "PENDIENTE"`.

#### 4.2 Caso de Error `409 Conflict` (Postulacion duplicada en curso)
* **Metodo y URL:** `POST http://localhost:3000/solicitudes`
* **Header:** `Authorization: Bearer <tokenArtesano>`
* **Body (JSON):**
```json
{
  "observaciones": "Intento duplicado de postulacion."
}
```
* **Resultado esperado:** `409 Conflict` (`"Ya posee una solicitud de postulación en estado PENDIENTE."`).

#### 4.3 Caso de Error `403 Forbidden` (Artesano intenta acceder a rutas exclusivas de Administrador)
* `GET http://localhost:3000/solicitudes` con `Bearer <tokenArtesano>` -> **`403 Forbidden`** (`"No tiene permiso para esta operación."`).
* `PATCH http://localhost:3000/solicitudes/<solicitudId>/evaluar` con `Bearer <tokenArtesano>` -> **`403 Forbidden`**.

---

### Etapa 5: Auditoria y Evaluacion Transaccional por el Administrador (`PATCH /solicitudes/:id/evaluar`)

**Regla de negocio:** El Administrador inicia sesion, audita las postulaciones y emite un dictamen (`APROBADA` o `RECHAZADA`). Al dictaminar **`APROBADA`**, el servicio ejecuta una **transaccion (`prisma.$transaction`)** que actualiza el estado de la solicitud, registra el `evaluadorId` del administrador y **activa automaticamente el perfil del artesano (`activo: true`)**.

#### 5.1 Caso de Exito `200 OK` (Login Administrador)
* **Metodo y URL:** `POST http://localhost:3000/usuarios/login`
* **Body (JSON):**
```json
{
  "email": "admin@ponchodigital.gob.ar",
  "password": "Admin1234#"
}
```

#### 5.2 Caso de Error `409 Conflict` (Intentar asignar stand antes de aprobar la solicitud)
* **Metodo y URL:** `PATCH http://localhost:3000/solicitudes/<solicitudId>/asignar-stand`
* **Header:** `Authorization: Bearer <tokenAdmin>`
* **Body (JSON):** `{}`
* **Resultado esperado:** `409 Conflict` (`"La solicitud debe estar en estado APROBADA para asignarle un stand."`).

#### 5.3 Caso de Error `400 Bad Request` (Estado de evaluacion invalido)
* **Metodo y URL:** `PATCH http://localhost:3000/solicitudes/<solicitudId>/evaluar`
* **Header:** `Authorization: Bearer <tokenAdmin>`
* **Body (JSON):**
```json
{
  "estado": "PENDIENTE",
  "observaciones": "Estado no permitido al evaluar"
}
```
* **Resultado esperado:** `400 Bad Request` (Zod solo admite `"APROBADA"` o `"RECHAZADA"`).

#### 5.4 Caso de Exito `200 OK` (Aprobar solicitud y activar artesano en transaccion)
* **Metodo y URL:** `PATCH http://localhost:3000/solicitudes/<solicitudId>/evaluar`
* **Header:** `Authorization: Bearer <tokenAdmin>`
* **Body (JSON):**
```json
{
  "estado": "APROBADA",
  "observaciones": "Piezas textiles verificadas por la comision evaluadora. Se aprueba participacion."
}
```
* **Resultado esperado:** `200 OK`. Si a continuacion consultamos `GET /artesanos/<artesanoId>`, veremos que `activo` paso automaticamente a `true`.

---

### Etapa 6: Asignacion Transaccional de Stand Ferial (`PATCH /solicitudes/:id/asignar-stand`)

**Regla de negocio:** Una vez que la solicitud esta `APROBADA`, el Administrador le asigna un stand disponible (especificando `standId` o dejando que el sistema elija el primer stand `DISPONIBLE`). Dentro de una transaccion (`prisma.$transaction`), verifica que el stand exista y este `DISPONIBLE`, libera cualquier stand previo del artesano (garantizando la relacion 1:1), marca el nuevo stand como `OCUPADO` y lo vincula tanto al artesano como a la solicitud.

#### 6.1 Caso de Error `409 Conflict` (Intentar asignar un stand que ya esta `OCUPADO`)
* **Metodo y URL:** `PATCH http://localhost:3000/solicitudes/<solicitudId>/asignar-stand`
* **Header:** `Authorization: Bearer <tokenAdmin>`
* **Body (JSON):**
```json
{
  "standId": 1
}
```
*(Donde el stand 1 es `A01`, ocupado por Lorenza en el seeder).*
* **Resultado esperado:** `409 Conflict` (`"El stand A01 no se encuentra disponible."`).

#### 6.2 Caso de Exito `200 OK` (Asignar stand disponible)
* **Metodo y URL:** `PATCH http://localhost:3000/solicitudes/<solicitudId>/asignar-stand`
* **Header:** `Authorization: Bearer <tokenAdmin>`
* **Body (JSON):**
```json
{
  "standId": 2
}
```
*(O enviar `{}` para que seleccione automaticamente el primer stand `DISPONIBLE`).*
* **Resultado esperado:** `200 OK` confirmando la asignacion del stand `A02`, que pasa a estado `OCUPADO`.

---

### Etapa 7: Publicacion de Productos, Vista Diferenciada y Cache (`POST`, `PUT` y `GET /productos`)

**Regla de negocio:**
1. Las consultas `GET /productos` y `GET /productos/:id` utilizan `autenticarUsuarioOpcional` y `cacheMiddleware(30)`:
   * Si consulta un **visitante sin token**, la API proyecta solo los datos basicos (`id`, `nombre`, `precio`, `descripcion`, `stock`) y oculta los productos dados de baja logica.
   * Si consulta un usuario autenticado con rol **`ARTESANO` o `ADMINISTRADOR`**, la API devuelve la entidad completa incluyendo `activo`, `artesanoId`, timestamps y el objeto relacional `artesano`.
2. La cache en memoria (`node-cache`) almacena la respuesta por 30 segundos usando `req.originalUrl` como clave (devolviendo el header `X-Cache: MISS` al consultar la BD y `X-Cache: HIT` al responder desde memoria RAM).
3. Todo `POST`, `PUT` o `DELETE` en `/productos` ejecuta `invalidarCache('/productos')` para evitar datos obsoletos (stale data).

#### 7.1 Caso de Error `400 Bad Request` (Precio negativo)
* **Metodo y URL:** `POST http://localhost:3000/productos`
* **Header:** `Authorization: Bearer <tokenArtesano>`
* **Body (JSON):**
```json
{
  "nombre": "Poncho de Llama Natural",
  "precio": -5000,
  "stock": 5,
  "artesanoId": 1
}
```
* **Resultado esperado:** `400 Bad Request` (`"El precio debe ser mayor a 0"`).

#### 7.2 Caso de Exito `201 Created` (Crear producto)
* **Metodo y URL:** `POST http://localhost:3000/productos`
* **Header:** `Authorization: Bearer <tokenArtesano>`
* **Body (JSON):**
```json
{
  "nombre": "Poncho de Llama Natural",
  "descripcion": "Poncho tejido en telar criollo sin tenir, guarda pampa tradicional.",
  "precio": 95000,
  "stock": 4,
  "artesanoId": 6
}
```
* **Resultado esperado:** `201 Created`.

#### 7.3 Demostracion de Cache (`X-Cache: MISS` vs `X-Cache: HIT`), Invalidacion con `PUT` y Vista Diferenciada (`200 OK`)
1. **1ra Consulta Publica (`GET /productos/<productoId>` sin token):** Devuelve `X-Cache: MISS` y solo los 5 campos basicos `{ id, nombre, precio, descripcion, stock }`.
2. **2da Consulta Publica inmediata (`GET /productos/<productoId>` sin token):** Devuelve `X-Cache: HIT` (responde desde memoria RAM sin tocar PostgreSQL).
3. **Actualizacion del Producto (`PUT /productos/<productoId>` con `Authorization: Bearer <tokenArtesano>`):** Actualiza precio/stock y ejecuta `invalidarCache('/productos')`.
4. **Consulta Autenticada (`GET /productos/<productoId>` con `Authorization: Bearer <tokenArtesano>`):** Como el `PUT` invalido la cache, devuelve `X-Cache: MISS` y proyecta la **entidad completa** incluyendo `activo`, `artesanoId`, `createdAt`, `updatedAt` y el objeto `artesano`.

---

### Etapa 8: Cierre de Sesion y Revocacion en Lista Negra (`POST /usuarios/logout`)

**Regla de negocio:** Al cerrar sesion, el servidor extrae el `jti` del token JWT, calcula su hash SHA-256 y lo almacena en la tabla `tokens_revocados` junto con su fecha de expiracion (`exp`). Cualquier intento posterior de usar ese mismo token es rechazado con `401 Unauthorized`.

#### 8.1 Caso de Exito `204 No Content` (Logout)
* **Metodo y URL:** `POST http://localhost:3000/usuarios/logout`
* **Header:** `Authorization: Bearer <tokenArtesano>`
* **Resultado esperado:** `204 No Content`.

#### 8.2 Caso de Error `401 Unauthorized` (Reutilizar token revocado)
* **Metodo y URL:** `GET http://localhost:3000/usuarios/me`
* **Header:** `Authorization: Bearer <tokenArtesano>`
* **Resultado esperado:** `401 Unauthorized` (`"Token inválido, vencido o revocado."`).

---

## 5. Flujos Alternativos Criticos (Por si el profesor pide mostrar otro flujo)

Si durante la defensa el docente solicita ver otro flujo de negocio, tienen listos los siguientes 4 flujos completos tanto en `api-test/` como en las carpetas `02` a `05` de Postman:

### Flujo Alternativo A: Administracion de Roles, las 3 Reglas 409 y Ultimo Administrador Activo
* **Archivo:** `api-test/02-flujo-usuarios-roles-sesiones.http` (y Carpeta `02` en Postman)
* **Que demuestra:**
  1. Un `ARTESANO` intenta crear un administrador en `POST /usuarios/registro-administrador` -> **`403 Forbidden`**.
  2. Un `ADMINISTRADOR` crea otro administrador -> **`201 Created`**.
  3. **Regla 1 de Retiro de Rol (`409 Conflict`):** Intentar quitarle el unico rol a un usuario (`DELETE /usuarios/:id/roles/ARTESANO`) -> falla con `409` (`"Debe conservar al menos un rol."`).
  4. Se le asigna el segundo rol (`POST /usuarios/:id/roles` con `{"rol": "ADMINISTRADOR"}`) -> **`200 OK`**.
  5. **Regla 2 de Retiro de Rol e Inhabilitacion (`409 Conflict`):** Al quedar una unica administradora activa en el sistema, intentar quitarle el rol `ADMINISTRADOR` (`DELETE /usuarios/:id/roles/ADMINISTRADOR`) o desactivarla (`PATCH /usuarios/:id/activo` con `false`) -> falla en ambos casos con `409` (`"Debe quedar un administrador activo."`). Luego se reactivan los administradores iniciales.
  6. **Regla 3 de Retiro de Rol (`409 Conflict`):** Intentar quitar el rol `ARTESANO` a un usuario que ya tiene solicitudes de postulacion en la base de datos (Lorenza) -> falla con `409` (`"Tiene postulaciones: no se puede retirar el rol ARTESANO."`).
  7. Desactivar una cuenta (`PATCH /usuarios/:id/activo` con `{"activo": false}`) e intentar hacer login -> falla con **`401 Unauthorized`**.

### Flujo Alternativo B: Cancelacion, Aislamiento entre Artesanos, Rechazo y ABM Administrativo
* **Archivo:** `api-test/03-flujo-artesanos-y-solicitudes.http` (y Carpeta `03` en Postman)
* **Que demuestra:**
  1. Login con Marcos (`marcos.plata@artesanoscatamarca.com`), quien tiene una solicitud en estado `PENDIENTE`.
  2. **Aislamiento de seguridad (`404 Not Found`):** Lorenza intenta cancelar la solicitud de Marcos (`PATCH /solicitudes/:id/cancelar` con el token de Lorenza) -> el sistema verifica `solicitud.artesano.usuarioId !== usuarioId` y devuelve **`404 Not Found`** (`"Solicitud no encontrada."`), protegiendo el recurso ajeno (tal como se verifica en el Test 3 de integracion).
  3. Marcos cancela su propia solicitud (`PATCH /solicitudes/:id/cancelar`) -> **`200 OK`**, pasa a estado `CANCELADA`.
  4. Intentar cancelar por segunda vez la misma solicitud -> **`409 Conflict`** (`"La solicitud ya se encuentra cancelada."`).
  5. Marcos presenta una segunda postulacion (`POST /solicitudes` -> **`201 Created`**), el Administrador la evalua como **`RECHAZADA`** (`PATCH /solicitudes/:id/evaluar` -> **`200 OK`**, manteniendo al artesano con `activo: false`), Marcos intenta cancelar una solicitud ya `RECHAZADA` (**`409 Conflict`**), y finalmente presenta una nueva solicitud corregida (`POST /solicitudes` -> **`201 Created`**).
  6. ABM Administrativo completo de artesanos: alta directa por administrador (`POST /artesanos` -> **`201 Created`** y **`409 Conflict`** por usuario duplicado), edicion (`PUT /artesanos/:id` -> **`200 OK`**), baja logica (`DELETE /artesanos/:id` -> **`200 OK`** y **`400 Bad Request`** si ya estaba inactivo) y reactivacion (`PATCH /artesanos/:id/activo` -> **`200 OK`**).

### Flujo Alternativo C: Infraestructura Ferial, Relacion 1:1 de Stands y Mantenimiento
* **Archivo:** `api-test/04-flujo-infraestructura-stands-pabellones-sectores.http` (y Carpeta `04` en Postman)
* **Que demuestra:**
  1. Consulta de **Localidades** (`GET /localidades`, `GET /localidades/:id`) y CRUD completo de **Pabellones** (`/pabellones`) y **Sectores** (`/sectores`).
  2. **Proteccion de Integridad Referencial (`400 Bad Request`):** Intentar eliminar un Pabellon o Sector que tiene Stands asociados es rechazado indicando cuantos stands posee.
  3. **Reglas de Stands (`/stands`):**
     * Alta y actualizacion de stand (`POST /stands`, `GET /stands/:id`, `PUT /stands/:id`).
     * Prohibido repetir el `codigo` de stand (`400 Bad Request`).
     * Prohibido asignar un artesano a un stand en estado `MANTENIMIENTO` como el Stand `D02` (`400 Bad Request`).
     * Prohibido asignar un artesano inactivo (`activo: false`, como Marcos) a un stand (`400 Bad Request`).
     * **Relacion 1 a 1 estricta:** Prohibido asignar un stand a un artesano que ya ocupa otro stand (`400 Bad Request`).
     * Prohibido eliminar fisicamente (`DELETE /stands/:id`) un stand ocupado o con solicitudes asociadas (`400 Bad Request`). Primero debe liberarse con `PATCH /stands/:id/liberar` (`200 OK`) y luego eliminarse (`204 No Content`).

---

## 6. Guia de Respuestas para las 2 Preguntas del Profesor (Evaluaciones Semanales)

El profesor indico que realizara **como maximo 2 preguntas basadas en los temas evaluados en los avances semanales**. Aqui tienen las respuestas exactas basadas en la implementacion de su proyecto:

### Pregunta 1: Por que separaron `src/app.js` de `src/server.js`?
* **Respuesta:** Para desacoplar la definicion de la aplicacion Express del ciclo de vida de red (puerto TCP y tareas programadas).
* En `src/app.js` se configuran los middlewares (`cors`, `express.json`, `logger`), las rutas, Swagger (`/docs`) y el manejador centralizado de errores (`manejoErrores`), exportando `app` sin ejecutar `app.listen()`.
* En `src/server.js` se importa `app`, se abre el puerto (`app.listen(PORT)`) y se inicia el intervalo de limpieza de tokens revocados (`iniciarLimpiezaRevocaciones()`).
* **Ventaja clave:** Permite que los tests de integracion con `node:test` y `supertest` importen `app` directamente en memoria sin colisiones de puertos ni procesos colgados al terminar las pruebas.

### Pregunta 2: Como funciona la cadena de autenticacion y autorizacion por roles?
* **Respuesta:** Esta dividida en tres middlewares independientes y reutilizables:
  1. **`autenticarUsuario` (`src/middlewares/autenticarUsuario.js`):** Lee el header `Authorization: Bearer <token>`, verifica la firma criptografica `HS256` y la expiracion con `verificarToken()`, y consulta en base de datos si el `jti` del token fue revocado (`tokenEstaRevocado()`). Si falla, responde `401` (o `400` si el header no respeta el esquema `Bearer`).
  2. **`cargarContextoUsuario` (`src/middlewares/autorizacion.js`):** Con el `id` del payload JWT, busca al usuario actualizado en PostgreSQL junto con sus roles y perfil de artesano. Si el usuario no existe devuelve `401`, y si fue desactivado (`activo: false`) devuelve `403 Cuenta inactiva`. Guarda el resultado en `req.contextoUsuario`.
  3. **`autorizarRoles(...rolesPermitidos)` (`src/middlewares/autorizacion.js`):** Compara los roles de `req.contextoUsuario.roles` contra los roles exigidos por la ruta (`"ARTESANO"`, `"ADMINISTRADOR"`). Si no coincide, responde `403 Forbidden` (`"No tiene permiso para esta operación."`).

### Pregunta 3: Como implementaron el Logout si JWT es stateless (sin estado)?
* **Respuesta:** Mediante una **lista negra persistente (Blacklist)** en la tabla `tokens_revocados` de PostgreSQL (`src/services/revocaciones.services.js`).
* Al emitir un token en `generarToken()`, se incluye un identificador unico `jti` (`crypto.randomUUID()`).
* Cuando el usuario llama a `POST /usuarios/logout`, no guardamos el token en crudo sino el **hash SHA-256** de su `jti` (`jtiHash`) junto con su fecha de expiracion (`expiraEn`).
* Ademas, existe una tarea periodica (`src/tareas/limpiezaRevocaciones.js`) con `.unref()` que purga de la base de datos los tokens revocados cuya fecha de expiracion ya vencio, evitando que la tabla crezca indefinidamente.

### Pregunta 4: Donde y por que usaron transacciones (`prisma.$transaction`)?
* **Respuesta:** Usamos transacciones en operaciones criticas que modifican multiples tablas o requieren lecturas y escrituras atomicas:
  1. **Evaluacion de solicitudes (`evaluarSolicitud`):** Cuando el administrador aprueba una solicitud, en una misma transaccion se actualiza `solicitudPostulacion.estado = 'APROBADA'` y se activa al artesano (`artesano.activo = true`). Si una falla, se hace rollback de ambas.
  2. **Asignacion de stand (`asignarStandASolicitud`):** En una sola transaccion verifica que la solicitud este aprobada y el stand disponible, libera cualquier stand previo del artesano, marca el nuevo stand como `OCUPADO` y actualiza el `standId` en la solicitud.
  3. **Gestion de roles y estado activo (`retirarRol` y `cambiarActivo`):** Verifica dentro de una transaccion que el usuario conserve al menos 1 rol y que nunca se elimine o desactive al ultimo `ADMINISTRADOR` activo del sistema.

### Pregunta 5: Como funcionan las pruebas automatizadas (`npm test`)?
* **Respuesta:** Utilizamos el corredor nativo **`node:test`**, aserciones estrictas con **`node:assert/strict`** y **`supertest`** apuntando a una base de datos de pruebas definida en `.env.test`.
* Se dividen en tres suites:
  * `tests/solicitud-schema.test.js`: Pruebas unitarias de esquemas Zod.
  * `tests/solicitudes-acceso.test.js`: Pruebas de control de acceso (`401` sin token y `403` con rol incorrecto).
  * `tests/solicitudes-integracion.test.js`: Pruebas de integracion real contra PostgreSQL usando los hooks `before`, `beforeEach` y `after` para limpiar y reconstruir el escenario de prueba (`crearEscenario` / `limpiarEscenario`), comprobando tanto la respuesta HTTP como el estado persistido en la base de datos con Prisma.
