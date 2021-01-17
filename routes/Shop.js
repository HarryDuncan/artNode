// All the online store routes will be placed here
const express = require('express')
const router = express.Router()
require('dotenv').load();
const uuid = require("uuid/v4");
const cors = require('cors');
var bodyParser = require('body-parser');
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const functions = require('./../functions.js')
const connection = require('./../db.js')
const cache = require('./../cacheHandler.js')
const inventory = require('./../inventoryManagement.js')
var cloneDeep = require('lodash.clonedeep');
const aws_email = require('./../services/ses_sendMail.js')
router.use(require("body-parser").text());




router.post("/payment_intents", async (req, res) => {
  if (req.method === "POST") {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "aud"
          });

      if(req.body.dontation === undefined){
         // Check if items are in stock
        product_inventory = inventory.safeRetrieveInventory().then((prod_inventory) =>{
          let prodInv = cloneDeep(prod_inventory)
          if(functions.isInStock(prodInv, req.body.checkoutItems)){
             // Calculate amount
            res.status(200).send(paymentIntent.client_secret);
          }else{
                return res.status(409).json({statusCode: 409})
                
              }
          }).catch((error) => {
            return res.status(500)
          })
      }
     
     
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
})

router.post("/checkout", (req, res) => {
  let error;
  let status;
  const { product, token , order} = req.body;
  try{

    // Safely retrieves product inventory then updates
     product_inventory = inventory.safeRetrieveInventory().then((prod_inventory) =>{
     inventory.updateInventory(order, cloneDeep(prod_inventory)).then((response) =>{
     cache.updateCache('_inventory',response)
     productData = cache.retrieveCache('_products')
     let stockUpdates = functions.updateStockSQL(response, productData,)

    status = "success";

    // If Success then create SQL that updates product inventory
    let addOrderParams = functions.formatDataSQL('add_order', order)
    stockUpdates.push(addOrderParams)
    let multiquerystr = ''
    let valueArr =  []
    for(let i in stockUpdates){
      multiquerystr += stockUpdates[i]['insertStatement'] + '; '
      if(stockUpdates[i]['values'] !== undefined){
        valueArr.push(stockUpdates[i]['values'])
      }
    }

    if(order['contribution'] !== undefined){
      // Creates contribution data to update the campaign
      let contributionObj = {'contribution': order['contribution'], campaignID : order['campaignID']}
      let contributionStatement = functions.formatDataSQL('purchase_contribution',contributionObj)
      cache.safeRetrieveCache('_campaigns').then((response) =>{
         let campaignItem = {}

       
         for(let i in response){
          if(response[i]['ID'] === order['campaignID']){
            response[i]['Total'] += order['contribution']
            response[i]['ContributionCount'] += 1
            break;
          }
         }
         cache.updateCache('_contribution', response)

      })
      multiquerystr += contributionStatement
    }
    
    connection.query(multiquerystr, [valueArr], (err, results) =>{
        if(err){
          res.sendStatus(400)
        }else{
          let formattedItem = functions.formatOrderForCache(order)
          formattedItem['ID'] = results.insertId;
          formattedItem['dataType'] = 'order'
          let newCache = functions.addToCurrentCache(formattedItem,cache.retrieveCache('_orders'))
          cache.updateCache('_orders', newCache)
          aws_email.sendEmail('Purchase Receipt', {'order_data' : order, 'purchase_data' : token, 'transaction_data' : product})
         
          return res.json({
            status : 200,
            updatedInventory : cache.retrieveCache('_inventory'),
            emailData : {'type' : 'Purchase Receipt', data : {'order_data' : order, 'purchase_data' : token, 'transaction_data' : product}}
          })
        }
      })
      }).catch((error) => {
          console.log(error)
          return res.json({
            status : 409,
            conflict : error
          })
      })
    }).catch((error) => {
 
      return res.status(400).json({
        status : 400
      })
    })
    
   
 
  } catch (error) {
    
    status = "failure";
    res.json({ error, status });
  }

  
});

module.exports = router