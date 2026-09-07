import { Router } from 'express';

const router = Router();

const openApiSpec = {
    openapi: '3.0.0',
    info: {
        title: 'API Biblioteca',
        version: '2.0.0',
        description: 'Documentación interactiva de la API de biblioteca (Libros y Autores).'
    },
    servers: [
        {
            url: '/',
            description: 'Servidor actual'
        }
    ],
    tags: [
        { name: 'General', description: 'Endpoints generales de la API' },
        { name: 'Libros', description: 'Operaciones sobre libros' },
        { name: 'Autores', description: 'Operaciones sobre autores' }
    ],
    paths: {
        '/': {
            get: {
                tags: ['General'],
                summary: 'Mensaje de bienvenida y estado de la API',
                responses: {
                    '200': {
                        description: 'Respuesta exitosa',
                        content: {
                            'application/json': {
                                example: { mensaje: 'Api Laboratorio - Biblioteca' }
                            }
                        }
                    }
                }
            }
        },
        '/info': {
            get: {
                tags: ['General'],
                summary: 'Información y versión de la API',
                responses: {
                    '200': {
                        description: 'Detalle de versión y estado',
                        content: {
                            'application/json': {
                                example: {
                                    mensaje: 'Api Laboratorio - Biblioteca',
                                    version: '2.0',
                                    estado: 'En desarrollo'
                                }
                            }
                        }
                    }
                }
            }
        },
        '/libros': {
            get: {
                tags: ['Libros'],
                summary: 'Lista todos los libros',
                responses: {
                    '200': {
                        description: 'Listado de libros',
                        content: {
                            'application/json': {
                                example: [
                                    { id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anio: 1967 },
                                    { id: 2, titulo: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes', anio: 1605 }
                                ]
                            }
                        }
                    }
                }
            },
            post: {
                tags: ['Libros'],
                summary: 'Crea un nuevo libro',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['titulo', 'autor'],
                                properties: {
                                    titulo: { type: 'string', example: 'Rayuela' },
                                    autor: { type: 'string', example: 'Julio Cortázar' },
                                    anio: { type: 'integer', example: 1963 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Libro creado exitosamente',
                        content: {
                            'application/json': {
                                example: { id: 3, titulo: 'Rayuela', autor: 'Julio Cortázar', anio: 1963 }
                            }
                        }
                    },
                    '400': {
                        description: 'Faltan datos obligatorios',
                        content: {
                            'application/json': {
                                example: { error: 'Faltan datos obligatorios: titulo y autor son requeridos' }
                            }
                        }
                    }
                }
            }
        },
        '/libros/filtrados': {
            get: {
                tags: ['Libros'],
                summary: 'Filtra libros por coincidencia en el título',
                parameters: [
                    {
                        name: 'titulo',
                        in: 'query',
                        required: true,
                        description: 'Palabra o texto a buscar en el título',
                        schema: { type: 'string', example: 'soledad' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Libros encontrados',
                        content: {
                            'application/json': {
                                example: [
                                    { id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anio: 1967 }
                                ]
                            }
                        }
                    },
                    '400': {
                        description: 'Falta el parámetro titulo',
                        content: {
                            'application/json': {
                                example: { error: 'Debe especificar el parámetro "titulo" para filtrar' }
                            }
                        }
                    }
                }
            }
        },
        '/libros/{id}': {
            get: {
                tags: ['Libros'],
                summary: 'Obtiene el detalle de un libro por su ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'ID entero positivo del libro',
                        schema: { type: 'integer', example: 1 }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Detalle del libro encontrado',
                        content: {
                            'application/json': {
                                example: { id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anio: 1967 }
                            }
                        }
                    },
                    '400': {
                        description: 'ID inválido',
                        content: {
                            'application/json': {
                                example: { error: 'El ID del libro debe ser un número entero positivo' }
                            }
                        }
                    },
                    '404': {
                        description: 'Libro no encontrado',
                        content: {
                            'application/json': {
                                example: { error: 'no existe un libro con id 99' }
                            }
                        }
                    }
                }
            },
            put: {
                tags: ['Libros'],
                summary: 'Actualiza un libro existente por su ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'ID entero positivo del libro a actualizar',
                        schema: { type: 'integer', example: 1 }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['titulo', 'autor'],
                                properties: {
                                    titulo: { type: 'string', example: 'Cien años de soledad (Edición Ilustrada)' },
                                    autor: { type: 'string', example: 'Gabriel García Márquez' },
                                    anio: { type: 'integer', example: 2007 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Libro actualizado exitosamente',
                        content: {
                            'application/json': {
                                example: { id: 1, titulo: 'Cien años de soledad (Edición Ilustrada)', autor: 'Gabriel García Márquez', anio: 2007 }
                            }
                        }
                    },
                    '400': {
                        description: 'Datos inválidos o ID erróneo',
                        content: {
                            'application/json': {
                                example: { error: 'Faltan datos obligatorios: titulo y autor son requeridos' }
                            }
                        }
                    },
                    '404': {
                        description: 'Libro no encontrado',
                        content: {
                            'application/json': {
                                example: { error: 'no existe un libro con id 99' }
                            }
                        }
                    }
                }
            },
            delete: {
                tags: ['Libros'],
                summary: 'Elimina un libro por su ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'ID entero positivo del libro a eliminar',
                        schema: { type: 'integer', example: 1 }
                    }
                ],
                responses: {
                    '204': { description: 'Libro eliminado sin contenido' },
                    '400': { description: 'ID inválido' },
                    '404': { description: 'Libro no encontrado' }
                }
            }
        },
        '/autores': {
            get: {
                tags: ['Autores'],
                summary: 'Lista todos los autores',
                responses: {
                    '200': {
                        description: 'Listado de autores',
                        content: {
                            'application/json': {
                                example: [
                                    { id: 1, nombre: 'Gabriel García Márquez', nacionalidad: 'Colombiana' },
                                    { id: 2, nombre: 'Miguel de Cervantes', nacionalidad: 'Española' }
                                ]
                            }
                        }
                    }
                }
            },
            post: {
                tags: ['Autores'],
                summary: 'Crea un nuevo autor',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['nombre'],
                                properties: {
                                    nombre: { type: 'string', example: 'Julio Cortázar' },
                                    nacionalidad: { type: 'string', example: 'Argentina' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Autor creado exitosamente',
                        content: {
                            'application/json': {
                                example: { id: 3, nombre: 'Julio Cortázar', nacionalidad: 'Argentina' }
                            }
                        }
                    },
                    '400': {
                        description: 'Nombre faltante',
                        content: {
                            'application/json': {
                                example: { error: 'El campo "nombre" es obligatorio' }
                            }
                        }
                    }
                }
            }
        },
        '/autores/{id}': {
            get: {
                tags: ['Autores'],
                summary: 'Obtiene el detalle de un autor por su ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'ID entero positivo del autor',
                        schema: { type: 'integer', example: 1 }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Detalle del autor',
                        content: {
                            'application/json': {
                                example: { id: 1, nombre: 'Gabriel García Márquez', nacionalidad: 'Colombiana' }
                            }
                        }
                    },
                    '400': { description: 'ID inválido' },
                    '404': { description: 'Autor no encontrado' }
                }
            },
            put: {
                tags: ['Autores'],
                summary: 'Actualiza un autor existente por su ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'ID entero positivo del autor',
                        schema: { type: 'integer', example: 1 }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['nombre'],
                                properties: {
                                    nombre: { type: 'string', example: 'Gabriel García Márquez' },
                                    nacionalidad: { type: 'string', example: 'Colombiana' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Autor actualizado',
                        content: {
                            'application/json': {
                                example: { id: 1, nombre: 'Gabriel García Márquez', nacionalidad: 'Colombiana' }
                            }
                        }
                    },
                    '400': { description: 'Datos inválidos' },
                    '404': { description: 'Autor no encontrado' }
                }
            },
            delete: {
                tags: ['Autores'],
                summary: 'Elimina un autor por su ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'ID entero positivo del autor a eliminar',
                        schema: { type: 'integer', example: 1 }
                    }
                ],
                responses: {
                    '204': { description: 'Autor eliminado sin contenido' },
                    '400': { description: 'ID inválido' },
                    '404': { description: 'Autor no encontrado' }
                }
            }
        }
    }
};

