const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const clients = require('./modules/clients');
const transactions = require('./modules/transactions');
const deposits = require('./modules/deposits');
const credits = require('./modules/credits');
const creditPromise = require('./modules/addCreditPromise');
const depositPromise = require('./modules/addDepositPromise');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "12345",
  database: "bank",
  port: 88
});

db.connect((err) => {
  if (err) {
  	throw err;
  }
  console.log('Successfuly connected');
});


app.post('/clients/all', (req, res) => clients.getAllClients(req, res, db));

app.post('/clients/add', (req, res) => clients.addNewClient(req, res, db));

app.post('/clients/:id', (req, res) => clients.getClientInfo(req, res, db));

app.post('/clients/:id/edit', (req, res) => clients.editClient(req, res, db));

app.get('/clients/:id/delete', (req, res) => clients.deleteClient(req, res, db));


app.post('/clients/:id/deposits', (req, res) => deposits.getClientsDeposits(req, res, db));

app.post('/deposits/:type', (req, res) => deposits.getDepositsNamesByType(req, res, db));

app.post('/deposits/details/:name', (req, res) => deposits.getDepositDetails(req, res, db));

app.post('/clients/:id/deposits/add', (req, res) => depositPromise.addDeposit(req, res, db));
	


app.post('/credits/all', (req, res) => credits.getAllCredits(req, res, db));
	
app.post('/clients/:id/credits', (req, res) => credits.getClientsCredits(req, res, db));

app.post('/credits/:name', (req, res) => credits.getCreditInfo(req, res, db));

app.post('/clients/:id/credits/add', (req, res) => creditPromise.addCredit(req, res, db));

app.get('/execute_transactions', (req, res) => transactions.executeAll(req, res, db)); 

app.post('/transactions', (req, res) => { console.log('--------->'); transactions.getAll(req, res, db)}); 


function createDataObject(obj) {
	let newObj = {};
	for (let key in obj) {
		if ( obj[key] != '') {
			newObj[key] = obj[key];
		}
	}
	return newObj;
}

function compareDataObjects(newInfo, oldInfo) {
	let dataObj = {};

	for (let key in newInfo) {
		if (newInfo[key] != '') {
			dataObj[key] = newInfo[key];
		} else if (oldInfo[key]) {
			dataObj[key] = oldInfo[key];
		}
	}
		return dataObj;
}

app.listen(port, () => console.log(`Listening on port ${port}`));