const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser');
const cors = require('cors');
const connection = require('./../db.js')
const cache = require('./../cacheHandler.js')
const inventory = require('./../inventoryManagement.js')


router.get('/_painting_table', (req, res) =>{
	cache.safeRetrieveCache('_paintings').then((response) =>{
		return res.json({
			data : response
		})
	}).catch((error) => {
		res.send(err)
	})
});

router.get('/_content_table', (req, res) =>{
	cache.safeRetrieveCache('_content').then((response) =>{
		return res.json({
			data : response
		})
	}).catch((error) => {
		res.send(err)
	})	
});


router.get('/_product_table', (req, res) =>{
	cache.safeRetrieveCache('_products').then((response) =>{
		return res.json({
			data : response
		})
	}).catch((error) => {
		res.send(err)
	})	
});

router.get('/_mixes_table', (req, res) =>{
	cache.safeRetrieveCache('_mixes').then((response) =>{
		return res.json({
			data : response
		})
	}).catch((error) => {
		res.send(err)
	})	
});

router.get('/_site_settings', (req, res) =>{
	cache.safeRetrieveCache('_settings').then((response) =>{
		return res.json({
			data : response
		})
	}).catch((error) => {
		res.send(err)
	})	
});

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


module.exports = router
