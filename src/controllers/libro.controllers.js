import { libros } from '../data/libros.data.js';
import { crearError } from '../utils/crearError.js';
import prisma from '../config/prisma.js';

// GETTERS
export const getLibros = async (req, res, next) => {
    try {
        const libros = await prisma.libro.findMany();
        res.json(libros);
    }
    catch (error) {
        next(error);
    }
};

export const getLibrosFiltrados = async (req, res, next) => {
    try {
        const tituloRecibido = req.query.titulo;

        if (!tituloRecibido) {
            return next(crearError('Debe especificar el parámetro "titulo" para filtrar', 400));
        }

        const libroFiltrado = await prisma.libro.findMany({
            where: {
                titulo: {
                    contains: tituloRecibido,
                    mode: 'insensitive'
                }
            }
        })
        res.json(libroFiltrado)

    }
    catch (error) {
        next(error);
    }
};

export const getLibroPorId =
    async (req, res, next) => {
        try {
            const id = Number(req.params.id);
            const libros = await prisma.libro.findUnique({
                where: {
                    id: id
                },
                include: {
                    categoria: {
                        select: {
                            nombre: true
                        }
                    }
                }
            })
            if (!libros) {
                return next(crearError(`no existe un libro con id ${id}`, 404));
            }

            res.json(libros);
        }
        catch (error) {
            next(error);
        }

    };

// POST
export const createLibro = async (req, res, next) => {
    try {
        const { titulo, autor, anio } = req.body;

        const nuevoLibro = await prisma.libro.create({
            data: {
                titulo,
                autor: String(autor),
                anio: anio ? Number(anio) : null
            }
        });

        res.status(201).json(nuevoLibro);
    } catch (error) {
        next(error);
    }
};

// PUT
export const updateLibro = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return next(crearError('El ID proporcionado no es válido', 400));
        }

        const { titulo, autor, anio } = req.body;

        if (!titulo || !autor) {
            return next(crearError('Faltan datos obligatorios: titulo y autor son requeridos', 400));
        }

        // Verificar si el libro existe antes de intentar actualizarlo
        const existeLibro = await prisma.libro.findUnique({ where: { id } });
        if (!existeLibro) {
            return next(crearError(`No existe un libro con id ${id}`, 404));
        }

        const libroActualizado = await prisma.libro.update({
            where: { id },
            data: {
                titulo,
                autor: String(autor),
                anio: anio ? Number(anio) : null
            }
        });

        res.json(libroActualizado);
    } catch (error) {
        next(error);
    }
};

// DELETE
export const deleteLibro = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return next(crearError('El ID proporcionado no es válido', 400));
        }

        const existeLibro = await prisma.libro.findUnique({ where: { id } });
        if (!existeLibro) {
            return next(crearError(`No existe un libro con id ${id}`, 404));
        }

        await prisma.libro.delete({ where: { id } });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

/* アブノーマリティ･ダンシンガール / ぐちり feat.flower
No matter how hard I try or how much effort I put in
The results are always average
I can't go on like this
Constantly being manipulated by useless measures of worth
I've already come to hate this life
So, I think I'll restart my life

My chest is completely filled with abnormality
I'm becoming a me that isn't normal
I ask myself over and over: Did I get it?
A brand new me

Look at me now, touch me right now
I’ll throw away my ordinary clothes Now
From my chrysalis, I’ll become a butterfly
I’ll show off everything as it is
There are no performers on this cooled-off stage
So I'll beat out the steps, 1, 2, 3
I'm not being manipulated, I'm dancing!
Yeah, yeah, yeah, I'm going crazy!

Normality cast a curse on me, and I yearned for abnormality, I
Don't have any interest in your differing opinions or pet theories, I’ve already locked the door
I went beyond love and hate and fell deeply in love with abnormality a long time ago
And from the ruins of that warped love, it was created-
A brand new me

Look at me now, touch me right now
I’ll throw away my ordinary clothes Now
From my chrysalis, I’ll become a butterfly
I’ll show off everything as it is
There are no performers on this cooled-off stage
So I'll beat out the steps, 1, 2, 3
I'm not being manipulated, I'm dancing!
Yeah, yeah, yeah, I'm going crazy!

In a dark room by myself, before the mirror at midnight
Who are you? Who am I?, I asked, but received no reply
Go crazy, go crazy, go crazy, go crazy, go crazy, go crazy, go crazy, dance
Oh, brand new me

Look at me now, touch me right now
Dressed up in transparent clothes
From my chrysalis, I’ll become a butterfly
I’ll show off everything as it is
There are no performers on this impassioned stage
So I'll beat out the steps, 1, 2, 3
I'm not being manipulated, I'm dancing!
Yeah, yeah, yeah, I'm going crazy!

My chest is completely filled with abnormality
I'm becoming a me that isn't normal
And from the ruins of that warped love, it was created an unfulfillable love
My chest is completely filled with abnormality
I'm becoming a me that isn't normal
I ask myself over and over: Did I get it?

A brand-new me*/