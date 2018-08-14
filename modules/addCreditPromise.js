const moment = require('moment');
const FO = require('./financialOperations');


function addCredit (req, res, db) {

	const cashBoxAccount = '1010345573243';
	const bankFondAccount = '7327111111111111';
	
	const accountNumber = accountGenerator();
	const percentsAccountNumber = accountGenerator();
	let creditSum = req.body['Сумма кредита, BYR'];

	const promise = new Promise((resolve, reject) => {
		let agecheck = db.query("SELECT Birthday FROM client WHERE idClient = " + req.params.id, (err, response) => {
			
			let now = moment().format('YYYY-MM-DD');
			let birthArr = response[0].Birthday.split('-');
			birthArr[1]--;

			let age = parseInt(moment(birthArr).fromNow());
			if(age >= 18) resolve();
			else reject("Операция недоступна лицам моложе 27 лет");  
		});
	})
	promise.then(async ()=>{
		
		let query =  await new Promise( (resolve, reject) => db.query("SELECT client_credit.`Ежемесячный платеж, BYR`, client.`MonthlyIncome` FROM client LEFT JOIN client_credit ON client_credit.idClient = client.idClient WHERE client.idClient = " 
	      + req.params.id, (err, response) => {
	        
	        if (err) {
	          reject(err.message);
	        } else {
	          let creditsPayment = response.reduce((pV, cV) => pV + +cV['Ежемесячный платеж, BYR'], 0);
	          let actualIncome = +response[0].MonthlyIncome - creditsPayment;

	          if (actualIncome - req.body['Ежемесячный платеж, BYR'] >= response[0].MonthlyIncome / 2 ) {
	            resolve(); 
	          } else {
	          	reject('Ошибка! Выплаты по кредитам не должны составлять более половины суммы ежемесячного дохода.');
	          }
	        } 
	    }));
		}).then((e) =>  {

		let data = {"Название счета": "Кредитный счет", "Номер счета": accountNumber, "Тип": "А", "Дебет": creditSum, "Кредит": creditSum};
		let data2 = {"Название счета": "Процентный кредитный счет", "Номер счета": percentsAccountNumber, "Тип": "А", "Дебет": '0', "Кредит": '0'};
		
		let addAccountQuery = db.query("INSERT INTO accounts SET ?", data, (err, response) => {
			if (err) console.log(err.message);
		});

		let addPercentsAccountQuery = db.query("INSERT INTO accounts SET ?", data2, (err, response) => {
			if (err) console.log(err.message);
		});


		let updateCashbox = db.query('SELECT `Дебет`, `Кредит` FROM accounts WHERE `Название счета` = "Касса"', (err, response) => {
			if (err)  console.log(err.message);
			
			response[0]['Дебет'] ? response[0]['Дебет'] : response[0]['Дебет'] = 0; 
			response[0]['Кредит'] ? response[0]['Кредит'] : response[0]['Кредит'] = 0; 
			let dSum = +response[0]['Дебет'] + +creditSum;
			let cSum = +response[0]['Кредит'] + +creditSum;
			
			db.query('UPDATE accounts SET `Дебет` = ' + dSum + ', `Кредит` = ' + cSum + ' WHERE `Название счета` = "Касса"', (err, resp) => {if (err)  console.log(err.message);});
		});

		let updateGrowFond = db.query('SELECT `Дебет` FROM accounts WHERE `Название счета` = "Фонд развития"', (err, response) => {
			if (err)  console.log(err.message);
			
			response[0]['Дебет'] ? response[0]['Дебет'] : response[0]['Дебет'] = 0 
			let sum = +response[0]['Дебет'] + +creditSum;

			db.query('UPDATE accounts SET `Дебет` = ' + sum + ' WHERE `Название счета` = "Фонд развития"', (err, resp) => {if (err)  console.log(err.message);});
		});
	}).then(async() => {
		req.body['Номер текущего счета'] = accountNumber;
		req.body['Номер процентного счета'] = percentsAccountNumber;
		let query = await new Promise((resolve, reject) => db.query("INSERT INTO client_credit SET?", req.body, (err, response) => {
      
	      if (err) {
	      	throw new Error(err);
	        //reject('Ошибка запроса к базе данных');  
	      } else {
			FO.add(db, bankFondAccount, accountNumber, creditSum, "Перечисление суммы по кредиту из фонда развития банка на текущий счет");
			FO.add(db, accountNumber, cashBoxAccount, creditSum, "Перечисление суммы по кредиту с текущего счета в кассу");
	      	FO.add(db, cashBoxAccount, '-', creditSum, "Выплата суммы по кредиту клиенту из кассы");
	      	resolve();
	      } 
    	}));
	})
	.then(() => {
		let query = db.query('SELECT * FROM client_credit WHERE idClient = ' + req.params.id + ' and `Номер процентного счета` = ' + percentsAccountNumber, (err, response) => {
			if (err) console.log(err.message);
			res.send(response);
		})
	}).catch((message) => res.send(message));
}


function accountGenerator () {
	const creditAcc = 2400;
	let FINAL_NUMBERS = Math.ceil(Math.random() * 10000000001);
	return creditAcc + "" + FINAL_NUMBERS;

}

module.exports = {addCredit: addCredit};