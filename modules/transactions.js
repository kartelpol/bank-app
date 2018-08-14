const FO = require('./financialOperations');

let getAll = function(req, res, db) {
	console.log('---->req');
	db.query('SELECT `Счет №1`, `Счет №2`, `Описание операции`, `Сумма` FROM financial_operations', (err, response) => {
		if (err) throw err;
		console.log(response);
		res.send(response);
	})
}

let executeAll = function(req, res, db) {
	Promise.all([executeCredits(req, res, db), executeDeposits(req, res, db)]).then(() => res.send('Все операции проведены успешно'));
}


let executeCredits = function(req, res, db) {
	const cashBoxAccount = '1010345573243';
	const bankFondAccount = '7327111111111111';
	let operations = [];

	return new Promise(async(resolve, reject) => {
		await new Promise((_resolve, reject) => {
			db.query('SELECT client_credit.*, `Процентная ставка`, `Срок кредитования, месяц` FROM client_credit LEFT JOIN credit ON client_credit.idCredit = credit.idCredit WHERE Статус = "активный"',
			(err, response) => {
				if (err) throw err;
				let operations = removeEndedCredits(response, db);
/*				response.filter((operation) => {
					return +operation['Погашенная сумма'] >= +operation['Сумма кредита, BYR']
				});*/
				
				resolve(operations);
			});
		});
	}).then(async(operations) => {

		operations.forEach(async(operation) => {
			let creditOnPercentAccount,	debetOnPercentAccount;
			let creditOnMainAccount,	debetOnMainAccount;
			let creditOnBankFond,	debetOnBankFond;
			let creditOnCashBox,	debetOnCashBox;

			let percentAccount = operation['Номер процентного счета'];
			let mainAccount = operation['Номер текущего счета'];

			let calculation = creditPaymentCounter(operation['Сумма кредита, BYR'], operation['Погашенная сумма'], operation['Процентная ставка'], operation['Срок кредитования, месяц'], operation['Ежемесячный платеж, BYR']);
			
			db.query('UPDATE client_credit  SET `Погашенная сумма` = "' + calculation.payedSum + '" WHERE idClient_credit = ' + operation.idClient_credit);

			await new Promise((_resolve, reject)=> {
				db.query('SELECT * FROM accounts  WHERE `Номер счета` = ' + percentAccount, (err, respons) => {
					if (err) reject(err);
	
					creditOnPercentAccount = +respons[0]["Кредит"] + +calculation.percentToPay;
					debetOnPercentAccount = +respons[0]["Дебет"] + +calculation.percentToPay;
					creditOnPercentAccount.toFixed(2);
					debetOnPercentAccount.toFixed(2);
				});

				db.query('SELECT * FROM accounts WHERE `Название счета` = "Фонд развития"', (err, response) => {
					if (err) reject(err.message);

					creditOnBankFond = +response[0]["Кредит"] + +calculation.percentToPay;
					creditOnBankFond.toFixed(2);
				});

				db.query('SELECT * FROM accounts WHERE `Название счета` = "Касса"', (err, response) => {
					if (err) reject(err.message);

					creditOnCashBox = +response[0]["Кредит"] + +calculation.percentToPay;
					debetOnCashBox = +response[0]["Дебет"] + +calculation.percentToPay;
					creditOnCashBox.toFixed(2);
					debetOnCashBox.toFixed(2);

					_resolve();
				});

			}).catch((err) => res.send(err.message));


			db.query('UPDATE accounts SET `Кредит` = '+ creditOnCashBox + ', `Дебет` = ' + debetOnCashBox + ' WHERE `Название счета` = "Касса"', (err, response) => {
				if (err) throw err;
			});

			db.query('UPDATE accounts SET `Кредит` = '+ creditOnPercentAccount +', `Дебет` = ' + debetOnPercentAccount + ' WHERE `Номер счета` = ' + percentAccount, (err, response) => {
				if (err) throw err;
			});

			db.query('UPDATE accounts SET `Кредит` = '+ creditOnBankFond + ' WHERE `Название счета` = "Фонд развития"');

			FO.add(db, '-', cashBoxAccount, calculation.percentToPay, "Оплата процентов по кредиту в кассе");
			FO.add(db, cashBoxAccount, percentAccount, calculation.percentToPay, "Перевод процентов по кредиту из кассы на процентный счет клиента");
			FO.add(db, percentAccount, bankFondAccount, calculation.percentToPay, "Перевод процентов по кредиту c процентного счета клиента в фонд развития банка");

			await new Promise((resolve, reject)=> {
				db.query('SELECT * FROM accounts  WHERE `Номер счета` = ' + mainAccount, (err, response) => {
					if (err) reject(err.message);
					creditOnMainAccount = +response[0]["Кредит"] + +calculation.mainSumToPay;
					debetOnMainAccount = +response[0]["Дебет"] + +calculation.mainSumToPay;
					creditOnMainAccount = creditOnMainAccount.toFixed(2);
					debetOnMainAccount = debetOnMainAccount.toFixed(2);
					resolve();
				});

				creditOnCashBox = +creditOnCashBox + +calculation.mainSumToPay;
				creditOnCashBox.toFixed(2);
				debetOnCashBox = +debetOnCashBox + +calculation.mainSumToPay;
				debetOnCashBox.toFixed(2);
				creditOnBankFond = +creditOnBankFond + +calculation.mainSumToPay;
				creditOnBankFond.toFixed(2);

			}).catch((err) => res.send(err.message));

			
			db.query('UPDATE accounts SET `Кредит` = '+ creditOnCashBox + ', `Дебет` = ' + debetOnCashBox + ' WHERE `Название счета` = "Касса"');
			db.query('UPDATE accounts SET `Кредит` = '+ creditOnMainAccount +', `Дебет` = ' + debetOnMainAccount + ' WHERE `Номер счета` = ' + mainAccount);
			db.query('UPDATE accounts SET `Кредит` = '+ creditOnBankFond + ' WHERE `Название счета` = "Фонд развития"');

			FO.add(db, '-', cashBoxAccount, calculation.mainSumToPay, "Оплата основной суммы по кредиту в кассе");
			FO.add(db, cashBoxAccount, mainAccount, calculation.mainSumToPay, "Перевод  основной суммы по кредиту из кассы на текущий счет клиента");
			FO.add(db, mainAccount, bankFondAccount, calculation.mainSumToPay, "Перевод  основной суммы по кредиту c текущего счета клиента в фонд развития банка");
		});

	}).catch((err) => {
		res.send(err.message);
	})
}


