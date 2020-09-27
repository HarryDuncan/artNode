const express = require('express');
const cors = require('cors');
const app = express();
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
require('dotenv').config({path : '.env'})
const fileUpload = require('express-fileupload');
app.use(cors());
app.use(fileUpload());



var router = express.Router();
 	const Dashboard = require('./routes/Dashboard.js');
 	const Main = require('./routes/Main.js')
 	const S3Resolve = require('./routes/S3Resolver.js')
 	const Shop = require('./routes/Shop.js')
 	const Accounts = require('./routes/Accounts.js')
 	const Campaigns = require('./routes/Campaigns.js')
 	app.use('', Campaigns);
 	app.use('', S3Resolve);
 	app.use('',Main);
 	app.use('', Shop);
 	app.use('', Dashboard);
 	app.use('', Accounts);
	




app.listen(4000, () => {
	console.log('Running')
})
