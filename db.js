const mysql = require('mysql');
const fs = require('fs');
require('dotenv').config()


let config = {
	host : process.env.DB_HOST,
	user : process.env.DB_USER,
	password : process.env.DB_PASS,
	database : process.env.DB_TABLE,
	port : 3306,
	ssl      : {
		     ca   : fs.readFileSync(process.env.URL_TO_KEY), 
	}
}

/*
let config = {
	host : process.env.DB_HOST,
	user : process.env.DB_USER,
	password : process.env.DB_PASS,
	database : process.env.DB_TABLE,
	multipleStatements: true,
}

*/

const connection = mysql.createConnection(config);

connection.connect(err => {
	if(err) {
		console.log(err)
		return err
	}
});

module.exports = connection 