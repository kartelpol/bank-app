function getAllCredits (req, res, db) {
	let query = db.query('SELECT `Название кредита` FROM credit', (err, response) => {
		if(err) {
			throw err;
			res.end();
		} else if(response.length) {
			res.send(response);
		} else res.send('Нет доступных кредитов');
	});
}



function getClientsCredits (req, res, db) {
  let query = db.query('SELECT credit.*, client_credit.*  FROM bank.credit, bank.client_credit WHERE client_credit.idClient = ' + req.params.id + ' and client_credit.idCredit = credit.idCredit', (err, response) => {
    if(err) {
      throw err;
      res.end();
    } else if(response.length) {
      res.send(response);
    } else res.send('No active credits');
  });
}


function getCreditInfo (req, res, db) {
  let query = db.query('SELECT * FROM credit WHERE `Название кредита` = \'' + req.params.name + '\'', (err, response) => {
    if(err) {
      throw err;
      res.end();
    } else if(response.length) {
      res.send(response);
    } else res.send('Нет доступных кредитов');
  });
}


let validateCredit = (req, res, db) => {
  return new Promise((resolve, reject) => {
    let query = db.query("SELECT client_credit.`Ежемесячный платеж, BYR`, client.`MonthlyIncome` FROM client_credit, client WHERE client.idClient = " 
      + req.params.id + " and client_credit.idClient = client.idClient", (err, response) => {
        if(err) {
          reject(err.message);
        } else {
          let creditsPayment = response.reduce((pV, cV) => pV + +cV['Ежемесячный платеж, BYR'], 0);
          
          let actualIncome = +response[0].MonthlyIncome - creditsPayment;

          if( actualIncome - req.body['Ежемесячный платеж, BYR'] >= response[0].MonthlyIncome / 2) {
            resolve(true);
          } else resolve(false);
        } 
    });
  }).then()
}


async function addCredit (req, res, db) {
  let permission = await validateCredit(req, res, db).catch( error => { res.send(error); return; } );
  if(permission) {
    let query = db.query("INSERT INTO client_investment SET?", req.body, (err, response) => {
      if (err) {
        res.send('Error. Check your data and try again.');
        throw err;  
      } else res.send('Deposit is successfuly added');
    });
  }
}

module.exports = {
  getAllCredits: getAllCredits,
  getClientsCredits: getClientsCredits,
  getCreditInfo: getCreditInfo,
  addCredit: addCredit
}