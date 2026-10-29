import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 30, checkperiod: 60 });

export const cacheMiddleware = (ttl = 30) => (req, res, next) => {
    if (req.method !== 'GET') return next();

    const clave = req.originalUrl;
    const hit = cache.get(clave); /* valida si tiene algo guardado, si lo tiene lo devuelve y no toca la base de datos, es un "golpe a la cache", de lo contrario "pasa de largo" y toca la base de datos */

    if (hit) {
        console.log(`[CACHE HIT]  ${clave}`);
        res.setHeader('X-Cache', 'HIT');
        return res.status(hit.statusCode).json(hit.data); /* si hay un hit, devuelve el paquete guardado */
    }

    console.log(`[CACHE MISS] ${clave} — consultando BD...`);
    res.setHeader('X-Cache', 'MISS');

    /* monkey patching */
    const jsonOriginal = res.json.bind(res);/* copia de seguridad de la funcion nativa de express */
    res.json = (body) => { /* body = productos */
        if (res.statusCode < 300) cache.set(clave, { data: body, statusCode: res.statusCode }, ttl); /* guarda en la ram del servidor un paquete con los datos, el estado HTTP y el tiempo de vida (ttl) */
        return jsonOriginal(body); /* llamamos a la funcion original, mandandole el body */
    };

    next();
};

export const invalidarCache = (prefijo) => {
    cache.del(cache.keys().filter(k => k.startsWith(prefijo))); /* borra todas las claves que empiecen con el prefijo */
    console.log(`[CACHE INVALIDADA] "${prefijo}"`);
};                                                                  
