const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');


app.use(cors());
require('dotenv').config({path : '.env'})

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

var router = express.Router();
 	const Dashboard = require('./routes/Dashboard.js');
 	const Main = require('./routes/Main.js')
 	const S3Resolve = require('./routes/S3Resolver.js')
 	const Shop = require('./routes/Shop.js')
 	const Accounts = require('./routes/Accounts.js')
 	app.use('', S3Resolve);
 	app.use('',Main);
 	app.use('', Shop);
 	app.use('', Dashboard);
 	app.use('', Accounts);
	




app.listen(4000, () => {
	console.log('Running')
})
