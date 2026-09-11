import { crearError } from "../utils/crearError.js";

const CAMPOS_PERMITIDOS = ['titulo', 'autor', 'anio'];
const ANIO_MINIMO = 1000;

const LONGITUD_MIN_TITULO = 2;
const LONGITUD_MAX_TITULO = 150;
const LONGITUD_MIN_AUTOR = 2;
const LONGITUD_MAX_AUTOR = 100;

/**
 * Normaliza espacios: quita espacios a los bordes y colapsa múltiples espacios internos a uno solo.
 */
const normalizarEspacios = (texto) => texto.trim().replace(/\s+/g, ' ');

/**
 * Middleware para validar exhaustivamente los datos de un libro.
 */
export const validarLibro = (req, res, next) => {
    // 1. Validar que el body exista y sea un objeto JSON válido
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return next(crearError('El cuerpo de la petición debe ser un objeto JSON válido', 400));
    }

    if (Object.keys(req.body).length === 0) {
        return next(crearError('El cuerpo de la petición no puede estar vacío', 400));
    }

    // 2. Rechazar campos desconocidos o no permitidos
    const camposRecibidos = Object.keys(req.body);
    const camposInvalidos = camposRecibidos.filter(campo => !CAMPOS_PERMITIDOS.includes(campo));

    if (camposInvalidos.length > 0) {
        return next(crearError(`Campos no permitidos: ${camposInvalidos.join(', ')}. Solo se permiten: ${CAMPOS_PERMITIDOS.join(', ')}`, 400));
    }

    let { titulo, autor, anio } = req.body;

    // 3. Validación de Título
    if (typeof titulo !== 'string' || titulo.trim() === '') {
        return next(crearError('El título es obligatorio y debe ser una cadena de texto no vacía', 400));
    }

    titulo = normalizarEspacios(titulo);
    if (titulo.length < LONGITUD_MIN_TITULO || titulo.length > LONGITUD_MAX_TITULO) {
        return next(crearError(`El título debe tener entre ${LONGITUD_MIN_TITULO} y ${LONGITUD_MAX_TITULO} caracteres`, 400));
    }

    // 4. Validación de Autor
    if (typeof autor !== 'string' || autor.trim() === '') {
        return next(crearError('El autor es obligatorio y debe ser una cadena de texto no vacía', 400));
    }

    autor = normalizarEspacios(autor);
    if (autor.length < LONGITUD_MIN_AUTOR || autor.length > LONGITUD_MAX_AUTOR) {
        return next(crearError(`El autor debe tener entre ${LONGITUD_MIN_AUTOR} y ${LONGITUD_MAX_AUTOR} caracteres`, 400));
    }

    // Evitar que el autor sea puramente numérico (ej: "123456")
    if (/^\d+$/.test(autor)) {
        return next(crearError('El nombre del autor no puede ser un valor puramente numérico', 400));
    }

    // 5. Validación de Año (opcional pero estricto si viene)
    if (anio !== undefined && anio !== null) {
        // Permitir tanto número como string numérico ("2020"), pero rechazar booleanos o cadenas vacías
        const anioNumero = Number(anio);
        const anioActual = new Date().getFullYear();

        if (typeof anio === 'boolean' || String(anio).trim() === '' || !Number.isInteger(anioNumero)) {
            return next(crearError('El año debe ser un número entero', 400));
        }

        if (anioNumero < ANIO_MINIMO || anioNumero > anioActual) {
            return next(crearError(`El año debe ser un número entero entre ${ANIO_MINIMO} y ${anioActual}`, 400));
        }

        req.body.anio = anioNumero;
    } else {
        req.body.anio = null;
    }

    // 6. Guardar datos ya limpios y sanitizados en el body
    req.body.titulo = titulo;
    req.body.autor = autor;

    next();
};