let executeDeposits =  function(req, res, db) {
	const cashBoxAccount = '1010345573243';
	const bankFondAccount = '7327111111111111';
	let operations = [];
	return new Promise(async (resolve, reject) => { 

		let promise = await new Promise((_resolve, reject) => { 
			db.query('SELECT client_investment.*, `Процентная ставка`, `Срок вклада (в месяцах)` FROM client_investment LEFT JOIN investment ON client_investment.idInvestment = investment.idInvestment WHERE Статус = "активный"', 
			(err, response) => {
				if (err) throw err;
				removeEndedDeposits(response, db);
				
				operations = response.filter((operation) => {
					return +operation['Начисленные проценты'] < +operation['Проценты, BYR'];
				});
				resolve();

			});
		});
	}).then(() => { 
		operations.forEach(async(operation) => {

			let monthNumber = ++operation['Проведено начислений'];
			let sum = operation['Первоначальный размер вклада, BYR'];
			let percent = +operation['Процентная ставка'];
			let term = operation['Срок вклада (в месяцах)'];

			if (monthNumber > term) percent = 0.01;

			let newPercents = +sum * Math.pow(1 + (+percent * 30 / 100 / 365), +monthNumber) - +sum;
			newPercents = newPercents.toFixed(2);
			let percentsOnlyForThisMonth = newPercents - +operation['Начисленные проценты'];
			percentsOnlyForThisMonth.toFixed(2);

			let percentAccount = operation['Номер процентного счета'];
			let creditOnPercentAccount, debetOnBankFond;
		

			await new Promise((resolve, reject)=> {
				db.query('SELECT * FROM accounts  WHERE `Номер счета` = ' + percentAccount, (err, response) => {
					if (err) throw err;
					creditOnPercentAccount = +response[0]["Кредит"] + percentsOnlyForThisMonth;
					creditOnPercentAccount.toFixed(2);
				});


				db.query('SELECT * FROM accounts WHERE `Название счета` = "Фонд развития"', (err, response) => {
					if (err) throw err;
					debetOnBankFond = +response[0]["Дебет"] + +percentsOnlyForThisMonth;
					debetOnBankFond.toFixed(2);
					resolve();
				});
			});


			db.query('UPDATE accounts  SET `Кредит` = "' + creditOnPercentAccount + '" WHERE `Номер счета` = ' + percentAccount, (err, response) => {
				if (err) throw err;
			});

			db.query('UPDATE client_investment  SET `Начисленные проценты` = "' + newPercents + '", `Проведено начислений` = "' + monthNumber + '" WHERE `Номер процентного счета` = ' + percentAccount, (err, response) => {
				if (err) throw err;
			});


			db.query('UPDATE accounts SET `Дебет` = ' + debetOnBankFond + ' WHERE `Название счета` = "Фонд развития"', (err, response) => {
				if (err) throw err;
			});

			FO.add(db, bankFondAccount, percentAccount, percentsOnlyForThisMonth, "Перечисление процентов по депозиту из фонда развития банка на процентный счет");
		});
	}).catch((err) => res.send(err.message));
}


