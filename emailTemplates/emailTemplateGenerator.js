const emailBody = require('./constants/constants.js')
const cache = require('./../cacheHandler.js')
require('dotenv').config()

// General Functions
const getImage = (productID) => {
	let products = cache.safeRetrieveCache('_products').then((response) =>{
		for(let i in products){
			if(productID === products[i]['ID']){
				return `<img class='product-img' src=${process.env.S3_IMAGE_ROUTE}products${products[i]['url']}.jpg'/>`
			}
		}
		return `<div/>`
	}).catch((err) => {
		return `<div/>`
	})
}

// Receipt Functions 
const generateOrder = (productsData) => {
	let productsArr = Object.keys(productsData)
	let returnStr = ''
	for(let i in productsArr){		
		returnStr += `
					<div class='product-item'>
						<div class='product-details'>
							<h1>${productsData[productsArr[i]]['Product']}</h1>
							<span>AUD $${productsData[productsArr[i]]['Price']}</span>
						</div>
						${getImage(productsData[productsArr[i]]['ID'])}
					</div>`
	}
	return returnStr
}
const generateReceipt = (emailOrderData, transactionData) => {
	let productsObj = JSON.parse(emailOrderData['value'])
	return `<div class="section" id='recipt'>
					<h1>Purchase Receipt</h1>
					${generateOrder(productsObj)}
					<h1>Total: ${transactionData['currency']} $${transactionData['price']}</h1>	
			</div>`
}


// Shipped Functions 

const generateSummaryItems = (productsData) => {
	let productsArr = Object.keys(productsData)
	let returnStr = ''
	for(let i in productsArr){		
		returnStr += `
					<div class='product-item'>
						<div class='product-details'>
							<h1>${productsData[productsArr[i]]['Product']}</h1>
						</div>
						${getImage(productsData[productsArr[i]]['ID'])}
					</div>`
	}
	return returnStr
}
const generateOrderSummary = (emailOrderData, transactionData) => {
	let productsObj = JSON.parse(emailOrderData['value'])
	return `<div class="section" id='recipt'>
					<h1>Order Summary</h1>
					${generateSummaryItems(productsObj)}
			</div>`
}



const getPurchaseMethod = (emailPurchaseData) => {
	return `<span>Paid With ${emailPurchaseData['card']['brand']} ending in ${emailPurchaseData['card']['last4']}</span>`
}
const generatePurchaseDetails = (emailPurchaseData, emailTransactionData) => {
	return`<div class='purchase-details'>
				<span>Purchase ID: ${emailPurchaseData['id']}</span>
				<span>Purchase Time: ${emailPurchaseData['time']}</span>
				${getPurchaseMethod(emailTransactionData)}
			</div>`
}





const generateEmailTemplate = (emailTemplate, emailData) => {
	let returnHTML = emailBody.emailHeader
	console.log(emailTemplate)
	switch(emailTemplate){
		case 'Purchase Receipt':
			returnHTML += emailBody.receiptStart + `${generateReceipt(emailData['order_data']['Order'], emailData['transaction_data'])} ${generatePurchaseDetails(emailData['order_data'], emailData['purchase_data'])}`
			break;
		case 'Order Fufilled':
			console.log(emailData)
			returnHTML += emailBody.orderStatusStart + `${generateOrderSummary(emailData['order_data']['Order'], emailData['transaction_data'])}`
			break;
	}
	returnHTML += emailBody.footer

	return `<html>${returnHTML}</html>`
}


exports.generateEmailTemplate = generateEmailTemplate