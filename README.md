# API Biblioteca

API REST desarrollada con Node.js y Express para la gestión de libros y autores.

## Integrantes
- Leandro Soria Rosales, MUN° 00292 
- Santiago Ortiz, MUN° 00451

## Requisitos
Node.js 24 LTS

## Instalación y Ejecución

1. Clonar el repositorio y posicionarse en la carpeta del proyecto:
```bash
cd Trabajo-de-Laboratorio-BACKEND-2026
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor en modo desarrollo (con recarga automática):
```bash
npm run dev
```

El servidor iniciará en: `http://localhost:3000`

---

## Estructura del Proyecto

```text
Trabajo-de-Laboratorio-BACKEND-2026/
├── src/
│   ├── controllers/      # Lógica de negocio (libros y autores)
│   ├── data/             # Almacenamiento en memoria (mock data)
│   ├── middlewares/      # Middlewares personalizados
│   ├── routes/           # Definición de rutas Express
│   ├── utils/            # Funciones auxiliares / utilitarias
│   └── app.js            # Punto de entrada y configuración del servidor
├── package.json
└── README.md
```

---

## Endpoints de la API

### General
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Mensaje de bienvenida de la API |
| `GET` | `/info` | Información general de la API (versión y estado) |

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