// Endpoint que devuelve la especificación en JSON crudo
router.get('/json', (req, res) => {
    res.json(openApiSpec);
});

// Interfaz Swagger UI interactiva cargada desde CDN oficial
router.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Biblioteca - Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
    <style>
        body { margin: 0; background: #fafafa; font-family: sans-serif; }
        .topbar { display: none; }
        .custom-banner {
            background: #0f172a;
            color: #f8fafc;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
        .custom-banner h1 { margin: 0; font-size: 1.15rem; font-weight: 600; }
        .custom-banner a {
            color: #38bdf8;
            text-decoration: none;
            font-size: 0.9rem;
            border: 1px solid #38bdf8;
            padding: 4px 10px;
            border-radius: 4px;
            transition: all 0.2s ease;
        }
        .custom-banner a:hover {
            background: #38bdf8;
            color: #0f172a;
        }
    </style>
</head>
<body>
    <header class="custom-banner">
        <h1>📚 API Biblioteca &bull; Documentación Interactiva</h1>
        <a href="/">Ir al Inicio</a>
    </header>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
        const spec = ${JSON.stringify(openApiSpec)};
        window.onload = () => {
            SwaggerUIBundle({
                spec: spec,
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
                layout: "BaseLayout"
            });
        };
    </script>
</body>
</html>`);
});

export default router;
