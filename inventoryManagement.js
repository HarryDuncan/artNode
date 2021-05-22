const connection = require('./db.js')
const cache = require('./cacheHandler.js')

const formatVariations = (variationData) => {
	let returnObj ={}
	let vData = JSON.parse(variationData)
	for(let i in vData['value']){
		let item = vData['value'][i]
		returnObj[item['itemTitle']] = item['stock']
	}
	return returnObj
}

const decrementItems = (stock_obj, purchased_products) => {
	let return_Stock_Obj = Object.assign({}, stock_obj)
	let productArr = Object.keys(purchased_products)
	for(let i in productArr){
		let itemID = purchased_products[productArr[i]]['ID']
		let itemType = purchased_products[productArr[i]]['Type']
		if(itemType === null){
			if(return_Stock_Obj[itemID]['Stock'] - 1 < 0){
				if(return_Stock_Obj['Error'] === undefined){
					return_Stock_Obj['Error'] = []
				}
				return_Stock_Obj['Error'].push(itemID)
			}else{
				return_Stock_Obj[itemID]['Stock'] -= 1
			}
		}else{
			if(return_Stock_Obj[itemID][itemType] - 1 < 0){
				if(return_Stock_Obj['Error'] === undefined){
					return_Stock_Obj['Error'] = []
				}
				
				return_Stock_Obj['Error'].push( { itemID : itemType })
			}else{
				return_Stock_Obj[itemID][itemType] -= 1
			}
			
		}
	}
	return return_Stock_Obj
}


// Exported Inventory Functions 
const initializeInventory = (productData) =>{
	let inventoryObj = {}
	for(let i in productData){
		inventoryObj[productData[i]['ID']] = {}
		if(productData[i]['HasVariations'] === 0){
			inventoryObj[productData[i]['ID']]['Stock'] = productData[i]['Stock']
		}else{
			inventoryObj[productData[i]['ID']] = formatVariations(productData[i]['Variations'])
		}
	}
	return inventoryObj
}

const updateInventory = (productData, inventoryCache) =>{
	let updatedProductData = JSON.parse(productData['Order']['value'])
	return new Promise(function(resolve, reject) {
		let updated_Inventory = decrementItems(inventoryCache, updatedProductData)
		if(updated_Inventory['Error'] === undefined){
			resolve(updated_Inventory)
		}else{
			reject(updated_Inventory)
		}		
	})
}


// Function to make sure inventory is properly initalized 
const safeRetrieveInventory = () => {
  return new Promise(function(resolve, reject){
     // Checks Cache 
    let product_inventory = cache.retrieveCache('_inventory')
    if(product_inventory === null){
      // If not in cache - retrieves product data - to have most up to date
        connection.query('SELECT * FROM _product_table', (err, results) => {
        if(err){
            reject(err)
          }else{
            cache.updateCache('_products', results)
            let stock_inventory = initializeInventory(results)
            cache.updateCache('_inventory', stock_inventory)
            resolve(stock_inventory)
          }
        })
      }else{
        resolve(product_inventory)
      }
  })
}

exports.safeRetrieveInventory = safeRetrieveInventory;
exports.updateInventory = updateInventory;
exports.initializeInventory  = initializeInventory;