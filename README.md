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


### General
| Método | Ruta | Descripción |
|---|---|---|
| GET | / | Mensaje de bienvenida y estado de la API |

### Libros
| Método | Ruta | Descripción |
|---|---|---|
| GET | /libros | Lista todos los libros |
| GET | /libros/filtrados?titulo=... | Filtra libros por coincidencia en el título (`titulo`) |
| GET | /libros/:id | Obtiene el detalle de un libro por su ID |
| POST | /libros | Crea un nuevo libro (requiere `titulo` y `autor`; `anio` opcional) |
| PUT | /libros/:id | Actualiza un libro existente por su ID (requiere `titulo` y `autor`; `anio` opcional) |
| DELETE | /libros/:id | Elimina un libro por su ID |

### Autores
| Método | Ruta | Descripción |
|---|---|---|
| GET | /autores | Lista todos los autores |
| GET | /autores/:id | Obtiene el detalle de un autor por su ID |
| POST | /autores | Crea un nuevo autor (requiere `nombre`; `nacionalidad` opcional) |
| PUT | /autores/:id | Actualiza un autor existente por su ID (requiere `nombre`; `nacionalidad` opcional) |
| DELETE | /autores/:id | Elimina un autor por su ID |