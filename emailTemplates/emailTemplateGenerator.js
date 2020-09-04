const emailBody = require('./constants/constants.js')

const generateReceipt = (emailOrderData) => {
	let productsArr = Object.keys(emailOrderData)
	return `<div class="section" id='recipt'>
					<h1>Order Details</h1>
			</div>`

}
const generateEmailTemplate = (emailTemplate, emailData) => {
	let returnHTML = emailBody.emailHeader + emailBody.emailStart 
	switch(emailTemplate){
		case 'Purchase Receipt':
			returnHTML += generateReceipt(emailData['order_data'])
	}
	returnHTML += emailBody.footer
	return `<html>${returnHTML}</html>`
}


exports.generateEmailTemplate = generateEmailTemplate