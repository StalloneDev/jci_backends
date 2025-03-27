const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Vérifier les clés expirées toutes les 60 secondes
  useClones: false, // Pour de meilleures performances
  deleteOnExpire: true,
});

const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = `${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.json(cachedResponse);
      return;
    }

    // Remplacer res.json pour intercepter la réponse
    const originalJson = res.json;
    res.json = function(body) {
      cache.set(key, body, duration);
      originalJson.call(this, body);
    };

    next();
  };
};

const clearCache = (pattern) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  matchingKeys.forEach(key => cache.del(key));
};

module.exports = {
  cache,
  cacheMiddleware,
  clearCache,
};
