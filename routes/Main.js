const express = require('express')
const router = express.Router()

var bodyParser = require('body-parser');
const cors = require('cors');
const connection = require('./../db.js')
const bcrypt = require('bcryptjs')
const selectAllPaintings = 'SELECT * FROM _painting_table ORDER BY PaintingYear DESC';
const selectAllProducts = 'SELECT * FROM _product_table';
const selectAllContent = 'SELECT * FROM _content_table';
const cache = require('./../cacheHandler.js')
const inventory = require('./../inventoryManagement.js')

router.get('/_painting_table', (req, res) =>{
	if(cache.retrieveCache('_paintings') === null){
		connection.query(selectAllPaintings, (err, results) => {
		if(err){
			return res.send(err)
		}
		else{
				cache.updateCache('_paintings', results)
				return res.json({
				data: results
				})
			}
		})
	}else{
		let results = cache.retrieveCache('_paintings')
		return res.json({
			data : results
		})
	}
	
});


router.get('/_content_table', (req, res) =>{
	if(cache.retrieveCache('_content') === null){
		connection.query(selectAllContent, (err, results) => {
		if(err){
			return res.send(err)
		}
		else{
				cache.updateCache('_content', results)
				return res.json({
				data: results
				})
			}
		})
	}else{
		let results = cache.retrieveCache('_content')
		return res.json({
			data : results
		})
	}
	
});



router.get('/_product_table', (req, res) =>{
	if(cache.retrieveCache('_products') === null){
		connection.query(selectAllProducts, (err, results) => {
			if(err){
				return res.send(err)
			}
			else{
				cache.updateCache('_products', results)
				let stock_inventory = inventory.initializeInventory(results)
				cache.updateCache('_inventory', stock_inventory)
				return res.json({
					data: results
				})
			}
		})
	}else{
		let results = cache.retrieveCache('_products')
		if(cache.retrieveCache('_inventory') === null){
			let stock_inventory = inventory.initializeInventory(results)
			cache.updateCache('_inventory', stock_inventory)
		}
		return res.json({
			data : results
		})
	}
});


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


router.post('/login', (req, res) =>{
	var userName = req.body.name;
	var pass = req.body.pass;
	
	const GetUser = `SELECT * FROM users where userName = "${userName}"`
	connection.query(GetUser, userName, (err, results) =>{
		if(err){
			return res.send(err)
		}
		else if(results === []){
			return res.sendStatus(401)

		}else{
			try{
				let savedPword = results[0].pWord
				bcrypt.compare(pass, savedPword, (err, isMatch) => {
	  				if(isMatch === true){
	  					
	  					res.sendStatus(200)
	  				}else{
	  					res.sendStatus(401)
	  				}
				});
			}catch{
			res.sendStatus(403)
			}
		
		}
	})
	
})




module.exports = router
