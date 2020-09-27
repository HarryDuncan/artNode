const cache = require('memory-cache')
const connection = require('./db.js')
const inventory = require('./inventoryManagement.js')

const retrieveCache = (cacheName) =>{
	return cache.get(`${cacheName}`)
}

const mapCacheToTableName = (cacheName) => {
	switch(cacheName){
		case '_products':
			return '_product_table';
		case '_paintings':
			return '_painting_table';
		case '_content':
			return '_content_table';
		case '_mixes':
			return '_mixes_table';
		case '_orders':
			return '_order_table';
		case '_campaigns':
			return '_campaigns';
		case '_settings':
		default:
			return 'site_settings'
	}
}

const updateCache = (cacheName, cacheData ) =>{
	try{
		cache.put(`${cacheName}`, cacheData)
	}catch{
		cache.put(`${cacheName}`, {})
	}
}

const safeRetrieveCache = (cacheName) => {
	return new Promise(function(resolve, reject){
		let returnCache = cache.get(`${cacheName}`)
		if(returnCache === null){
      	// If not in cache - retrieves product data - to have most up to date
        connection.query(`SELECT * FROM ${mapCacheToTableName(cacheName)}`, (err, results) => {
        if(err){
            reject(err)
          }else{
            updateCache(cacheName, results)
            // If retrieving productData update inventory cache too
            if(cacheName === '_products'){
            	let stock_inventory = inventory.initializeInventory(results)
            	updateCache('_inventory', stock_inventory)
            }

            resolve(cache.get(`${cacheName}`))
          }
        })
      }else{
        resolve(returnCache)
      }
	})
}

// gets an item from the cache - Must be id and called when safeRetrieveCache resolves
const retrieveItemFromCache = (cache, key, value ) => {
	for(let i in cache){
		if(cache[i][key] !== undefined && Number(cache[i][key]) === Number(value)){
			return cache[i]
		}
	}
	return 'not found'
}
exports.safeRetrieveCache = safeRetrieveCache;
exports.retrieveItemFromCache = retrieveItemFromCache;
exports.retrieveCache = retrieveCache;
exports.updateCache = updateCache;