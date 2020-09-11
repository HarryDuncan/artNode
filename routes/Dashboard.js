
//All dashboard routes placed here
const connection = require('./../db.js')
const express = require('express')
const router = express.Router()
var bodyParser = require('body-parser');
const cors = require('cors');
const functions = require('./../functions.js')
const cache = require('./../cacheHandler.js')
const aws_email = require('./../services/ses_sendMail.js')
const selectAllOrders = 'SELECT * FROM _order_table';


router.use(bodyParser.json({limit: '50mb'}));
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/_order_table', (req, res) =>{
	if(cache.retrieveCache('_orders') === null){
		connection.query(selectAllOrders, (err, results) => {
		if(err){
			return res.send(err)
		}
		else{
				cache.updateCache('_orders', results)
				return res.json({
				data: results
				})
			}
		})
	}else{
		let results = cache.retrieveCache('_orders')
		return res.json({
			data : results
		})
	}
});

router.post('/new', (req, res) => {
	//Takes the the table and the preformatted data in the request
	let queryParams = functions.formatDataSQL('add_item', req.body)
	connection.query(queryParams.insertStatement, [[queryParams.values]], (err, results) =>{
		if(err){
			res.sendStatus(400)
		}
		else{
			let cacheTable = '_paintings'
			let cacheDataType = 'paintings'
			if(req.body['data_table'] === '_product_table'){
				cacheTable = '_products'
				cacheDataType = 'products'
			}
			let formattedItem = functions.formatItem(req.body['new_item'])
			formattedItem['ID'] = results.insertId;
			formattedItem['dataType'] = cacheDataType
			let newCache = functions.addToCurrentCache(formattedItem,cache.retrieveCache(cacheTable))
			cache.updateCache(cacheTable, newCache)
			res.sendStatus(200)
		}
	})
})


router.post('/delete', (req, res) =>{
	let queryParams = functions.formatDataSQL('delete_item', req.body)
	connection.query(queryParams, (err, results) => {
		if(err){
			res.sendStatus(400)
		}else{
			let cacheTable = '_paintings'
			if(req.body['data_table'] === '_product_table'){
				cacheTable = '_products'
			}
			let newCache = functions.removeFromCurrentCache(req.body.item_ID, cache.retrieveCache(cacheTable))
			cache.updateCache(cacheTable, newCache)
			res.sendStatus(200)
		}
	})
})

router.post('/update_order', (req, res) => {
	let queryParams = functions.formatDataSQL('update_item', req.body)
	connection.query(queryParams, (err, results) =>{
		if(err){
			res.sendStatus(400)
		}else{
			cache.safeRetrieveCache('_orders').then((response) => {	
				let orderObj = cache.retrieveItemFromCache(response, 'ID', req.body['item_ID'])
				orderObj['Customer']= {'email' : orderObj['CustomerEmail']}
				aws_email.sendEmail('Order Fufilled',  {'order_data' : orderObj  , 'shippingData' : req.body['new_item']} )
				return res.sendStatus(200)
			}).catch((err) => {
				console.log(err)
				return res.sendStatus(400)
			})
			
		}
	})
})

router.post('/update', (req, res) =>{
	let queryParams = functions.formatDataSQL('update_item', req.body)
	connection.query(queryParams, (err, results) =>{
		if(err){
			res.sendStatus(400)
		}else{
			let cacheTable = '_paintings'
			if(req.body['data_table'] === '_product_table'){
				cacheTable = '_products'
			}
			let newCache = functions.updateCurrentCache(req.body['new_item'], req.body.item_ID ,cache.retrieveCache(cacheTable))
			cache.updateCache(cacheTable, newCache)
			res.sendStatus(200)
		}
	})
})

module.exports = router