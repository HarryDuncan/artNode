const emailBody = require('./constants/constants.js')
const cache = require('./../cacheHandler.js')
require('dotenv').config()

// General Functions
const getImage = (productID) => {
	let products = cache.retrieveCache('_products')
	for(let i in products){
		if(Number(productID) === Number(products[i]['ID'])){
			return `<img class='product-img' src=https://harryjdee.com/images/products/${products[i]['Url']}.jpg style="display:block" title="Product Img" alt="${products[i]['Url']}" />`
		}
	}
	return `<div/>`
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
					<span>You will receive an email when your order has been dispatched</span>
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
const generateOrderSummary = (emailOrderData) => {
	let productsObj = JSON.parse(emailOrderData['OrderDetails'])
	return `<div class="section" id='recipt'>
					<h1>Order Summary</h1>
					${generateSummaryItems(productsObj)}
			</div>`
}

const returnShippingDetails = (shippingDetails) => {
	if(shippingDetails !== undefined && shippingDetails.length > 1){
		return `<div id='shipping-details'><p>${shippingDetails}</p></div>`
	}else{
		return `<div/>`
	}
}

// const getShippingURL = ()

const generateShippingSummary = (shippingData) => {
	return `<div class="section" id='recipt'>
					<h1>Shipping Details</h1>
					<p>Tracking No: ${shippingData['ShippingNo']['value']}</p>
					<p>Shipping With: ${shippingData['ShippingCompany']['value']}</p>
					${returnShippingDetails(shippingData['ShippingDetails']['value'])}
					<br/>
					<a href=https://auspost.com.au/mypost/track/#/details/${shippingData['ShippingNo']['value']}><h1>Click Here To Track Your Order</h1></a>
			</div>`
}


const getPurchaseMethod = (emailPurchaseData) => {
	return `<span>Paid With ${emailPurchaseData['card']['brand']} ending in ${emailPurchaseData['card']['last4']}</span>`
}
const generatePurchaseDetails = (emailPurchaseData, emailTransactionData) => {
	return`<div class='purchase-details'>
				<p>This purchase will appear on your statement as harryjdee</p>
				<span>Purchase ID: ${emailPurchaseData['id']}</span>
				<span>Purchase Time: ${emailPurchaseData['time']}</span>
				${getPurchaseMethod(emailTransactionData)}
				
			</div>`
}

const generateDonationBlurbOnPurchase = (donationData) => {
	
	if(donationData['contribution'] !== undefined){
	let campaigns = cache.retrieveCache('_campaigns')
	let donatedTo = {}
	for(let i in campaigns){
		if(campaigns[i]['ID'] === donationData['campaignID']){
			donatedTo = campaigns[i]
		}	
	}
	
	return `<div class="section">
					<h1>Your purchase has contributed ${donationData['contribution']} to ${donatedTo['Name']}</h1>
					<p>${donatedTo['EmailContent']}</p>
					<a href=${donatedTo['SiteUrl']}>For More Info Click Here</a>
			</div>`
	}else{
		return `<div/>`
	}
}

const generateDonationBlurbOnDonation = (donationData) => {

		let campaigns = cache.retrieveCache('_campaigns')
		let donatedTo = {}
		for(let i in campaigns){
			if(campaigns[i]['ID'] === donationData['campaignID']){
				donatedTo = campaigns[i]
			}	
		}
		
		return `<div class="section">
						<h1>Your purchase has contributed AUD $${donationData['contribution']} to ${donatedTo['Name']}</h1>
						<p>${donatedTo['EmailContent']}</p>
						<a href=${donatedTo['SiteUrl']}>For More Info Click Here</a>
				</div>`
	
}


const generateDonationReceipt = (donationData, payment, donor) => {
	let campaigns = cache.retrieveCache('_campaigns')
	let donatedTo = {}
	for(let i in campaigns){
		if(campaigns[i]['ID'] === donationData['CampaignID']){
			donatedTo = campaigns[i]
		}	
	}
		return `<div class="section">
					<h1>Your donation of AUD $${donationData['Amount']} has gone to support a great cause</h1>
					<p>${donatedTo['EmailContent']}</p>
					<a href=${donatedTo['SiteUrl']}>For More Info Click Here</a>
				</div>
				<div class="section" id='recipt'>
					<h1>Donation Receipt</h1>
					<p>Donor Name: ${donor['Name']}</p>
					<p>Amount AUD: $${donationData['Amount']}</p>
					<p>Donation To: ${donatedTo['Name']}</p>
					<p>Donation ID: ${payment['id']}</p>
					<p>Paid with ${payment['card']['brand']} ending in ${payment['card']['last4']}</p>
					<p>This purchase will appear on your statement as harryjdee</p>
				</div>`
	
}

const generateEmailTemplate = (emailTemplate, emailData) => {
	let returnHTML = emailBody.emailHeader
	switch(emailTemplate){
		case 'Purchase Receipt':
			returnHTML += emailBody.receiptStart + `${generateDonationBlurbOnPurchase(emailData['order_data'])} ${generateReceipt(emailData['order_data']['Order'], emailData['transaction_data'])} ${generatePurchaseDetails(emailData['order_data'], emailData['purchase_data'])}`
			break;
		case 'Donation Receipt':
			returnHTML += emailBody.donationReceiptStart + `${generateDonationReceipt(emailData['donationData'], emailData['payment'], emailData['donorData'])} `
			break;
		case 'Order Fufilled':
			returnHTML += emailBody.orderStatusStart + `${generateShippingSummary(emailData['shippingData'])}${generateOrderSummary(emailData['order_data'])}`
			break;
	}
	returnHTML += emailBody.footer

	return `<html>${returnHTML}</html>`
}


exports.generateEmailTemplate = generateEmailTemplate