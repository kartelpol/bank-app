function getClientsDeposits (req, res, db) {
	let query = db.query('SELECT investment.*, client_investment.*  FROM bank.client_investment, bank.investment WHERE client_investment.idClient = ' + req.params.id + ' and client_investment.idInvestment = investment.idInvestment', (err, response) => {
		if(err) {
			throw err;
			res.end();
		} else if(response.length) {
			res.send(response);
		} else res.send('Нет активных депозитов');
	});		
}



function getDepositsNamesByType (req, res, db) {
	let query = db.query('SELECT `Название вклада` FROM investment WHERE `Тип вклада` = "' + req.params.type +'"', (err, response) => {
		if(err) {
			throw err;
			res.end();
		} else if(response.length) {
			res.send(response);
		} else res.send('Нет доступных депозитов');
	});
}



function getDepositDetails (req, res, db) {
	let query = db.query('SELECT * FROM investment WHERE `Название вклада` = "' + req.params.name +'"', (err, response) => {
		if(err) {
			throw err;
			res.end();
		} else if(response) {
			res.send(response);
		} else res.send('Нет информации');
	});
}



function addDeposit (req, res, db) {
	let query = db.query("INSERT INTO client_investment SET?", req.body, (err, response) => {
		if (err) {
			res.send('Error. Check your data and try again.');
			throw err;	
		} else res.send('Deposit is successfuly added');
	});
}


module.exports = { getClientsDeposits: getClientsDeposits,
				   getDepositsNamesByType: getDepositsNamesByType,
                   getDepositDetails: getDepositDetails,
				   addDeposit: addDeposit
				 }