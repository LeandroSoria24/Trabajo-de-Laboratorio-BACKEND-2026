# API <Api de biblioteca>

## Integrantes
- Leandro Soria Rosales, MUN° 00292 
- Santiago Ortiz, MUN° 00451

## Requisitos
Node.js 24 LTS

## Instalación
```bash
npm install
```

## Ejecución
```bash
npm run dev
```

## Endpoints


| Método | Ruta | Descripción |
|---|---|---|
| GET | / | Mensaje de bienvenida y estado de la API |
| GET | /libros | Lista todos los libros |
| GET | /libros/filtrados?titulo=... | Filtra libros por coincidencia en el título |
| GET | /libros/:id | Obtiene el detalle de un libro por su ID |
| POST | /libros | Crea un nuevo libro (requiere titulo y autor; anio opcional) |
| PUT | /libros/:id | Actualiza un libro existente por su ID |
| DELETE | /libros/:id | Elimina un libro por su ID |