const express = require('express')
const router = express.Router()
const connection = require('./../db.js')
const bcrypt = require('bcryptjs')

const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
require('dotenv').config()


// Login to Dashboard
router.post('/login', (req, res) =>{
	var userName = req.body.name;
	var pass = req.body.pass;
	const GetUser = `SELECT * FROM _users where userName = "${userName}"`
	connection.query(GetUser, userName, (err, results) =>{
		if(err){
			return res.sendStatus(401)
		}
		else if(results === []){
			return res.sendStatus(401)

		}else{
			try{
				let savedPword = results[0].pWord
				bcrypt.compare(pass, savedPword, (err, isMatch) => {
	  				if(isMatch === true){
	  					let verify = speakeasy.totp.verify({
	  						secret : process.env.SECRET_ASCII,
	  						encoding : 'ascii',
	  						token : req.body.twoFactor,
	  					})
	  					if(verify){
	  						res.sendStatus(200)
	  					}else{
	  						res.sendStatus(401)
	  					}
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
