import prisma from '../config/prisma.js';
import { crearError } from '../utils/crearError.js';

/* const GEOREF_CATAMARCA_URL = 'https://apis.datos.gob.ar/georef/api/v2.0/municipios?provincia=Catamarca&max=100'; */

/*
  Servicio para sincronizar las localidades/municipios de Catamarca
  directamente desde la API oficial de Georef del Estado Nacional.
*/
/* export const sincronizarDesdeGeoref = async () => {
    const res = await fetch(GEOREF_CATAMARCA_URL);
    if (!res.ok) {
        throw crearError(`Error al consultar la API de Georef: HTTP ${res.status}`, 502);
    }

    const data = await res.json();
    if (!data.municipios || !Array.isArray(data.municipios)) {
        throw crearError('Respuesta inesperada de la API de Georef', 502);
    }

    let insertados = 0;
    for (const mun of data.municipios) {
        await prisma.localidad.upsert({
            where: { nombre: mun.nombre },
            update: {},
            create: {
                nombre: mun.nombre,
                provincia: 'Catamarca'
            }
        });
        insertados++;
    }

    const total = await prisma.localidad.count();

    return {
        mensaje: 'Localidades sincronizadas correctamente desde la API oficial de Georef',
        totalGeoref: data.municipios.length,
        totalEnBaseDeDatos: total
    };
};
 */


/*
  Servicio para obtener la lista de localidades.
  Si la base de datos está vacía, se auto-sincroniza desde Georef.
*/
export const obtenerLocalidades = async (criterios = {}) => {
    const { nombre, ordenarPor = 'nombre', direccion = 'asc' } = criterios;

    let total = await prisma.localidad.count();
    if (total === 0) {
        await sincronizarDesdeGeoref();
    }

    const where = {};
    if (nombre) {
        where.nombre = { contains: nombre, mode: 'insensitive' };
    }

    return prisma.localidad.findMany({
        where,
        orderBy: [{ [ordenarPor]: direccion }, { id: 'asc' }],
        include: {
            _count: {
                select: { artesanos: true }
            }
        }
    });
};

/*
  Servicio para obtener una localidad por su ID.
*/
export const obtenerLocalidadPorId = async (id) => {
    const localidad = await prisma.localidad.findUnique({
        where: { id },
        include: {
            artesanos: {
                select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    rubro: true,
                    nombreEmprendimiento: true,
                    activo: true
                }
            }
        }
    });

    if (!localidad) {
        throw crearError(`No existe una localidad con id ${id}`, 404);
    }

    return localidad;
};
