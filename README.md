# API Biblioteca

API REST desarrollada con Node.js y Express para la gestión de libros y autores.

## Integrantes
- Leandro Soria Rosales, MUN° 00292 
- Santiago Ortiz, MUN° 00451

## Requisitos
- **Node.js**: v20 o v24 LTS
- **PostgreSQL**: Servidor de base de datos activo

## Instalación y Configuración

### 1. Clonar el repositorio y posicionarse en la carpeta
```bash
git clone https://github.com/LeandroSoria24/Trabajo-de-Laboratorio-BACKEND-2026.git
cd Trabajo-de-Laboratorio-BACKEND-2026
```

### 2. Instalar dependencias
Para instalar todas las dependencias declaradas en el proyecto (Express, Prisma, adaptador PostgreSQL, Dotenv, etc.):
```bash
npm install
```

> **Nota para instalaciones manuales desde cero:**
> ```bash
> # Dependencias de producción
> npm install express dotenv pg @prisma/adapter-pg
> 
> # Dependencias de desarrollo (Prisma CLI y Cliente)
> npm install -D prisma @prisma/client
> ```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto (puedes tomar como base [.env.example](file:///.env.example)):

```env
DATABASE_URL="postgresql://USUARIO:PASSWORD@localhost:5432/gestion_eventos_db?schema=public"
```
> Reemplaza `USUARIO`, `PASSWORD`, puerto y el nombre de la base de datos con los datos de tu conexión local de PostgreSQL.

### 4. Configurar y sincronizar la base de datos con Prisma

1. **Generar el cliente de Prisma:**
   Genera los tipos y el cliente adaptado en `src/generated/prisma`:
   ```bash
   npx prisma generate
   ```

2. **Ejecutar las migraciones:**
   Crea las tablas en PostgreSQL a partir del esquema (`prisma/schema.prisma`):
   ```bash
   npx prisma migrate dev
   ```

3. **(Opcional) Visualizar los datos con Prisma Studio:**
   Interfaz gráfica interactiva en el navegador para consultar y manipular registros:
   ```bash
   npx prisma studio
   ```

### 5. Iniciar la aplicación

- **Modo desarrollo** (con recarga automática mediante `node --watch`):
  ```bash
  npm run dev
  ```
- **Modo producción:**
  ```bash
  npm start
  ```

El servidor iniciará en: `http://localhost:3000`

---

## Estructura del Proyecto

```text
Trabajo-de-Laboratorio-BACKEND-2026/
├── prisma/
│   ├── migrations/       # Historial de migraciones SQL generadas
│   └── schema.prisma     # Definición de modelos y esquema de base de datos
├── src/
│   ├── config/           # Configuración del cliente Prisma (adapter pg)
│   ├── controllers/      # Lógica de controladores (libro.controllers, autor.controllers)
│   ├── data/             # Mock data de prueba en memoria
│   ├── generated/        # Cliente generado automáticamente por Prisma
│   ├── middlewares/      # Middlewares (logger, validarId, rutaNoEncontrada, manejoErrores)
│   ├── routes/           # Rutas modulares Express (libro.routes, autor.routes)
│   ├── utils/            # Funciones auxiliares reutilizables (crearError)
│   └── app.js            # Punto de entrada y configuración de Express
├── documentacionPropia/  # Diagramas de flujo y guías de arquitectura
├── .env.example          # Plantilla de variables de entorno
├── package.json
└── README.md
```

---

## Middlewares y Manejo de Errores

El proyecto implementa una arquitectura modular de middlewares para garantizar trazabilidad, validación y robustez:

* **`logger` (`src/middlewares/logger.js`):** Registra en consola cada petición HTTP entrante indicando método, URL original, código de respuesta y duración en milisegundos (`res.on('finish')`).
* **`validarId` (`src/middlewares/validarId.js`):** Valida que el parámetro `:id` sea un número entero positivo antes de que la petición llegue a los controladores, adaptando el mensaje si es un libro o autor.
* **`crearError` (`src/utils/crearError.js`):** Fábrica utilitaria que estandariza la creación de errores asociándoles un código de estado HTTP (`status`).
* **`rutaNoEncontrada` (`src/middlewares/rutaNoEncontrada.js`):** Captura cualquier ruta no registrada (404) y delega el error al manejador centralizado.
* **`manejoErrores` (`src/middlewares/manejoErrores.js`):** Middleware global de 4 parámetros `(err, req, res, next)` que centraliza todas las respuestas de error en formato JSON y protege detalles técnicos en errores `500`.

> Para consultar explicaciones exhaustivas y diagramas, ver la carpeta [documentacionPropia/](file:///c:/Users/actos/Desktop/Laboratorio/Trabajo-de-Laboratorio-BACKEND-2026/documentacionPropia/).

---

## Endpoints de la API

### General
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Mensaje de bienvenida de la API |
| `GET` | `/info` | Información general de la API (versión y estado) |
| `GET` | `/docs` | Documentación interactiva de la API con Swagger UI |

---

### Libros

| Método | Ruta | Descripción | Código Éxito |
|---|---|---|---|
| `GET` | `/libros` | Obtiene el listado completo de libros | `200 OK` |
| `GET` | `/libros/filtrados?titulo=...` | Filtra libros por coincidencia en el título | `200 OK` |
| `GET` | `/libros/:id` | Obtiene el detalle de un libro por su ID | `200 OK` |
| `POST` | `/libros` | Registra un nuevo libro | `201 Created` |
| `PUT` | `/libros/:id` | Actualiza los datos de un libro existente | `200 OK` |
| `DELETE` | `/libros/:id` | Elimina un libro por su ID | `204 No Content` |

---

### Autores

| Método | Ruta | Descripción | Código Éxito |
|---|---|---|---|
| `GET` | `/autores` | Obtiene el listado completo de autores | `200 OK` |
| `GET` | `/autores/:id` | Obtiene el detalle de un autor por su ID | `200 OK` |
| `POST` | `/autores` | Registra un nuevo autor | `201 Created` |
| `PUT` | `/autores/:id` | Actualiza los datos de un autor existente | `200 OK` |
| `DELETE` | `/autores/:id` | Elimina un autor por su ID | `204 No Content` |

---

## Códigos de Respuesta HTTP

| Código | Significado | Situación |
|---|---|---|
| `200 OK` | Petición exitosa | Lectura (`GET`) o actualización (`PUT`) completada |
| `201 Created` | Creado | Recurso creado con éxito (`POST`) |
| `204 No Content` | Sin contenido | Eliminación exitosa (`DELETE`) |
| `400 Bad Request` | Petición incorrecta | Faltan campos requeridos o el ID no es un número entero positivo |
| `404 Not Found` | No encontrado | Recurso no existente por ID o ruta no registrada |
| `500 Internal Server Error` | Error del servidor | Error no controlado capturado por el middleware global de errores |
