// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
const emailTemplates = require('./../emailTemplates/emailTemplateGenerator')


require('dotenv').load();



AWS.config.update({
    accessKeyId:  process.env.AWS_ACCESS_KEY_ID,
    secretAccessKeyId: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.REGION,
    })
// Create sendEmail params 


const generateSubject = (type , orderData) => {
  switch(type){
    case 'Order Fufilled':
      return 'Your order is on its way!'
    case 'Purchase Receipt':
    default:
      return 'Purchase Receipt'
  }
  
}
const sendEmail = (type , orderData) => {
  var params = {
    Destination: { /* required */
      CcAddresses: [
       
        /* more items */
      ],
      ToAddresses: [
        orderData['order_data']['Customer']['email']
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
         Charset: "UTF-8",
         Data: emailTemplates.generateEmailTemplate(type, orderData)
        },
        Text: {
         Charset: "UTF-8",
         Data: "TEXT_FORMAT_BODY"
        }
       },
       Subject: {
        Charset: 'UTF-8',
        Data: generateSubject(type, orderData)
       }
      },
    Source: 'harry@harryjdee.com', /* required */
    ReplyToAddresses: [
      
    ],
  };
  // Create the promise and SES service object
  const sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

  // Handle promise's fulfilled/rejected states
  sendPromise.then(
    function(data) {
    }).catch(
      function(err) {
      console.error(err, err.stack);
    });
}





  exports.sendEmail = sendEmail;