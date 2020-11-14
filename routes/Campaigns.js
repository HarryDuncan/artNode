// All the online store routes will be placed here
const express = require('express')
const router = express.Router()
require('dotenv').load();
const cors = require('cors');
var bodyParser = require('body-parser');
const functions = require('./../functions.js')
const connection = require('./../db.js')
const cache = require('./../cacheHandler.js')
const inventory = require('./../inventoryManagement.js')
var cloneDeep = require('lodash.clonedeep');
const aws_email = require('./../services/ses_sendMail.js')
router.use(require("body-parser").json());

router.post("/donate", (req, res) => {

    console.log(req.body)
    
    const {donor, payment, donationData} = req.body;

    // Adds donor to the donor table
    let queryStr = `INSERT INTO _donor_table (DonorName, DonorEmail, PaymentID,Amount,CampaignID) VALUES ?;`
    let valueArr = [] 
    valueArr.push([donor['Name'], donor['Email'], payment['id'], donationData['Amount'], donationData['CampaignID']])

    // Updates campaign data 
    let contributionObj = {'contribution':  donationData['Amount'], campaignID : donationData['CampaignID']}
    let contributionStatement = functions.formatDataSQL('purchase_contribution',contributionObj)
    cache.safeRetrieveCache('_campaigns').then((response) =>{
       let campaignItem = {}

     
       for(let i in response){
        if(response[i]['ID'] === donationData['CampaignID']){
          response[i]['Total'] += donationData['Amount']
          response[i]['ContributionCount'] += 1
          break;
        }
       }
       cache.updateCache('_contribution', response)

    })
    queryStr += contributionStatement
    connection.query(queryStr, [valueArr], (err, results) =>{
        if(err){
          console.log(err)
          res.sendStatus(400)
        }else{
        
          aws_email.sendEmail('Donation Receipt', {'order_data' : {'Customer' : {'email' : donor['Email'] } } ,  'donorData' : donor, 'payment' : payment, 'donationData' : donationData })
       
          return res.json({
            status : 200,
    
          })
        }
    })
  
});

module.exports = router