const FO = require('./financialOperations');

function addDeposit (req, res, db) {
	const cashBoxAccount = '1010345573243';
	const bankFondAccount = '7327111111111111';
	
	const accountNumber = accountGenerator();
	const percentsAccountNumber = accountGenerator();

	const promise = new Promise((resolve, reject) => {
		
		let depositSum = req.body['Первоначальный размер вклада, BYR'];

		let data = {"Название счета": "Депозитный счет", "Номер счета": accountNumber, "Тип": "П", "Дебет": depositSum, "Кредит": depositSum};
		let data2 = {"Название счета": "Процентный депозитный счет", "Номер счета": percentsAccountNumber, "Тип": "П", "Дебет": '0', "Кредит": '0'};
		
		FO.add(db, cashBoxAccount, accountNumber, depositSum, "Перечисление суммы по вкладу на текущий счет из кассы");
		FO.add(db, accountNumber, bankFondAccount, depositSum, "Перечисление суммы по вкладу c текущего счета в фонд развития банка");
		
		let addAccountQuery = db.query("INSERT INTO accounts SET ?", data, (err, response) => {
			if (err) throw new Error(err.message);
		});

		let addPercentsAccountQuery = db.query("INSERT INTO accounts SET ?", data2, (err, response) => {
			if (err) throw new Error(err.message);
		//console.log(response);
		});


		let updateCashbox = db.query('SELECT `Дебет`, `Кредит` FROM accounts WHERE `Название счета` = "Касса"', (err, response) => {
			if (err)  throw new Error(err.message);
			
			response[0]['Дебет'] ? response[0]['Дебет'] : response[0]['Дебет'] = 0; 
			response[0]['Кредит'] ? response[0]['Кредит'] : response[0]['Кредит'] = 0; 
			console.log(+response[0]['Дебет']);
			console.log(parseInt(depositSum));
			let dSum = +response[0]['Дебет'] + +depositSum;
			dSum.toFixed(2);
			console.log(dSum );
			let cSum = +response[0]['Кредит'] + +depositSum;
			cSum.toFixed(2);
			
			db.query('UPDATE accounts SET `Дебет` = ' + dSum + ', `Кредит` = ' + cSum + ' WHERE `Название счета` = "Касса"', (err, resp) => {if (err)  throw new Error(err.message);});
		});

		let updateGrowFond = db.query('SELECT `Кредит` FROM accounts WHERE `Название счета` = "Фонд развития"', (err, response) => {
			if (err)  throw new Error(err.message);
			
			response[0]['Кредит'] ? response[0]['Кредит'] : response[0]['Кредит'] = 0 
			let sum = +response[0]['Кредит'] + +depositSum;
			sum.toFixed(2);

			db.query('UPDATE accounts SET `Кредит` = ' + sum + ' WHERE `Название счета` = "Фонд развития"', (err, resp) => {if (err)  throw new Error(err.message); resolve()});
		});
	}).then(async () => {

		req.body['Номер текущего счета'] = accountNumber;
		req.body['Номер процентного счета'] = percentsAccountNumber;
		console.log(req.body);

		let query = await new Promise ((resolve, reject) => db.query("INSERT INTO client_investment SET?", req.body, (err, response) => {
	      if (err) {
	        reject(err.message);  
	      } else resolve();
    	}));

	}).then(() => {
		    let query = db.query('SELECT * FROM client_investment WHERE idClient = ' + req.params.id + ' and `Номер процентного счета` = ' + percentsAccountNumber, (err, response) => {
			if (err) throw new Error(err.message);
			console.log(response);
			res.send(response);
		    });
		}).catch((message) => res.send(message));
}


function accountGenerator () {
	const depositAcc = 3014;
	let FINAL_NUMBERS = Math.ceil(Math.random() * 10000000001);
	return depositAcc + "" + FINAL_NUMBERS;

}

module.exports = {addDeposit: addDeposit};