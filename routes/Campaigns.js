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


const aws_email = require('./../services/ses_sendMail.js')

router.get('/')


router.post("/donate", async (req, res) => {
  let error;
  let status;
  const { product, token , order} = req.body;
   try{
     product_inventory = inventory.safeRetrieveInventory().then((prod_inventory) =>{
     inventory.updateInventory(order, cloneDeep(prod_inventory)).then((response) =>{
     cache.updateCache('_inventory',response)
     productData = cache.retrieveCache('_products')
     let stockUpdates = functions.updateStockSQL(response, productData,)
  //        /*
  //   const customer = await stripe.customers.create({
  //     email: token.email,
  //     source: token.id
  //   });

  //   const idempotency_key = uuid();
  //   const charge = await stripe.charges.create(
  //     {
  //       amount: product.price * 100,
  //       currency: "aud",
  //       customer: customer.id,
  //       receipt_email: token.email,
  //       description: `Purchased the ${product.name}`,
  //       shipping: {
  //         name: token.card.name,
  //         address: {
  //           line1: token.card.address_line1,
  //           line2: token.card.address_line2,
  //           city: token.card.address_city,
  //           country: token.card.address_country,
  //           postal_code: token.card.address_zip
  //         }
  //       }
  //     },
  //     {
  //       idempotency_key
  //     }
  //   );
  //   */ 
    status = "success";
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
   
    connection.query(multiquerystr, [valueArr], (err, results) =>{
        if(err){
          res.sendStatus(400)
        }
        else{
          let formattedItem = functions.formatOrderForCache(order)
          formattedItem['ID'] = results.insertId;
          formattedItem['dataType'] = 'order'
          let newCache = functions.addToCurrentCache(formattedItem,cache.retrieveCache('_orders'))
          cache.updateCache('_orders', newCache)
          aws_email.sendEmail('Purchase Receipt', {'order_data' : order, 'purchase_data' : token, 'transaction_data' : product})
          // TODO Email
          return res.json({
            status : 200,
            updatedInventory : cache.retrieveCache('_inventory')
          })
        }
      })
      }).catch((error) => {
         
          return res.status(409).json({
            conflict : error
          })
      })
    }).catch((error) => {
      return res.status(400).json({
        status : 400
      })
    })
    
   
 
  } catch (error) {
    console.error("Error:", error);
    status = "failure";
    res.json({ error, status });
  }

  
});

module.exports = router