let removeEndedDeposits = async function (operations, db) {
	const cashBoxAccount = '1010345573243';
	const bankFondAccount = '7327111111111111';
	let refreshedOperations = operations.filter(async(operation) => {
		
		if (+operation['Начисленные проценты'] >= +operation['Проценты, BYR']) {
			db.query('UPDATE client_investment SET `Статус` = "закрыт" WHERE idClient_investment = ' + operation.idClient_investment,
			(err, response) => {
				if (err) throw err;
			});

			let creditOnCashBox, debetOnCashBox;
			let debetOnMainAccount, creditOnMainAccount;
			let debetOnPercentAccount, debetOnBankFond;

			await new Promise(async(resolve, reject) => {

				await new Promise((_resolve, reject) => {

					db.query('SELECT * FROM accounts WHERE `Название счета` = "Фонд развития"', (err, response) => {
						if (err) throw err;
						debetOnBankFond = +response[0]['Дебет'] + +operation['Итоговая сумма, BYR'];
						debetOnBankFond.toFixed(2);
					});

					db.query('SELECT * FROM accounts WHERE `Номер счета` = ' + operation['Номер текущего счета'], (err, response) => {
						if (err) throw err;
						debetOnMainAccount = +response[0]['Дебет'] + +operation['Итоговая сумма, BYR'];
						creditOnMainAccount = +response[0]['Кредит'] + +operation['Итоговая сумма, BYR'];
						creditOnMainAccount.toFixed(2);
						debetOnMainAccount.toFixed(2);
					});

					db.query('SELECT * FROM accounts WHERE `Номер счета` = ' + operation['Номер процентного счета'], (err, response) => {
						if (err) throw err;
						debetOnPercentAccount = +response[0]['Дебет'] + +operation['Начисленные проценты'];
						debetOnPercentAccount.toFixed(2);
					});

					db.query('SELECT * FROM accounts WHERE `Название счета` = "Касса"', (err, response) => {
						if (err) throw err;
						debetOnCashBox = +response[0]['Дебет'] + +operation['Итоговая сумма, BYR'] + +operation['Начисленные проценты'];
						creditOnCashBox = +response[0]['Кредит'] + +operation['Итоговая сумма, BYR'] + +operation['Начисленные проценты'];
						debetOnCashBox.toFixed(2);
						creditOnCashBox.toFixed(2);
						_resolve();
					});
				});

				db.query('UPDATE accounts  SET `Дебет` = "' + debetOnBankFond + '" WHERE `Название счета` = "Фонд развития"', (err, response) => {
					if (err) throw err;
				});

				db.query('UPDATE accounts  SET `Кредит` = "' + creditOnMainAccount + '", `Дебет` = "' + debetOnMainAccount + '" WHERE `Номер счета` = ' + operation['Номер текущего счета'], (err, response) => {
					if (err) throw err;
				});

				db.query('UPDATE accounts  SET `Дебет` = "' + debetOnPercentAccount + '" WHERE `Номер счета` = ' + operation['Номер процентного счета'], (err, response) => {
					if (err) throw err;
				});

				db.query('UPDATE accounts  SET `Кредит` = "' + creditOnCashBox + '", `Дебет` = "' + debetOnCashBox + '" WHERE `Название счета` = "Касса"', (err, response) => {
					if (err) throw err;
					resolve();
				});


				FO.add(db, bankFondAccount, operation['Номер текущего счета'], operation['Первоначальный размер вклада, BYR'], "Перечисление суммы по депозиту из фонда развития банка на текущий счет клиента");
				FO.add(db, operation['Номер текущего счета'], cashBoxAccount, operation['Первоначальный размер вклада, BYR'], "Перечисление суммы по депозиту c текущего счета клиента в кассу");
				FO.add(db, operation['Номер процентного счета'], cashBoxAccount, operation['Начисленные проценты'], "Перечисление процентов по депозиту c процентного счета клиента в кассу");
				FO.add(db, cashBoxAccount, '-', operation['Итоговая сумма, BYR'], "Выплата итоговой суммы по депозиту из кассы клиенту");
			});

			//db.query('DELETE FROM accounts WHERE `Номер счета` = ' + operation['Номер текущего счета']);
			//db.query('DELETE FROM accounts WHERE `Номер счета` = ' + operation['Номер процентного счета']);

		} else return operation;
	});

	return refreshedOperations;
}

let removeEndedCredits = function(operations, db) {
	let refreshedOperations = operations.filter((operation) => {

		if (+operation['Погашенная сумма'] >= +operation['Сумма кредита, BYR']) {
			db.query('UPDATE client_credit SET `Статус` = "погашен"	WHERE idClient_credit = ' + operation.idClient_credit, 
			(err, response) => {
				if (err) throw err;
			});

			//db.query('DELETE FROM accounts WHERE `Номер счета` = ' + operation['Номер текущего счета']);
			//db.query('DELETE FROM accounts WHERE `Номер счета` = ' + operation['Номер процентного счета']);

		} else return operation;
	});
	return refreshedOperations;
}


let creditPaymentCounter = function(creditSum, payedSum, percent, term, monthlyPayment) {
	let results = {};
	let restOfCreditSum = +creditSum - +payedSum;

	results.percentToPay = restOfCreditSum * +percent / 100 / 12;
	results.percentToPay.toFixed(2) !== '0.00' ? results.percentToPay = results.percentToPay.toFixed(2) : results.percentToPay = '0.01';

	results.mainSumToPay = +monthlyPayment - results.percentToPay;
	results.mainSumToPay.toFixed(2);

	results.payedSum = (+payedSum + results.mainSumToPay);
	results.payedSum = results.payedSum.toFixed(2);

	return results;
}

module.exports = {
	executeAll: executeAll,
	getAll: getAll
}