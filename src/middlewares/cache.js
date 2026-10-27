import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 30, checkperiod: 60 });

export const cacheMiddleware = (ttl = 30) => (req, res, next) => {
    if (req.method !== 'GET') return next();

    const clave = req.originalUrl;
    const hit = cache.get(clave);

    if (hit) {
        console.log(`[CACHE HIT]  ${clave}`);
        res.setHeader('X-Cache', 'HIT');
        return res.status(hit.statusCode).json(hit.data);
    }

    console.log(`[CACHE MISS] ${clave} — consultando BD...`);
    res.setHeader('X-Cache', 'MISS');

    const jsonOriginal = res.json.bind(res);
    res.json = (body) => {
        if (res.statusCode < 300) cache.set(clave, { data: body, statusCode: res.statusCode }, ttl);
        return jsonOriginal(body);
    };

    next();
};

export const invalidarCache = (prefijo) => {
    cache.del(cache.keys().filter(k => k.startsWith(prefijo)));
    console.log(`[CACHE INVALIDADA] "${prefijo}"`);
};
