const moment = require('moment');


// Creates an SQL Query that updates the products table if the inventory has changed and updates the product cache
const updateStockSQL = (inventory, productData) =>{
	
	const formatIntoStatement = (dataObj) => {
		let sqlStr = dataObj['head'] + dataObj['updateStatement'] + ' end '
		let where = ' Where ID in ('
		for(let id in dataObj['whereID']){
			where += `${dataObj['whereID'][id]} , `
		}
		where = where.substring(0, where.length - 2)
		where += `)`

		sqlStr += where

		return sqlStr
	}

	let updateStr = ''
	let nonVariationStatementObj = 
									{'head' : `UPDATE _product_table set stock = case `,
									 'updateStatement' : '',
									 'whereID' : [],
									 'update' : false
									}
	let variationStatementObj = 
									{'head' : `UPDATE _product_table set variations = case `,
									 'updateStatement' : '',
									 'whereID' : [],
									 'update' : false
									}
	for(let i in productData){
		if(productData[i]['hasVariations'] === 0){
			if(productData[i]['stock'] !== inventory[productData[i]['ID']]['stock']){
				productData[i]['stock'] = inventory[productData[i]['ID']]['stock']
				nonVariationStatementObj['update'] = true;
				nonVariationStatementObj['updateStatement'] += ` when ID = ${productData[i]['ID']} then ${productData[i]['stock']} `
				nonVariationStatementObj['whereID'].push(productData[i]['ID'])
			}
		}else{
			let variationData = JSON.parse(productData[i]['variations'])
			let productDetailsData = variationData['value']
			console.log(productDetailsData)
			for(let details in productDetailsData){
				if(productDetailsData[details]['stock'] !== inventory[productData[i]['ID']][productDetailsData[details]['itemTitle']]){
					variationStatementObj['update'] = true;
					productDetailsData[details]['stock'] = inventory[productData[i]['ID']][productDetailsData[details]['itemTitle']]
					variationData['value'] =  productDetailsData
					variationStatementObj['updateStatement'] += ` when ID = ${productData[i]['ID']} then '${JSON.stringify(variationData)}' `
					variationStatementObj['whereID'].push(productData[i]['ID'])
				}
			}
		}
	}

	let returnObj = []
	if(variationStatementObj['update']){
		returnObj.push({'insertStatement' : formatIntoStatement(variationStatementObj)})
	}
	if(nonVariationStatementObj['update']){
		returnObj.push({'insertStatement' : formatIntoStatement(nonVariationStatementObj)})
	}

	return returnObj
}

const formatDataSQL = (action, data) => {
	let body = data.new_item
	let fieldNames = []
	try{
		fieldNames = Object.keys(body)
	}catch{
		fieldNames = []
	}
	
	switch(action){
		case 'add_item':
			let fieldValues = []
			let fieldNameStr = `(`
			for(let i in fieldNames){
				fieldNameStr += `${fieldNames[i]} ,`
				switch(body[fieldNames[i]]['type']){
					case 'int':
					case 'yesNo':
						fieldValues.push(body[fieldNames[i]]['value'] === NaN ? null : Number(body[fieldNames[i]]['value']))
						break;
					default:
						if(body[fieldNames[i]]['value'] !== ''){
							fieldValues.push(String(body[fieldNames[i]]['value']))
						}else{
							fieldValues.push(null)
						}
						
				}
			}
			fieldNameStr = fieldNameStr.substring(0, fieldNameStr.length -2)
			fieldNameStr += `)`
			let insertStatement = `INSERT INTO ${data.data_table} ${fieldNameStr}  VALUES ?`
			return {'insertStatement' : insertStatement, 'values' : fieldValues}
		case 'update_item':
			let updateStr = ''
			for(let i in fieldNames){
				if(fieldNames)
				switch(body[fieldNames[i]]['type']){
					case 'int':
					case 'yesNo':
						let valueStr = Number(body[fieldNames[i]]['value'])
						updateStr += `${fieldNames[i]} = ${valueStr}, `
						break;
					default:
						if(body[fieldNames[i]]['value'] !== '' && body[fieldNames[i]]['value'] !== null){
							updateStr += `${fieldNames[i]} = '${String(body[fieldNames[i]]['value'])}', `
						}else if(body[fieldNames[i]]['value'] === null){
								updateStr += `${fieldNames[i]} = ${String(body[fieldNames[i]]['value'])}, `
						}
						
				}
			}
			let updateStatement = `UPDATE ${data.data_table}  SET ${updateStr.substring(0, updateStr.length - 2)} WHERE ID = ${data.item_ID}`
			return updateStatement
		case 'add_order':
			let orderStr = '(CustomerName, CustomerEmail, Address, OrderDetails, OrderStat, RefID, Purchased)'
			let orderValues = [data['Customer']['name'], data['Customer']['email'], data['Customer']['address'], data['Order']['value'], "Pending", data['id'], moment().format()]
			let orderStatement = `INSERT INTO _order_table ${orderStr}  VALUES ?`
			return {'insertStatement' : orderStatement, 'values' : orderValues}
		case 'delete_item':
			return `DELETE FROM ${data.data_table} WHERE ID="${data.item_ID}"`
		default: 
			return {}
		}
}

// For updating Cache Objects
const updateCurrentCache = (newData , itemID,   currentCache) => {
	try{
		for(let i in currentCache){
			if(currentCache[i]['ID'] === itemID){
				let newObj = Object.assign({}, currentCache[i])
				let fieldArr = Object.keys(newData)
				for(let field in fieldArr){
					newObj[fieldArr[field]] = newData[fieldArr[field]]['value']
				}
				currentCache[i] = newObj
				}
			}
		return currentCache
	}catch{
		return currentCache
	}
	
}
const formatItem = (item) => {
	let returnObj = {}
	let itemFields = Object.keys(item)
	for(let i in itemFields){
		returnObj[itemFields[i]] = item[itemFields[i]]['value']
	}
	return returnObj
}


const formatOrderForCache = (item) => {
	let returnObj = {
	Address: item['Customer']['address'],
	Country: null,
	CustomerEmail: item['Customer']['email'],
	CustomerName: item['Customer']['name'],
	OrderDetails: item['Order']['value'],
	OrderStat: "Pending",
	Purchased: moment().format(),
	RefID: item['id'],
	ShippingCompany: null,
	ShippingDetails: null,
	ShippingNo: null,
	}
	return returnObj
}
// For updating Cache Objects
const removeFromCurrentCache = (itemID,   currentCache) => {
	try{
		for(let i in currentCache){
			if(currentCache[i]['ID'] === itemID){
				let newObj = currentCache.splice(i,1)
				break;
			}
		}
		return currentCache
	}catch{
		return currentCache
	}
}


// For updating Cache Objects
const addToCurrentCache = (newData,  currentCache) => {
	try{
		currentCache.push(newData)
		return currentCache
	}catch{
		return currentCache
	}
}


exports.formatItem = formatItem;
exports.addToCurrentCache = addToCurrentCache;
exports.removeFromCurrentCache = removeFromCurrentCache;
exports.updateCurrentCache = updateCurrentCache;
exports.formatDataSQL = formatDataSQL;
exports.formatOrderForCache = formatOrderForCache;
exports.updateStockSQL = updateStockSQL;

