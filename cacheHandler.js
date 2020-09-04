const cache = require('memory-cache')

const retrieveCache = (cacheName) =>{
	return cache.get(`${cacheName}`)
}

const updateCache = (cacheName, cacheData ) =>{
	try{
		cache.put(`${cacheName}`, cacheData)
	}catch{
		cache.put(`${cacheName}`, {})
	}
}

exports.retrieveCache = retrieveCache;
exports.updateCache = updateCache;